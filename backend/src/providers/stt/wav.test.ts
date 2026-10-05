import { describe, expect, it, vi } from "vitest";
import { pcm16ToWav } from "./wav.js";

describe("pcm16ToWav", () => {
  it("creates a valid PCM WAV header", () => {
    const pcm = new Int16Array([0, 1000, -1000, 32767, -32768]);

    const wav = pcm16ToWav(pcm.buffer);

    const view = new DataView(wav);
    const bytes = new Uint8Array(wav);

    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WAVE");
    expect(new TextDecoder().decode(bytes.slice(12, 16))).toBe("fmt ");
    expect(new TextDecoder().decode(bytes.slice(36, 40))).toBe("data");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(pcm.byteLength);
    expect(wav.byteLength).toBe(44 + pcm.byteLength);
  });
});
