# GitHub Actions Setup Guide

This guide explains how to set up the automated daily LinkedIn post using GitHub Actions.

## 🎯 Overview

The GitHub Actions workflow automatically generates and posts content to LinkedIn every day at **9:00 AM (Bangkok time, UTC+7)**.

## 📋 Prerequisites

Before setting up the GitHub Actions workflow, ensure you have:

1. A GitHub repository with this codebase
2. LinkedIn API credentials (Access Token and Person URN)
3. Google Gemini API key

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Navigate to your GitHub repository and add the following secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these three secrets:

| Secret Name             | Description                      | Example                   |
| ----------------------- | -------------------------------- | ------------------------- |
| `GEMINI_API_KEY`        | Your Google Gemini API key       | `AIzaSyC...`              |
| `LINKEDIN_ACCESS_TOKEN` | Your LinkedIn OAuth access token | `AQVz1B...`               |
| `LINKEDIN_PERSON_URN`   | Your LinkedIn Person URN         | `urn:li:person:ABC123xyz` |

### Step 2: Verify Workflow File

The workflow file is already created at `.github/workflows/daily-post.yml`. It includes:

- **Scheduled run**: Daily at 9:00 AM Bangkok time (2:00 AM UTC)
- **Manual trigger**: You can also run it manually from GitHub Actions tab
- **Automatic notifications**: Logs errors if the post fails

### Step 3: Enable GitHub Actions

1. Go to your repository on GitHub
2. Navigate to the **Actions** tab
3. If prompted, enable GitHub Actions for the repository
4. You should see the "Daily LinkedIn Post" workflow listed

### Step 4: Test the Workflow

#### Test Manually (Recommended)

Before waiting for the scheduled run, test the workflow manually:

1. Go to **Actions** tab in your GitHub repository
2. Click on **Daily LinkedIn Post** workflow
3. Click **Run workflow** button
4. Select the branch (usually `main` or `master`)
5. Click **Run workflow**
6. Wait for the workflow to complete
7. Check the logs to ensure everything works correctly

#### Test Locally (Optional)

You can also test the script locally before pushing:

```bash
# Make sure your .env file has all required variables
bun run daily-post
```

## 📅 Schedule Configuration

The default schedule is **9:00 AM Bangkok time (UTC+7)**, which is **2:00 AM UTC**.

### Change the Schedule Time

To modify the schedule, edit `.github/workflows/daily-post.yml`:

```yaml
schedule:
  - cron: "0 2 * * *" # Current: 2:00 AM UTC = 9:00 AM Bangkok
```

**Cron format**: `minute hour day month day-of-week`

#### Common Schedule Examples:

| Time (Bangkok) | Time (UTC)              | Cron Expression |
| -------------- | ----------------------- | --------------- |
| 6:00 AM        | 11:00 PM (previous day) | `0 23 * * *`    |
| 9:00 AM        | 2:00 AM                 | `0 2 * * *`     |
| 12:00 PM       | 5:00 AM                 | `0 5 * * *`     |
| 6:00 PM        | 11:00 AM                | `0 11 * * *`    |

**Note**: GitHub Actions uses UTC time. Calculate your desired time in UTC.

### Change to a Different Timezone

If you're in a different timezone, use this formula:

```
UTC Hour = Local Hour - Timezone Offset
```

For example:

- New York (UTC-5): 9 AM → `0 14 * * *` (9 + 5 = 14)
- London (UTC+0): 9 AM → `0 9 * * *`
- Tokyo (UTC+9): 9 AM → `0 0 * * *` (9 - 9 = 0)

## 🔍 Monitoring

### View Workflow Runs

1. Go to **Actions** tab in your GitHub repository
2. Click on any workflow run to see detailed logs
3. Check for success ✅ or failure ❌ status

### Check Post Details

Each successful run will show:

- Generated content
- Content length
- LinkedIn Post ID
- Timestamp

### Troubleshooting Failed Runs

If a workflow fails:

1. Check the workflow logs in the Actions tab
2. Common issues:
   - **Invalid credentials**: Verify your GitHub secrets are correct
   - **API rate limits**: LinkedIn or Gemini API might have rate limits
   - **Network issues**: Temporary connection problems
3. Re-run the workflow after fixing issues

## 🛠️ Advanced Configuration

### Disable Automatic Posts

To temporarily disable automatic posts without deleting the workflow:

1. Go to **Actions** tab
2. Click on **Daily LinkedIn Post** workflow
3. Click the **...** menu → **Disable workflow**

You can re-enable it later from the same menu.

### Run Multiple Times Per Day

To post multiple times daily, add more cron schedules:

```yaml
schedule:
  - cron: "0 2 * * *" # 9:00 AM Bangkok
  - cron: "0 9 * * *" # 4:00 PM Bangkok
```

### Add Notifications

You can add Slack, Discord, or email notifications on failure by extending the workflow. See [GitHub Actions documentation](https://docs.github.com/en/actions) for details.

## 📱 Manual Execution

You can always trigger a post manually:

1. **Via GitHub Actions UI**: Follow the "Test Manually" steps above
2. **Via Local Script**: Run `bun run daily-post` locally

## 🔒 Security Best Practices

1. **Never commit secrets**: Keep API keys in GitHub Secrets, not in code
2. **Use access tokens carefully**: LinkedIn tokens should have minimal required permissions
3. **Rotate credentials regularly**: Update tokens periodically for security
4. **Monitor usage**: Keep track of API usage to avoid unexpected charges

## 📝 Workflow File Reference

The workflow file (`.github/workflows/daily-post.yml`) includes:

- **Trigger**: Scheduled cron job + manual dispatch
- **Environment**: Ubuntu latest with Bun runtime
- **Steps**:
  1. Checkout repository
  2. Setup Bun
  3. Install dependencies
  4. Run daily post script with environment variables
  5. Notify on failure

## 🤝 Support

If you encounter issues:

1. Check the workflow logs in GitHub Actions
2. Review your GitHub Secrets configuration
3. Test the script locally with `bun run daily-post`
4. Check LinkedIn and Gemini API status pages

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Generator](https://crontab.guru/)
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
