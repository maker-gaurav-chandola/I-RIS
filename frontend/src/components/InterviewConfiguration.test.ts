import { describe, expect, it } from "vitest";
import {
  validateConfiguration,
  type InterviewConfiguration,
} from "./InterviewConfiguration";

const validConfiguration: InterviewConfiguration = {
  interviewType: "Technical Interview",
  topic: "Java",
  difficulty: "Medium",
  duration: "15",
  language: "Hinglish",
  mode: "Text",
};

describe("interview configuration", () => {
  it("requires the approved configuration fields", () => {
    const errors = validateConfiguration({
      ...validConfiguration,
      topic: "",
      duration: "",
    });

    expect(errors.topic).toBeDefined();
    expect(errors.duration).toBeDefined();
  });

  it("accepts a complete approved configuration", () => {
    expect(validateConfiguration(validConfiguration)).toEqual({});
  });

  it("keeps expected score outside configuration", () => {
    expect(Object.keys(validConfiguration)).not.toContain("expectedScore");
  });
});
