# Quick Start Guide 🚀

Get your Bun + Express + Gemini API server running in 3 simple steps!

## Step 1: Set up your Gemini API Key 🔑

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open the `.env` file in the project root
3. Replace `your_gemini_api_key_here` with your actual API key:

```env
GEMINI_API_KEY=AIzaSyD...your_actual_key_here
```

## Step 2: Start the Server 🚀

Run the development server with hot reload:

```bash
bun run dev
```

You should see:

```
🚀 Server is running on http://localhost:3000
📝 Environment: development
⚡️ Runtime: Bun X.X.X
```

## Step 3: Test the API 🧪

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

### Test 2: Generate Content with Gemini

```bash
curl -X POST http://localhost:3000/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a short professional LinkedIn post about AI innovation in 2024"
  }'
```

### Test 3: Generate and Forward (Full Workflow)

```bash
curl -X POST http://localhost:3000/api/gemini/generate-and-forward \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a motivational quote for developers"
  }'
```

This will:

1. ✨ Generate content from Gemini AI
2. 🔄 Forward it to the receiver endpoint
3. 📨 The receiver will process it and log it to console
4. ✅ Return the complete response

## API Endpoints Summary 📚

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/health`                          | Server health check            |
| GET    | `/api`                             | API information                |
| POST   | `/api/gemini/generate`             | Generate content with Gemini   |
| POST   | `/api/gemini/generate-and-forward` | Generate & forward to receiver |
| POST   | `/api/receiver/content`            | Receive forwarded content      |
| GET    | `/api/receiver/status`             | Check receiver status          |

## Next Steps 🎯

1. **Customize the Receiver Logic**: Edit `src/routes/receiver.routes.ts` to add your custom processing logic
2. **Add Database Integration**: Store generated content in a database
3. **Add Authentication**: Secure your endpoints with JWT or API keys
4. **Deploy**: Deploy to production using Docker or cloud platforms

## Need Help? 💡

- Check the full [README.md](./README.md) for detailed documentation
- Review the code structure in the `src/` directory
- All TypeScript types are defined for easy development

**Happy Building! 🎉**
