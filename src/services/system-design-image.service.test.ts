import { describe, expect, it } from "bun:test";
import sharp from "sharp";
import { renderSystemDesignImage } from "./system-design-image.service.ts";
import type { SystemDesignDiagram } from "../types/systemDesign.ts";

describe("renderSystemDesignImage", () => {
  it("renders a system architecture as a LinkedIn-ready PNG", async () => {
    const diagram: SystemDesignDiagram = {
      title: "URL Shortener",
      components: [
        { id: "client", name: "Web Client", type: "client" },
        { id: "api", name: "API Gateway", type: "service" },
        { id: "shortener", name: "Shortening Service", type: "service" },
        { id: "cache", name: "URL Cache", type: "data" },
        { id: "database", name: "URL Database", type: "data" },
      ],
      connections: [
        { from: "client", to: "api", label: "request" },
        { from: "api", to: "shortener", label: "create / resolve" },
        { from: "shortener", to: "cache", label: "lookup" },
        { from: "cache", to: "database", label: "cache miss" },
      ],
    };

    const image = await renderSystemDesignImage(diagram);
    const metadata = await sharp(image).metadata();

    expect(image.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(675);
  });
});
