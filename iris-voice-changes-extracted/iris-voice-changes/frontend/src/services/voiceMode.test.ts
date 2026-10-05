import { describe, expect, it } from "vitest";
import { isVoiceMode } from "./interviewMode";
import { buildVoiceUrl } from "./voiceSession";

describe("isVoiceMode", () => {
  it("routes Voice to the voice workspace and everything else to text", () => {
    expect(isVoiceMode("Voice")).toBe(true);
    expect(isVoiceMode(" voice ")).toBe(true);
    expect(isVoiceMode("Text")).toBe(false);
    expect(isVoiceMode("")).toBe(false);
    expect(isVoiceMode(undefined)).toBe(false);
  });
});

describe("buildVoiceUrl", () => {
  const page = { protocol: "http:", host: "localhost:5173" };

  it("targets the API host when VITE_API_BASE_URL is set", () => {
    expect(buildVoiceUrl("http://localhost:3001", page)).toBe("ws://localhost:3001/voice");
    expect(buildVoiceUrl("https://api.example.com", page)).toBe("wss://api.example.com/voice");
  });

  it("falls back to the page host", () => {
    expect(buildVoiceUrl("", page)).toBe("ws://localhost:5173/voice");
    expect(buildVoiceUrl("", { protocol: "https:", host: "iris.app" })).toBe("wss://iris.app/voice");
  });
});
