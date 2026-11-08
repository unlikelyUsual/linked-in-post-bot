import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { GeminiService } from "./gemini.service.ts";
import type { SystemDesignPost } from "../types/systemDesign.ts";

describe("GeminiService system design generation", () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: originalFetch,
    });
    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  });

  it("parses a structured post and architecture diagram from Gemini", async () => {
    const expected = {
      content: "How would you design a URL shortener?",
      diagram: {
        title: "URL Shortener",
        components: [
          { id: "client", name: "Web Client", type: "client" },
          { id: "api", name: "API Gateway", type: "service" },
          { id: "service", name: "Shortener", type: "service" },
          { id: "cache", name: "Cache", type: "data" },
          { id: "database", name: "Database", type: "data" },
        ],
        connections: [
          { from: "client", to: "api", label: "request" },
          { from: "api", to: "service", label: "forward" },
          { from: "service", to: "cache", label: "lookup" },
          { from: "cache", to: "database", label: "cache miss" },
        ],
      },
    } satisfies SystemDesignPost;
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: async () =>
        Response.json({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(expected) }],
                role: "model",
              },
              finishReason: "STOP",
              index: 0,
            },
          ],
        }),
    });

    const generated = await new GeminiService().generateSystemDesign(
      "Design a URL shortener",
    );

    expect(generated).toEqual(expected);
  });

  it("rejects diagrams with connections to unknown components", async () => {
    const invalid = {
      content: "System design post",
      diagram: {
        title: "Invalid design",
        components: [
          { id: "one", name: "One", type: "client" },
          { id: "two", name: "Two", type: "service" },
          { id: "three", name: "Three", type: "data" },
          { id: "four", name: "Four", type: "queue" },
        ],
        connections: [
          { from: "one", to: "two", label: "valid" },
          { from: "two", to: "three", label: "valid" },
          { from: "three", to: "missing", label: "invalid" },
        ],
      },
    };
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: async () =>
        Response.json({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(invalid) }],
                role: "model",
              },
              finishReason: "STOP",
              index: 0,
            },
          ],
        }),
    });

    await expect(
      new GeminiService().generateSystemDesign("Design a system"),
    ).rejects.toThrow("Diagram contains an invalid connection");
  });
});
