import { describe, expect, it, vi, beforeEach } from "vitest";

const createMock = vi.fn();

vi.mock("groq-sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: createMock,
      },
    },
  })),
  toFile: vi.fn(async (value: ArrayBuffer, name: string, options: { type: string }) => ({
    value,
    name,
    type: options.type,
  })),
}));

import { createGroqSttProvider } from "./groq-stt-provider.js";

describe("Groq STT provider", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("returns an empty final transcript for empty audio", async () => {
    const provider = createGroqSttProvider({
      apiKey: "test-key",
    });

    const result = await provider.transcribe(new ArrayBuffer(0));

    expect(result).toEqual({
      transcript: "",
      isFinal: true,
    });

    expect(createMock).not.toHaveBeenCalled();
  });

  it("sends WAV audio to Groq and returns the transcript", async () => {
    createMock.mockResolvedValue({
      text: "  Explain closures in JavaScript.  ",
    });

    const provider = createGroqSttProvider({
      apiKey: "test-key",
      model: "whisper-large-v3-turbo",
      language: "en",
    });

    const pcm = new Int16Array([0, 1000, -1000]);
    const result = await provider.transcribe(pcm.buffer);

    expect(result).toEqual({
      transcript: "Explain closures in JavaScript.",
      isFinal: true,
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "whisper-large-v3-turbo",
        language: "en",
        response_format: "json",
        temperature: 0,
        file: expect.objectContaining({
          name: "answer.wav",
          type: "audio/wav",
        }),
      }),
    );
  });
});
