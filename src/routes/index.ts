import { Router } from "express";
import postRoutes from "./post.routes.ts";

const router = Router();

// Mount route modules
router.use("/post", postRoutes);

// API info endpoint
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "LinkedIn Post Bot API",
    version: process.env.API_VERSION || "v1",
    endpoints: {
      post: {
        newPost:
          "POST /api/post/new-post - Generate and post content to LinkedIn",
        preview: "GET /api/post/preview - Preview prompt without posting",
        status: "GET /api/post/status - Check service configuration status",
      },
    },
    documentation: {
      newPost: {
        method: "POST",
        path: "/api/post/new-post",
        description: "Generate content using Gemini AI and post to LinkedIn",
        body: {
          topic: "(optional) Specific topic to write about",
          maxTokens: "(optional) Max tokens for content generation",
          dryRun: "(optional) Set to true to generate without posting",
        },
      },
    },
  });
});

export default router;
