const TOPICS = [
  "Design a URL shortener like Bitly",
  "Design a distributed rate limiter",
  "Design a notification delivery platform",
  "Design a real-time chat application",
  "Design a social media news feed",
  "Design a video streaming platform",
  "Design a ride-sharing service",
  "Design a cloud file storage service",
  "Design a typeahead search system",
  "Design a ticket booking platform",
  "Design a web crawler and search index",
  "Design a distributed job scheduler",
  "Design an event-driven e-commerce platform",
  "Design a payment processing system",
  "Design a metrics and log aggregation platform",
  "Design a collaborative document editor",
];

const POST_STYLES = [
  "Walk through a practical design decision for",
  "Explain a common interview pitfall when designing",
  "Compare two architectural approaches for",
  "Discuss the trade-offs involved in designing",
  "Explain how to scale",
  "Share an interview-ready high-level design for",
  "Highlight a reliability challenge in",
];

const POST_TONES = [
  "Keep it professional and informative",
  "Make it engaging and conversational",
  "Write in a teaching style",
  "Keep it interview-focused and practical",
  "Use a problem-solving approach",
  "Keep it concise and to the point",
];

const createPostPrompt = (
  topic: string,
  style: string,
  tone: string,
  includeCodeExample: boolean,
): string => `Create a professional LinkedIn high-level system design interview post about: ${topic}.

Angle: ${style} this system design.
Tone: ${tone}.
Post requirements:
- Explain the problem, key functional/non-functional requirements, high-level architecture, and 1-2 important trade-offs.
- Open with a specific, engaging hook and focus on one useful idea.
- Use short paragraphs and line breaks so the post is easy to scan.
- Keep design choices technically sound and explain why they fit the requirements. Avoid unsupported statistics.
- Do not invent personal interview or work experiences.
- Add a relevant question or call-to-action that invites meaningful discussion.
- Add 3-5 relevant hashtags at the end.
- Include up to 2 directly relevant references at the bottom. Prefer primary documentation or reputable sources, give each a descriptive title and its full URL, and never invent a source or URL. Omit references if you cannot confidently provide accurate URLs. Use plain URLs, not Markdown links.
- ${includeCodeExample ? "When a short code example genuinely clarifies the design, include a concise snippet in a fenced code block with a language label. Skip it if code would feel forced." : "Do not include a code snippet; focus on the design and trade-offs."}
- Keep the post ready to publish as plain text. LinkedIn may display code fences literally. Keep the post under 400 words and do not use emojis.

Diagram requirements:
- Create a clear architecture diagram for the system described in the post.
- Use 4-9 components with short, readable names. Use only these component types: client, service, data, queue, external.
- Use unique lowercase kebab-case component IDs. Connections must reference component IDs and describe the direction of data flow.
- Prefer a simple left-to-right request/data flow; avoid cycles and crossing connections where possible.

Return ONLY valid JSON matching this shape exactly:
{
  "content": "The LinkedIn post text",
  "diagram": {
    "title": "Short diagram title",
    "components": [
      { "id": "api", "name": "API Gateway", "type": "service" }
    ],
    "connections": [
      { "from": "api", "to": "database", "label": "read/write" }
    ]
  }
}`;

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
