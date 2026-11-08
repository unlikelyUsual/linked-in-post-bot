import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerationConfig,
  type GenerativeModel,
  type ResponseSchema,
} from "@google/generative-ai";
import type { SystemDesignPost } from "../types/systemDesign.ts";

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"] as const;
const MAX_ATTEMPTS_PER_MODEL = 3;
const RETRY_DELAY_MS = 1_000;

const systemDesignSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    content: { type: SchemaType.STRING },
    diagram: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        components: {
          type: SchemaType.ARRAY,
          minItems: 4,
          maxItems: 9,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                format: "enum",
                enum: ["client", "service", "data", "queue", "external"],
              },
            },
            required: ["id", "name", "type"],
          },
        },
        connections: {
          type: SchemaType.ARRAY,
          minItems: 3,
          maxItems: 16,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              from: { type: SchemaType.STRING },
              to: { type: SchemaType.STRING },
              label: { type: SchemaType.STRING },
            },
            required: ["from", "to", "label"],
          },
        },
      },
      required: ["title", "components", "connections"],
    },
  },
  required: ["content", "diagram"],
};

interface GeminiModel {
  name: string;
  model: GenerativeModel;
}

const getHttpStatus = (error: unknown): number | undefined => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
};

const isRetryableError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  const status = getHttpStatus(error);
  return (
    status === 408 ||
    status === 429 ||
    (status !== undefined && status >= 500)
  );
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const validateSystemDesign = (value: unknown): SystemDesignPost => {
  if (!value || typeof value !== "object") {
    throw new Error("Response must be an object");
  }

  const post = value as Partial<SystemDesignPost>;
  const { content, diagram } = post;
  if (
    typeof content !== "string" ||
    !content.trim() ||
    !diagram ||
    typeof diagram.title !== "string" ||
    !diagram.title.trim() ||
    !Array.isArray(diagram.components) ||
    !Array.isArray(diagram.connections)
  ) {
    throw new Error("Response is missing post or diagram fields");
  }

  if (
    diagram.components.length < 4 ||
    diagram.components.length > 9 ||
    diagram.connections.length < 3 ||
    diagram.connections.length > 16
  ) {
    throw new Error("Diagram must have 4-9 components and 3-16 connections");
  }

  const componentIds = new Set<string>();
  for (const component of diagram.components) {
    if (
      !component ||
      typeof component.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id) ||
      typeof component.name !== "string" ||
      !component.name.trim() ||
      component.name.length > 36 ||
      !["client", "service", "data", "queue", "external"].includes(
        component.type,
      ) ||
      componentIds.has(component.id)
    ) {
      throw new Error("Diagram contains an invalid or duplicate component");
    }
    componentIds.add(component.id);
  }

  for (const connection of diagram.connections) {
    if (
      !connection ||
      !componentIds.has(connection.from) ||
      !componentIds.has(connection.to) ||
      connection.from === connection.to ||
      typeof connection.label !== "string" ||
      connection.label.length > 32
    ) {
      throw new Error("Diagram contains an invalid connection");
    }
  }

  return {
    content: content.trim(),
    diagram: {
      title: diagram.title.trim().slice(0, 72),
      components: diagram.components,
      connections: diagram.connections,
    },
  };
};

export class GeminiService {
  private readonly models: GeminiModel[];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.models = MODELS.map((name) => ({
      name,
      model: genAI.getGenerativeModel({ model: name }),
    }));
  }

  /**
   * Generate content using Gemini API
   * @param prompt - The prompt to send to Gemini
   * @param maxTokens - Maximum number of tokens to generate (optional)
   * @returns Generated content as string
   */
  async generateContent(prompt: string, maxTokens?: number): Promise<string> {
    const text = await this.generateWithFallback(prompt, {
      ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
    });

    if (!text) {
      throw new Error("No content generated from Gemini API");
    }

    return text;
  }

  async generateSystemDesign(
    prompt: string,
    maxTokens?: number,
  ): Promise<SystemDesignPost> {
    const text = await this.generateWithFallback(prompt, {
      ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
      responseMimeType: "application/json",
      responseSchema: systemDesignSchema,
    });

    try {
      return validateSystemDesign(JSON.parse(text));
    } catch (error) {
      throw new Error(
        `Gemini returned an invalid system design response: ${getErrorMessage(error)}`,
      );
    }
  }

  private async generateWithFallback(
    prompt: string,
    generationConfig: GenerationConfig,
  ): Promise<string> {
    try {
      for (const [modelIndex, { name, model }] of this.models.entries()) {
        try {
          const text = await this.generateWithRetry(
            model,
            name,
            prompt,
            generationConfig,
          );
          return text;
        } catch (error) {
          if (
            !isRetryableError(error) ||
            modelIndex === this.models.length - 1
          ) {
            throw error;
          }
          console.warn(
            `${name} unavailable after retries; falling back to ${this.models[modelIndex + 1].name}.`,
          );
        }
      }

      throw new Error("All Gemini models failed to generate content");
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate content: ${getErrorMessage(error)}`);
    }
  }

  private async generateWithRetry(
    model: GenerativeModel,
    modelName: string,
    prompt: string,
    generationConfig: GenerationConfig,
  ): Promise<string> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        });
        return result.response.text();
      } catch (error) {
        if (!isRetryableError(error) || attempt === MAX_ATTEMPTS_PER_MODEL) {
          throw error;
        }

        const delay = RETRY_DELAY_MS * attempt;
        console.warn(
          `${modelName} request failed temporarily; retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL}).`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(`${modelName} failed after retries`);
  }

  /**
   * Generate content with streaming (for future enhancement)
   * @param prompt - The prompt to send to Gemini
   * @returns Async generator yielding content chunks
   */
  async *generateContentStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.models[0].model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }

    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw new Error(`Failed to stream content: ${getErrorMessage(error)}`);
    }
  }
}
