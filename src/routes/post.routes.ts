import { Router, type Request, type Response } from "express";
import { GeminiService } from "../services/gemini.service.ts";
import { LinkedInService } from "../services/linkedin.service.ts";
import { renderSystemDesignImage } from "../services/system-design-image.service.ts";
import {
  generateCustomPrompt,
  generatePrompt,
} from "../util/generatePrompt.ts";

const router = Router();
const geminiService = new GeminiService();
const linkedInService = new LinkedInService();

/**
 * POST /api/post/new-post
 * Generate content using Gemini API and post to LinkedIn
 */
router.post("/new-post", async (req: Request, res: Response) => {
  try {
    const { topic, maxTokens, dryRun } = req.body;

    // Generate prompt - use custom topic if provided, otherwise random
    const prompt = topic ? generateCustomPrompt(topic) : generatePrompt();

    console.log("Generated prompt:", prompt);

    // Generate content using Gemini
    const systemDesign = await geminiService.generateSystemDesign(
      prompt,
      maxTokens,
    );
    const image = await renderSystemDesignImage(systemDesign.diagram);
    const content = systemDesign.content;

    console.log("Generated content:", content);

    // Check if this is a dry run (generate only, don't post)
    if (dryRun) {
      return res.json({
        success: true,
        message: "Content generated successfully (dry run - not posted)",
        data: {
          content,
          diagramTitle: systemDesign.diagram.title,
          diagram: systemDesign.diagram,
          imagePreview: `data:image/png;base64,${image.toString("base64")}`,
          prompt,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Post to LinkedIn
    if (!linkedInService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message:
          "LinkedIn credentials not configured. Set LINKEDIN_PERSON_URN and either LINKEDIN_ACCESS_TOKEN or LINKEDIN_REFRESH_TOKEN with LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET, or use dryRun: true to test without posting.",
        data: {
          content,
          diagramTitle: systemDesign.diagram.title,
          diagram: systemDesign.diagram,
          imagePreview: `data:image/png;base64,${image.toString("base64")}`,
          prompt,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const linkedInResponse = await linkedInService.sharePost(content, {
      data: image,
      title: systemDesign.diagram.title,
      description: `High-level system architecture: ${systemDesign.diagram.title}`,
    });

    res.json({
      success: true,
      message: "Content generated and posted to LinkedIn successfully",
      data: {
        content,
        diagramTitle: systemDesign.diagram.title,
        prompt,
        linkedInPostId: linkedInResponse.id,
        linkedInPostState: linkedInResponse.lifecycleState,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating/posting content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate or post content",
      error: error.message,
    });
  }
});

/**
 * GET /api/post/preview
 * Preview what kind of content will be generated (without posting)
 */
router.get("/preview-post", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Preview prompt generated",
      data: {
        user: await linkedInService.getUserProfile(),
      },
    });
  } catch (error: any) {
    console.error("Error generating preview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate preview",
      error: error.message,
    });
  }
});

/**
 * GET /api/post/status
 * Check if LinkedIn integration is configured
 */
router.get("/status", (_req: Request, res: Response) => {
  const isConfigured = linkedInService.isConfigured();

  res.json({
    success: true,
    data: {
      linkedInConfigured: isConfigured,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      message: isConfigured
        ? "All services are configured and ready"
        : "LinkedIn credentials missing. Set LINKEDIN_PERSON_URN and either LINKEDIN_ACCESS_TOKEN or LINKEDIN_REFRESH_TOKEN with LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
