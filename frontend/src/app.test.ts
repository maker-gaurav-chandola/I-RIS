import { describe, expect, it } from "vitest";
import { getPageForPath } from "./app";

describe("foundation routes", () => {
  it("maps approved shell paths to page labels", () => {
    expect(getPageForPath("/dashboard")).toBe("Dashboard");
    expect(getPageForPath("/interview/setup")).toBe("Interview Setup");
    expect(getPageForPath("/history")).toBe("History");
    expect(getPageForPath("/progress")).toBe("Progress");
    expect(getPageForPath("/unknown")).toBe("Entry");
  });
});
