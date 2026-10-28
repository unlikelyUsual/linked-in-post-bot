import { appendFile } from "node:fs/promises";

/**
 * LinkedIn Service
 * Handles posting content to LinkedIn using the LinkedIn API
 * Documentation: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
 */

interface LinkedInPostResponse {
  id: string;
  lifecycleState: string;
}

interface LinkedInErrorResponse {
  message: string;
  status: number;
}

interface LinkedInTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

export class LinkedInService {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly oauthUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  private readonly accessToken: string;
  private readonly refreshToken: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly personUrn: string;

  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || "";
    this.refreshToken = process.env.LINKEDIN_REFRESH_TOKEN || "";
    this.clientId = process.env.LINKEDIN_CLIENT_ID || "";
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
    this.personUrn = process.env.LINKEDIN_PERSON_URN || "";

    if (!this.personUrn) {
      console.warn("LINKEDIN_PERSON_URN is not set in environment variables");
    }
  }

  /**
   * Post content to LinkedIn
   * @param text The text content to post
   * @returns The LinkedIn post response
   */
  async sharePost(text: string): Promise<LinkedInPostResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        "LinkedIn credentials not configured. Set LINKEDIN_PERSON_URN and either LINKEDIN_ACCESS_TOKEN or LINKEDIN_REFRESH_TOKEN with LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.",
      );
    }

    const postData = {
      author: this.personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.apiBaseUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as LinkedInErrorResponse;
        throw new Error(
          `LinkedIn API error: ${response.status} - ${errorData.message || response.statusText}`,
        );
      }

      const result = (await response.json()) as LinkedInPostResponse;
      console.log("Successfully posted to LinkedIn:", result.id);

      return result;
    } catch (error: any) {
      console.error("Error posting to LinkedIn:", error.message);
      throw error;
    }
  }

  /**
   * Verify if LinkedIn credentials are configured
   * @returns true if credentials are set, false otherwise
   */
  isConfigured(): boolean {
    const hasRefreshConfiguration =
      this.refreshToken || this.clientId || this.clientSecret;
    const hasRefreshCredentials =
      this.refreshToken && this.clientId && this.clientSecret;

    return Boolean(
      this.personUrn &&
        (hasRefreshConfiguration ? hasRefreshCredentials : this.accessToken),
    );
  }

  /**
   * Get user profile information (optional - for verification)
   * @returns User profile data
   */
  async getUserProfile(): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.apiBaseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}))) as LinkedInErrorResponse;
        throw new Error(
          `LinkedIn API error: ${response.status} - ${errorData.message || response.statusText}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching LinkedIn profile:", error.message);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    const hasRefreshConfiguration =
      this.refreshToken || this.clientId || this.clientSecret;

    if (!hasRefreshConfiguration) {
      if (!this.accessToken) {
        throw new Error(
          "LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN or configure LINKEDIN_REFRESH_TOKEN, LINKEDIN_CLIENT_ID, and LINKEDIN_CLIENT_SECRET.",
        );
      }
      return this.accessToken;
    }

    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      throw new Error(
        "LinkedIn refresh is not fully configured. Set LINKEDIN_REFRESH_TOKEN, LINKEDIN_CLIENT_ID, and LINKEDIN_CLIENT_SECRET.",
      );
    }

    const response = await fetch(this.oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const tokenResponse = (await response
      .json()
      .catch(() => ({}))) as LinkedInTokenResponse;

    if (!response.ok || !tokenResponse.access_token) {
      throw new Error(
        `LinkedIn token refresh failed: ${response.status} - ${tokenResponse.error_description || tokenResponse.error || response.statusText}`,
      );
    }

    if (
      tokenResponse.refresh_token &&
      tokenResponse.refresh_token !== this.refreshToken
    ) {
      await this.saveRotatedRefreshToken(tokenResponse.refresh_token);
    }

    return tokenResponse.access_token;
  }

  private async saveRotatedRefreshToken(refreshToken: string): Promise<void> {
    const outputFile = process.env.GITHUB_OUTPUT;

    if (process.env.GITHUB_ACTIONS !== "true" || !outputFile) {
      throw new Error(
        "LinkedIn rotated its refresh token. Update LINKEDIN_REFRESH_TOKEN in your environment before running again.",
      );
    }

    if (/[\r\n]/.test(refreshToken)) {
      throw new Error("LinkedIn returned an invalid refresh token.");
    }

    const escapedToken = refreshToken
      .replace(/%/g, "%25")
      .replace(/\r/g, "%0D")
      .replace(/\n/g, "%0A");
    process.stdout.write(`::add-mask::${escapedToken}\n`);
    await appendFile(outputFile, `linkedin_refresh_token=${refreshToken}\n`);
  }
}
