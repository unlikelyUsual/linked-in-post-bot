import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"] as const;
const MAX_ATTEMPTS_PER_MODEL = 3;
const RETRY_DELAY_MS = 1_000;

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
    try {
      const generationConfig = maxTokens ? { maxOutputTokens: maxTokens } : {};

      for (const [modelIndex, { name, model }] of this.models.entries()) {
        try {
          const text = await this.generateWithRetry(
            model,
            name,
            prompt,
            generationConfig,
          );
          if (!text) {
            throw new Error("No content generated from Gemini API");
          }
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
    generationConfig: { maxOutputTokens?: number },
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
