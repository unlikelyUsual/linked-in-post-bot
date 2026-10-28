# GitHub Actions Setup Guide

This guide explains how to set up the automated daily LinkedIn post using GitHub Actions.

## 🎯 Overview

The GitHub Actions workflow automatically generates and posts content to LinkedIn **every 2 days** at **9:00 AM (Bangkok time, UTC+7)**.

## 📋 Prerequisies

Before setting up the GitHub Actions workflow, ensure you have:

1. A GitHub repository with this codebase
2. LinkedIn API credentials (Access Token and Person URN)
3. Google Gemini API key

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Navigate to your GitHub repository and add the following secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add the required secrets:

| Secret Name               | Description |
| ------------------------- | ----------- |
| `GEMINI_API_KEY`          | Your Google Gemini API key |
| `LINKEDIN_REFRESH_TOKEN`  | LinkedIn OAuth refresh token |
| `LINKEDIN_CLIENT_ID`      | LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET`  | LinkedIn app client secret |
| `LINKEDIN_PERSON_URN`     | Your LinkedIn Person URN |
| `GH_SECRETS_UPDATE_TOKEN` | Fine-grained GitHub token used only if LinkedIn rotates the refresh token |

The workflow exchanges the refresh token for a fresh access token before each LinkedIn API request. It does not need a manually maintained `LINKEDIN_ACCESS_TOKEN` when refresh credentials are configured. If LinkedIn returns a replacement refresh token, the workflow saves it back to `LINKEDIN_REFRESH_TOKEN`.

Create `GH_SECRETS_UPDATE_TOKEN` as a fine-grained personal access token scoped to this repository, with **Repository permissions → Actions: Read and write**. GitHub requires the Actions permission to update Actions secrets. The workflow uses this token only to update the refresh-token secret when LinkedIn rotates that token. Keep it private and rotate it according to your security practices.

If you are not using refresh tokens, the existing `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_PERSON_URN` configuration continues to work.

### Step 2: Verify Workflow File

The workflow file is already created at `.github/workflows/daily-post.yml`. It includes:

- **Scheduled run**: Every 2 days at 9:00 AM Bangkok time (2:00 AM UTC)
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
2. Click on **LinkedIn Post (Every 2 Days)** workflow
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

The default schedule is **every 2 days at 9:00 AM Bangkok time (UTC+7)**, which is **2:00 AM UTC**.

### Change the Schedule Time

To modify the schedule, edit `.github/workflows/daily-post.yml`:

```yaml
schedule:
  - cron: "0 2 */2 * *" # Current: Every 2 days at 2:00 AM UTC = 9:00 AM Bangkok
```

**Cron format**: `minute hour day month day-of-week`

**Note**: The `*/2` in the day field means "every 2 days".

#### Common Schedule Examples:

| Frequency       | Time (Bangkok) | Time (UTC)              | Cron Expression |
| --------------- | -------------- | ----------------------- | --------------- |
| Every 2 days    | 9:00 AM        | 2:00 AM                 | `0 2 */2 * *`   |
| Every 3 days    | 9:00 AM        | 2:00 AM                 | `0 2 */3 * *`   |
| Daily           | 9:00 AM        | 2:00 AM                 | `0 2 * * *`     |
| Daily           | 6:00 AM        | 11:00 PM (previous day) | `0 23 * * *`    |
| Daily           | 12:00 PM       | 5:00 AM                 | `0 5 * * *`     |
| Daily           | 6:00 PM        | 11:00 AM                | `0 11 * * *`    |
| Weekly (Monday) | 9:00 AM        | 2:00 AM                 | `0 2 * * 1`     |
| Twice per week  | 9:00 AM        | 2:00 AM                 | `0 2 * * 1,4`   |

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
2. Click on **LinkedIn Post (Every 2 Days)** workflow
3. Click the **...** menu → **Disable workflow**

You can re-enable it later from the same menu.

### Change Posting Frequency

**Post daily instead of every 2 days:**

```yaml
schedule:
  - cron: "0 2 * * *" # Daily at 9:00 AM Bangkok
```

**Post weekly (every Monday):**

```yaml
schedule:
  - cron: "0 2 * * 1" # Every Monday at 9:00 AM Bangkok
```

**Post multiple times (e.g., twice daily):**

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
