import { describe, expect, it } from "vitest";
import { hasValidConfiguration } from "./ReadyScreen";
import type { InterviewConfiguration } from "./InterviewConfiguration";

const configuration: InterviewConfiguration = {
  interviewType: "Technical Interview",
  topic: "JavaScript",
  difficulty: "Medium",
  duration: "30",
  language: "Hinglish",
  mode: "Text",
};

describe("ready screen transition", () => {
  it("accepts a complete configuration for the Ready Screen", () => {
    expect(hasValidConfiguration(configuration)).toBe(true);
  });

  it("rejects missing configuration without creating an entry state", () => {
    expect(hasValidConfiguration(null)).toBe(false);
    expect(hasValidConfiguration({ ...configuration, topic: "" })).toBe(false);
  });

  it("keeps the selected values available for the summary", () => {
    expect(configuration).toMatchObject({
      topic: "JavaScript",
      duration: "30",
      language: "Hinglish",
      mode: "Text",
    });
  });
});
