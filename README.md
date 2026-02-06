# LinkedIn Post Bot - Bun Boilerplate

A modern Express API server built with **Bun runtime**, featuring Gemini AI integration for content generation and a linked API architecture for content forwarding.

## 🚀 Features

- ⚡️ **Bun Runtime** - Lightning-fast JavaScript runtime
- 🎯 **Express.js** - Robust web framework
- 🤖 **Gemini AI Integration** - AI-powered content generation
- 📱 **LinkedIn Integration** - Automated posting to LinkedIn
- 🤖 **GitHub Actions Automation** - Daily scheduled posts at 9 AM
- 🔗 **Linked API Architecture** - Forward generated content to other endpoints
- 🛡️ **Security** - Helmet for security headers, CORS enabled
- 📝 **TypeScript** - Full TypeScript support
- 🔄 **Hot Reload** - Auto-restart on file changes during development
- 🎨 **Clean Architecture** - Well-organized code structure

## 📋 Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- LinkedIn API Credentials (for automated posting - see [LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md))

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd linked-in-post-bot
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   PORT=3000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   API_VERSION=v1

   # LinkedIn credentials (optional - for automated posting)
   LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
   LINKEDIN_PERSON_URN=urn:li:person:your_person_id
   ```

4. **Set up LinkedIn (Optional)**

   For automated LinkedIn posting, follow the guide in [LINKEDIN_SETUP.md](./LINKEDIN_SETUP.md)

5. **Set up GitHub Actions (Optional)**

   For automated daily posts, see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

## 🏃‍♂️ Running the Application

### Development Mode (with hot reload)

```bash
bun run dev
```

### Production Mode

```bash
bun start
```

### Build

```bash
bun run build
```

### Run Daily Post Script

```bash
bun run daily-post
```

The server will start on `http://localhost:3000`

## 🤖 Automated Daily Posting

This application includes a GitHub Actions workflow that automatically generates and posts content to LinkedIn every day at 9:00 AM (Bangkok time).

### Setup Automation

1. Push your code to a GitHub repository
2. Configure GitHub Secrets (see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md))
3. Enable GitHub Actions in your repository

### Manual Testing

Test the daily post script locally:

```bash
bun run daily-post
```

For complete setup instructions, see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

## 📚 API Endpoints

### Health Check

- **GET** `/health`
  - Check server status and health

### API Information

- **GET** `/api`
  - Get API information and available endpoints

### LinkedIn Post Endpoints

#### Create New Post

- **POST** `/api/post/new-post`

  **Request Body:**

  ```json
  {
    "topic": "AI and Machine Learning",
    "maxTokens": 500,
    "dryRun": false
  }
  ```

  All fields are optional:
  - `topic`: Custom topic (if not provided, uses random topic)
  - `maxTokens`: Maximum tokens to generate
  - `dryRun`: If true, generates content without posting

  **Response:**

  ```json
  {
    "success": true,
    "message": "Content generated and posted to LinkedIn successfully",
    "data": {
      "content": "Generated LinkedIn post content...",
      "prompt": "The prompt used for generation",
      "linkedInPostId": "urn:li:share:123456789",
      "linkedInPostState": "PUBLISHED",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Check Status

- **GET** `/api/post/status`
  - Check if LinkedIn and Gemini are properly configured

#### Preview User Profile

- **GET** `/api/post/preview-profile`
  - Get LinkedIn user profile information

### Gemini Endpoints

#### Generate Content

- **POST** `/api/gemini/generate`

  **Request Body:**

  ```json
  {
    "prompt": "Write a professional LinkedIn post about AI",
    "maxTokens": 500
  }
  ```

  **Response:**

  ```json
  {
    "success": true,
    "data": {
      "content": "Generated content here...",
      "prompt": "Write a professional LinkedIn post about AI",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Generate and Forward Content

- **POST** `/api/gemini/generate-and-forward`

  **Request Body:**

  ```json
  {
    "prompt": "Write a professional LinkedIn post about AI",
    "maxTokens": 500,
    "forwardUrl": "http://localhost:3000/api/receiver/content"
  }
  ```

  **Response:**

  ```json
  {
    "success": true,
    "data": {
      "content": "Generated content here...",
      "prompt": "Write a professional LinkedIn post about AI",
      "forwardedTo": "http://localhost:3000/api/receiver/content",
      "forwardResponse": { ... },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Receiver Endpoints

#### Receive Content

- **POST** `/api/receiver/content`

  **Request Body:**

  ```json
  {
    "content": "Generated content...",
    "prompt": "Original prompt",
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

  **Response:**

  ```json
  {
    "success": true,
    "message": "Content received and processed successfully",
    "data": {
      "contentLength": 150,
      "receivedAt": "2024-01-01T00:00:00.000Z",
      "originalPrompt": "Original prompt",
      "originalGeneratedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Check Receiver Status

- **GET** `/api/receiver/status`
  - Check if receiver endpoint is active

## 🏗️ Project Structure

```
linked-in-post-bot/
├── .github/
│   └── workflows/
│       └── daily-post.yml        # GitHub Actions workflow
├── src/
│   ├── middleware/
│   │   └── errorHandler.ts       # Global error handling
│   ├── routes/
│   │   ├── index.ts              # Main route aggregator
│   │   ├── post.routes.ts        # LinkedIn post routes
│   │   ├── gemini.routes.ts      # Gemini API routes
│   │   └── receiver.routes.ts    # Content receiver routes
│   ├── services/
│   │   ├── gemini.service.ts     # Gemini API integration
│   │   ├── linkedin.service.ts   # LinkedIn API integration
│   │   └── forwarder.service.ts  # Content forwarding service
│   ├── scripts/
│   │   └── daily-post.ts         # Daily automated post script
│   ├── util/
│   │   └── generatePrompt.ts     # Prompt generation utilities
│   └── server.ts                 # Express app setup & server start
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── LINKEDIN_SETUP.md             # LinkedIn API setup guide
├── GITHUB_ACTIONS_SETUP.md       # GitHub Actions setup guide
└── README.md                     # Project documentation
```

## 🔄 Workflow Example

The typical workflow demonstrates the linked API architecture:

1. **Client** sends a POST request to `/api/gemini/generate-and-forward` with a prompt
2. **Gemini Service** generates content using the Gemini API
3. **Forwarder Service** automatically forwards the generated content to the receiver endpoint
4. **Receiver Endpoint** processes the forwarded content (saves to DB, triggers workflows, etc.)
5. **Client** receives a response with both the generated content and the forwarding result

## 🧪 Testing the API

### Using cURL

**Generate Content:**

```bash
curl -X POST http://localhost:3000/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a professional LinkedIn post about AI trends",
    "maxTokens": 300
  }'
```

**Generate and Forward:**

```bash
curl -X POST http://localhost:3000/api/gemini/generate-and-forward \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a professional LinkedIn post about AI trends",
    "maxTokens": 300
  }'
```

**Generate and Post to LinkedIn:**

```bash
curl -X POST http://localhost:3000/api/post/new-post \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI and Machine Learning trends",
    "dryRun": true
  }'
```

**Check LinkedIn Integration Status:**

```bash
curl http://localhost:3000/api/post/status
```

## 🔒 Environment Variables

| Variable                | Description          | Required             | Default       |
| ----------------------- | -------------------- | -------------------- | ------------- |
| `PORT`                  | Server port          | No                   | `3000`        |
| `NODE_ENV`              | Environment mode     | No                   | `development` |
| `GEMINI_API_KEY`        | Gemini API key       | Yes                  | -             |
| `API_VERSION`           | API version          | No                   | `v1`          |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn OAuth token | For LinkedIn posting | -             |
| `LINKEDIN_PERSON_URN`   | LinkedIn Person URN  | For LinkedIn posting | -             |

## 🛡️ Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Cross-Origin Resource Sharing enabled
- **Environment Variables** - Sensitive data stored in .env
- **Error Handling** - Comprehensive error handling with proper status codes

## 🚦 Error Handling

The API implements comprehensive error handling:

- **400** - Bad Request (missing required fields)
- **404** - Not Found (invalid routes)
- **500** - Internal Server Error (server/API errors)

Errors are logged with context including URL, method, and stack trace in development mode.

## 📝 Development Tips

1. **Hot Reload**: Use `bun run dev` for automatic restart on file changes
2. **Type Safety**: Leverage TypeScript for type checking with `bun run type-check`
3. **Logging**: Check console logs for incoming requests (Morgan) and errors
4. **Custom Logic**: Add your business logic in the receiver endpoint (`receiver.routes.ts`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) - The JavaScript runtime
- [Express.js](https://expressjs.com/) - Web framework
- [Google Gemini AI](https://ai.google.dev/) - AI content generation

---

**Happy Coding! 🚀**
