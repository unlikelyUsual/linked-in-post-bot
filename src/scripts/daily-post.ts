#!/usr/bin/env bun
import dotenv from "dotenv";
import { GeminiService } from "../services/gemini.service.ts";
import { LinkedInService } from "../services/linkedin.service.ts";
import { generatePrompt } from "../util/generatePrompt.ts";

// Load environment variables
dotenv.config();

/**
 * Daily automated LinkedIn post script
 * This script is executed by GitHub Actions daily at 9 AM
 */
async function runDailyPost() {
  try {
    console.log("🚀 Starting daily LinkedIn post generation...");
    console.log(`⏰ Current time: ${new Date().toISOString()}`);

    // Initialize services
    const geminiService = new GeminiService();
    const linkedInService = new LinkedInService();

    // Check if services are configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    if (!linkedInService.isConfigured()) {
      throw new Error(
        "LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in environment variables.",
      );
    }

    // Generate prompt
    const prompt = generatePrompt();
    console.log("🎯 Generated prompt:", prompt);

    // Generate content using Gemini
    console.log("✨ Generating content with Gemini...");
    const content = await geminiService.generateContent(prompt);
    console.log("📝 Generated content:", content);
    console.log(`📊 Content length: ${content.length} characters`);

    // Post to LinkedIn
    console.log("📤 Posting to LinkedIn...");
    const linkedInResponse = await linkedInService.sharePost(content);

    console.log("✅ Post successfully published to LinkedIn!");
    console.log(`🆔 Post ID: ${linkedInResponse.id}`);
    console.log(`📊 Post state: ${linkedInResponse.lifecycleState}`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);

    // Output summary for GitHub Actions
    console.log("\n=== Summary ===");
    console.log(`Status: Success`);
    console.log(`Content Length: ${content.length} characters`);
    console.log(`LinkedIn Post ID: ${linkedInResponse.id}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error in daily post generation:", error);
    console.error("Error details:", error.message);

    // Output error summary for GitHub Actions
    console.log("\n=== Summary ===");
    console.log(`Status: Failed`);
    console.log(`Error: ${error.message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    process.exit(1);
  }
}

// Run the script
runDailyPost();
