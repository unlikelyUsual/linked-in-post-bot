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
  "Explain a useful idea or development in",
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

const createPostPrompt = (
  topic: string,
  style: string,
  tone: string,
  includeCodeExample: boolean,
): string => `Create a professional LinkedIn post about ${topic}.

Angle: ${style} ${topic}.
Tone: ${tone}.
Requirements:
- Open with a specific, engaging hook and focus on one useful idea.
- Use short paragraphs and line breaks so the post is easy to scan.
- Include practical, accurate takeaways; avoid generic claims and unsupported statistics.
- Do not invent personal experiences. Use a hypothetical or general example unless a real experience was provided.
- Add a relevant question or call-to-action that invites meaningful discussion.
- Add 3-5 relevant hashtags at the end.
- Include up to 2 directly relevant references at the bottom. Prefer primary documentation or reputable sources, give each a descriptive title and its full URL, and never invent a source or URL. Omit references if you cannot confidently provide accurate URLs. Use plain URLs, not Markdown links.
- ${includeCodeExample ? "When a short code example genuinely clarifies the topic, include a concise, valid snippet in a fenced code block with a language label, then briefly explain it. Skip the snippet if code would feel forced." : "Do not include a code snippet in this post; focus on the explanation and actionable takeaways."}
- Keep the post ready to publish as plain text. LinkedIn may display code fences literally, so do not rely on Markdown rendering.
- Return only the post content, with no emojis, and keep it under 400 words.`;

/**
 * Generates a randomized prompt for creating LinkedIn posts
 * @returns A detailed prompt string for the AI to generate content
 */
export const generatePrompt = (): string => {
  // Randomly select elements
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const style = POST_STYLES[Math.floor(Math.random() * POST_STYLES.length)];
  const tone = POST_TONES[Math.floor(Math.random() * POST_TONES.length)];
  const includeCodeExample = Math.random() < 0.35;

  return createPostPrompt(topic, style, tone, includeCodeExample);
};

/**
 * Generates a custom prompt based on specific topic
 * @param topic The specific topic to generate content about
 * @returns A detailed prompt string
 */
export const generateCustomPrompt = (topic: string): string => {
  const style = POST_STYLES[Math.floor(Math.random() * POST_STYLES.length)];
  const tone = POST_TONES[Math.floor(Math.random() * POST_TONES.length)];
  const includeCodeExample = Math.random() < 0.35;

  return createPostPrompt(topic, style, tone, includeCodeExample);
};
