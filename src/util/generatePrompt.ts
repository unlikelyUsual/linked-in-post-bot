const TOPICS = [
  "bun runtime",
  "javascript",
  "node.js",
  "PostgreSQL",
  "AWS Lambda",
  "TypeScript",
  "React",
  "Next.js",
  "Docker",
  "Kubernetes",
  "Microservices",
  "GraphQL",
  "REST API",
  "CI/CD",
  "DevOps",
  "Cloud Computing",
  "Serverless",
  "Web Performance",
  "Code Quality",
  "Testing Best Practices",
];

const POST_STYLES = [
  "Share an insightful tip about",
  "Discuss a common mistake developers make with",
  "Explain why",
  "Share a recent learning experience with",
  "Discuss the benefits of using",
  "Compare different approaches to",
  "Share best practices for",
  "Discuss the future of",
  "Explain how to get started with",
  "Share an interesting use case for",
];

const POST_TONES = [
  "Keep it professional and informative",
  "Make it engaging and conversational",
  "Write in a teaching style",
  "Share a personal experience or story",
  "Use a problem-solving approach",
  "Keep it concise and to the point",
];

const CONTENT_REQUIREMENTS = [
  "Include relevant hashtags at the end",
  "Add a call-to-action or question to engage readers",
  "Keep it under 1300 characters for optimal engagement",
  "Use line breaks for better readability",
  "Include emojis sparingly to add personality",
];

/**
 * Generates a randomized prompt for creating LinkedIn posts
 * @returns A detailed prompt string for the AI to generate content
 */
export const generatePrompt = (): string => {
  // Randomly select elements
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const style = POST_STYLES[Math.floor(Math.random() * POST_STYLES.length)];
  const tone = POST_TONES[Math.floor(Math.random() * POST_TONES.length)];
  const requirement =
    CONTENT_REQUIREMENTS[
      Math.floor(Math.random() * CONTENT_REQUIREMENTS.length)
    ];

  // Generate comprehensive prompt
  const prompt = `Create a professional LinkedIn post about ${topic}.

Style: ${style} ${topic}.

Tone: ${tone}.

Requirements:
- ${requirement}
- Make it valuable for software developers and tech professionals
- Ensure it provides actionable insights or knowledge
- Keep the content authentic and original
- Focus on practical value rather than promotional content

The post should be ready to publish as-is, with proper formatting for LinkedIn.`;

  return prompt;
};

/**
 * Generates a custom prompt based on specific topic
 * @param topic The specific topic to generate content about
 * @returns A detailed prompt string
 */
export const generateCustomPrompt = (topic: string): string => {
  const style = POST_STYLES[Math.floor(Math.random() * POST_STYLES.length)];
  const tone = POST_TONES[Math.floor(Math.random() * POST_TONES.length)];

  return `Create a professional LinkedIn post about ${topic}.

Style: ${style} ${topic}.

Tone: ${tone}.

Requirements:
- Include relevant hashtags at the end
- Add a call-to-action or question to engage readers
- Keep it under 1300 characters for optimal engagement
- Use line breaks for better readability
- Make it valuable and actionable for the target audience

The post should be ready to publish as-is, with proper formatting for LinkedIn.`;
};
