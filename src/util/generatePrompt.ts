const TOPICS = [
  "bun runtime",
  "javascript",
  "node.js",
  "PostgreSQL",
  "AWS Lambda",
  "TypeScript",
  "React",
  "Docker",
  "Kubernetes",
  "Microservices",
  "CI/CD",
  "DevOps",
  "Cloud Computing",
  "Serverless",
  "Web Performance",
];

const POST_STYLES = [
  "Share an insightful tip about",
  "Discuss a common mistake developers make with",
  "Share a recent learning experience with",
  "Compare different approaches to",
  "Discuss the future of",
  "Get latest blog about it and share about it",
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

/**
 * Generates a randomized prompt for creating LinkedIn posts
 * @returns A detailed prompt string for the AI to generate content
 */
export const generatePrompt = (): string => {
  // Randomly select elements
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const style = POST_STYLES[Math.floor(Math.random() * POST_STYLES.length)];
  const tone = POST_TONES[Math.floor(Math.random() * POST_TONES.length)];

  // Generate comprehensive prompt
  const prompt = `Create a professional LinkedIn post about ${topic}.

Style: ${style} ${topic}.
Tone: ${tone}.
Requirements:
- Include relevant hashtags at the end
- Add a call-to-action or question to engage readers
- Make it valuable and actionable for the target audience
- The post should be ready to publish as-is, with proper formatting for LinkedIn.
- Return only the content. That's all. Don't add emojis. Max words 400. 
- Add reference at the bottom, Keep reference at max 2`;

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
- Make it valuable and actionable for the target audience
- The post should be ready to publish as-is, with proper formatting for LinkedIn.
- Return only the content. That's all. Don't add emojis. Max words 400. 
- Add reference at the bottom, Keep reference at max 2`;
};
