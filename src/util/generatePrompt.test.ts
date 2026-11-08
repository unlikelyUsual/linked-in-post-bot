import { describe, expect, it } from "bun:test";
import { generateCustomPrompt, generatePrompt } from "./generatePrompt.ts";

describe("system-design post prompts", () => {
  const originalRandom = Math.random;

  it("uses interview system-design topics and requests a diagram schema", () => {
    try {
      Math.random = () => 0;
      const prompt = generatePrompt();

      expect(prompt).toContain("Design a URL shortener like Bitly");
      expect(prompt).toContain("high-level system design interview post");
      expect(prompt).toContain('"components"');
      expect(prompt).toContain('"connections"');
    } finally {
      Math.random = originalRandom;
    }
  });

  it("keeps custom topics in the system-design post format", () => {
    try {
      Math.random = () => 0;
      const prompt = generateCustomPrompt("Design a food delivery platform");

      expect(prompt).toContain("Design a food delivery platform");
      expect(prompt).toContain("Diagram requirements");
      expect(prompt).toContain("Return ONLY valid JSON");
    } finally {
      Math.random = originalRandom;
    }
  });
});
