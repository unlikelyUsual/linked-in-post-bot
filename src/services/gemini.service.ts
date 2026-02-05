import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });
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

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("No content generated from Gemini API");
      }

      return text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate content with streaming (for future enhancement)
   * @param prompt - The prompt to send to Gemini
   * @returns Async generator yielding content chunks
   */
  async *generateContentStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error: any) {
      console.error("Gemini Streaming Error:", error);
      throw new Error(`Failed to stream content: ${error.message}`);
    }
  }
}
