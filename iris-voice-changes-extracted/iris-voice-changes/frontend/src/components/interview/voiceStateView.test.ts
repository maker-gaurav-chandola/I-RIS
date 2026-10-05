import { describe, expect, it } from "vitest";
import {
  canSubmitVoiceResponse,
  describeMicrophoneError,
  describeVoiceState,
  getMicAction,
} from "./voiceStateView";

describe("describeVoiceState", () => {
  it("separates 'connected and ready' from 'not connected yet'", () => {
    expect(describeVoiceState("idle", true).label).toBe("Ready");
    expect(describeVoiceState("idle", false).label).toBe("Preparing");
  });

  it("covers failure states with a recovery hint", () => {
    expect(describeVoiceState("error", false).label).toBe("Voice unavailable");
    expect(describeVoiceState("disconnected", false).hint).toMatch(/typing/);
  });
});

describe("getMicAction", () => {
  it("only allows starting when connected and idle/interrupted", () => {
    expect(getMicAction("idle", true, false)).toBe("start");
    expect(getMicAction("interrupted", true, false)).toBe("start");
    expect(getMicAction("idle", false, false)).toBe("none");
    expect(getMicAction("error", true, false)).toBe("none");
    expect(getMicAction("processing", true, false)).toBe("none");
    expect(getMicAction("speaking", true, false)).toBe("none");
  });

  it("stops while listening and is disabled while busy", () => {
    expect(getMicAction("listening", true, false)).toBe("stop");
    expect(getMicAction("listening", true, true)).toBe("none");
  });
});

describe("canSubmitVoiceResponse", () => {
  it("requires a settled, non-empty transcript", () => {
    expect(canSubmitVoiceResponse("idle", "hello", false)).toBe(true);
    expect(canSubmitVoiceResponse("idle", "   ", false)).toBe(false);
    expect(canSubmitVoiceResponse("listening", "hello", false)).toBe(false);
    expect(canSubmitVoiceResponse("processing", "hello", false)).toBe(false);
    expect(canSubmitVoiceResponse("idle", "hello", true)).toBe(false);
  });
});

describe("describeMicrophoneError", () => {
  it("maps browser error names to readable messages", () => {
    expect(describeMicrophoneError({ name: "NotAllowedError" })).toMatch(/blocked/);
    expect(describeMicrophoneError({ name: "NotFoundError" })).toMatch(/No microphone/);
    expect(describeMicrophoneError(new Error("custom"))).toBe("custom");
  });
});
