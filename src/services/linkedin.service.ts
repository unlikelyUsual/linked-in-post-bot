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

export class LinkedInService {
  private readonly apiBaseUrl = "https://api.linkedin.com/v2";
  private readonly accessToken: string;
  private readonly personUrn: string;

  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || "";
    this.personUrn = process.env.LINKEDIN_PERSON_URN || "";

    if (!this.accessToken) {
      console.warn(
        "⚠️  LINKEDIN_ACCESS_TOKEN is not set in environment variables",
      );
    }
    if (!this.personUrn) {
      console.warn(
        "⚠️  LINKEDIN_PERSON_URN is not set in environment variables",
      );
    }
  }

  /**
   * Post content to LinkedIn
   * @param text The text content to post
   * @returns The LinkedIn post response
   */
  async sharePost(text: string): Promise<LinkedInPostResponse> {
    if (!this.accessToken || !this.personUrn) {
      throw new Error(
        "LinkedIn credentials not configured. Please set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in your environment variables.",
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
      const response = await fetch(`${this.apiBaseUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
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
      console.log("✅ Successfully posted to LinkedIn:", result.id);

      return result;
    } catch (error: any) {
      console.error("❌ Error posting to LinkedIn:", error.message);
      throw error;
    }
  }

  /**
   * Verify if LinkedIn credentials are configured
   * @returns true if credentials are set, false otherwise
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.personUrn);
  }

  /**
   * Get user profile information (optional - for verification)
   * @returns User profile data
   */
  async getUserProfile(): Promise<any> {
    if (!this.accessToken) {
      throw new Error("LinkedIn access token not configured");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/userinfo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Error fetching LinkedIn profile:", error.message);
      throw error;
    }
  }
}
