import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { LinkedInService } from "./linkedin.service.ts";

describe("LinkedInService image posts", () => {
  const savedEnvironment = new Map<string, string | undefined>();
  const originalFetch = globalThis.fetch;
  const environmentKeys = [
    "LINKEDIN_ACCESS_TOKEN",
    "LINKEDIN_REFRESH_TOKEN",
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "LINKEDIN_PERSON_URN",
  ];

  beforeEach(() => {
    for (const key of environmentKeys) {
      savedEnvironment.set(key, process.env[key]);
    }

    process.env.LINKEDIN_ACCESS_TOKEN = "";
    process.env.LINKEDIN_REFRESH_TOKEN = "refresh-token";
    process.env.LINKEDIN_CLIENT_ID = "client-id";
    process.env.LINKEDIN_CLIENT_SECRET = "client-secret";
    process.env.LINKEDIN_PERSON_URN = "urn:li:person:test";
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: originalFetch,
    });
    for (const [key, value] of savedEnvironment) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    savedEnvironment.clear();
  });

  it("uploads a PNG and publishes it as an image post", async () => {
    const calls: Array<{
      url: string;
      init?: RequestInit;
    }> = [];
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: async (
        input: string | URL,
        init?: RequestInit,
      ): Promise<Response> => {
        const url = String(input);
        calls.push({ url, init });

        if (url.includes("/oauth/v2/accessToken")) {
          return Response.json({ access_token: "fresh-access-token" });
        }
        if (url.endsWith("/assets?action=registerUpload")) {
          return Response.json({
            value: {
              asset: "urn:li:digitalmediaAsset:test",
              uploadMechanism: {
                "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
                  uploadUrl: "https://upload.linkedin.test/image",
                },
              },
            },
          });
        }
        if (url === "https://upload.linkedin.test/image") {
          return new Response(null, { status: 201 });
        }
        if (url.endsWith("/ugcPosts")) {
          return Response.json(
            { id: "urn:li:share:test", lifecycleState: "PUBLISHED" },
            { status: 201 },
          );
        }

        throw new Error(`Unexpected request: ${url}`);
      },
    });

    const service = new LinkedInService();
    const result = await service.sharePost("System design post", {
      data: Buffer.from("test png bytes"),
      title: "URL Shortener",
      description: "High-level URL shortener architecture",
    });

    expect(result.id).toBe("urn:li:share:test");
    expect(calls).toHaveLength(4);
    expect(calls[2].init?.method).toBe("PUT");
    expect(calls[2].init?.headers).toMatchObject({
      Authorization: "Bearer fresh-access-token",
      "Content-Type": "image/png",
    });

    const postBody = JSON.parse(String(calls[3].init?.body));
    const shareContent =
      postBody.specificContent["com.linkedin.ugc.ShareContent"];
    expect(shareContent.shareMediaCategory).toBe("IMAGE");
    expect(shareContent.media[0].media).toBe(
      "urn:li:digitalmediaAsset:test",
    );
    expect(shareContent.media[0].title.text).toBe("URL Shortener");
  });
});
