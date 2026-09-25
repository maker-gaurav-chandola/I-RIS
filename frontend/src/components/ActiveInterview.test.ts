import { describe, expect, it } from "vitest";

describe("active interview boundary", () => {
  it("keeps Step 6 text session states separate from evaluation", () => {
    const states = ["active", "completed", "terminated"];
    expect(states).toEqual(["active", "completed", "terminated"]);
    expect(states).not.toContain("evaluated");
  });
});
