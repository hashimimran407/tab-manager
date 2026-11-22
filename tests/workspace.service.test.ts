import { describe, it, expect } from "vitest";
import { formatUrlForDisplay, truncateText, isRestrictedUrl } from "@/utils/url";

describe("Workspace Utilities", () => {
  it("formats URLs correctly for display", () => {
    expect(formatUrlForDisplay("https://www.google.com/search?q=test")).toBe("google.com");
    expect(formatUrlForDisplay("https://github.com/facebook/react")).toBe("github.com");
  });

  it("truncates long titles cleanly", () => {
    expect(truncateText("Short", 10)).toBe("Short");
    expect(truncateText("This is a very long tab title", 10)).toBe("This is a ...");
  });

  it("detects restricted browser URLs", () => {
    expect(isRestrictedUrl("chrome://settings")).toBe(true);
    expect(isRestrictedUrl("chrome-extension://xyz/options.html")).toBe(true);
    expect(isRestrictedUrl("https://example.com")).toBe(false);
  });
});
