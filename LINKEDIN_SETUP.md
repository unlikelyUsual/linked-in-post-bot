# LinkedIn API Setup Guide

This guide will help you set up LinkedIn API integration for the LinkedIn Post Bot.

## Prerequisites

- A LinkedIn account
- Access to [LinkedIn Developers Portal](https://www.linkedin.com/developers/)

## Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - App name: "LinkedIn Post Bot" (or your preferred name)
   - LinkedIn Page: Select or create a LinkedIn company page
   - App logo: Upload a logo (optional)
   - Legal agreement: Accept the terms

## Step 2: Configure App Settings

1. Go to the "Auth" tab in your LinkedIn app
2. Add redirect URLs for OAuth 2.0:
   - For local development: `http://localhost:3000/auth/linkedin/callback`
   - For production: Your production callback URL

## Step 3: Request API Access

1. Go to the "Products" tab
2. Request access to "Share on LinkedIn" product
3. Wait for approval (this may take a few minutes to a few days)

## Step 4: Get Required Permissions

Ensure your app has the following permissions (scopes):

- `w_member_social` - Required to post on behalf of the user

## Step 5: Generate Access Token

### Option A: Using OAuth 2.0 Flow (Recommended for Production)

1. Implement OAuth 2.0 authorization flow in your application
2. Direct users to LinkedIn authorization URL:

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri={your_redirect_uri}&scope=w_member_social
```

3. Exchange authorization code for access token:

```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -d grant_type=authorization_code \
  -d code={authorization_code} \
  -d client_id={your_client_id} \
  -d client_secret={your_client_secret} \
  -d redirect_uri={your_redirect_uri}
```

### Option B: Using LinkedIn's Token Inspector (For Testing)

1. Go to the "Auth" tab in your LinkedIn app
2. Find the "OAuth 2.0 tools" section
3. Use the token inspector to generate a test token
   - **Note**: Test tokens expire after 60 days

## Step 6: Get Your Person URN

Make a request to get your LinkedIn profile information:

```bash
curl -X GET https://api.linkedin.com/v2/me \
  -H "Authorization: Bearer {your_access_token}"
```

The response will include your person ID. Your Person URN format is:

```
urn:li:person:{person_id}
```

## Step 7: Configure Environment Variables

Update your `.env` file with the credentials:

```bash
# LinkedIn API Configuration
LINKEDIN_ACCESS_TOKEN=your_actual_access_token_here
LINKEDIN_PERSON_URN=urn:li:person:your_person_id_here
```

## Step 8: Test the Integration

### Check Status

```bash
curl http://localhost:3000/api/post/status
```

### Test with Dry Run (doesn't post to LinkedIn)

```bash
curl -X POST http://localhost:3000/api/post/new-post \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

### Post to LinkedIn

```bash
curl -X POST http://localhost:3000/api/post/new-post \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Post with Custom Topic

```bash
curl -X POST http://localhost:3000/api/post/new-post \
  -H "Content-Type: application/json" \
  -d '{"topic": "TypeScript best practices"}'
```

## API Endpoints

### POST /api/post/new-post

Generate content with Gemini AI and post to LinkedIn

**Request Body:**

```json
{
  "topic": "Optional custom topic",
  "maxTokens": 1000,
  "dryRun": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Content generated and posted to LinkedIn successfully",
  "data": {
    "content": "The generated post content",
    "prompt": "The prompt used for generation",
    "linkedInPostId": "urn:li:share:1234567890",
    "linkedInPostState": "PUBLISHED",
    "timestamp": "2026-02-05T03:50:00.000Z"
  }
}
```

### GET /api/post/preview

Preview the prompt that will be used for content generation

### GET /api/post/status

Check if LinkedIn and Gemini services are configured

## Troubleshooting

### Error: "LinkedIn credentials not configured"

- Verify that `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_PERSON_URN` are set in your `.env` file
- Make sure there are no extra spaces or quotes in the values

### Error: "LinkedIn API error: 401"

- Your access token may have expired
- Generate a new access token following Step 5

### Error: "LinkedIn API error: 403"

- Your app may not have the required permissions
- Check that "Share on LinkedIn" product is approved
- Verify that your token has the `w_member_social` scope

### Error: "LinkedIn API error: 422"

- The content may be invalid or too long
- LinkedIn posts have a maximum length of 3000 characters
- Check that your content doesn't contain invalid characters

## Best Practices

1. **Token Security**: Never commit your access token to version control
2. **Token Refresh**: Implement token refresh logic for long-running applications
3. **Rate Limiting**: Be aware of LinkedIn's API rate limits
4. **Content Quality**: Test with `dryRun: true` before posting to verify content quality
5. **Error Handling**: Implement proper error handling and logging

## Resources

- [LinkedIn Share API Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [LinkedIn OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn API Best Practices](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/best-practices)

## Support

For issues related to LinkedIn API access, contact [LinkedIn Developer Support](https://www.linkedin.com/help/linkedin/answer/a1348676).
