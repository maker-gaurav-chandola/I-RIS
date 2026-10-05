import Groq from "groq-sdk";
import { toFile } from "groq-sdk";
import type {
  SpeechToTextProvider,
  SpeechToTextResult,
} from "./stt-provider.js";
import { pcm16ToWav } from "./wav.js";

export type GroqSttProviderOptions = {
  apiKey: string;
  model?: string;
  language?: string;
};

export function createGroqSttProvider(
  options: GroqSttProviderOptions,
): SpeechToTextProvider {
  const client = new Groq({ apiKey: options.apiKey });
  const model = options.model ?? "whisper-large-v3-turbo";

  return {
    async start() {},

    async stop() {},

    async transcribe(audio: ArrayBuffer): Promise<SpeechToTextResult> {
      if (audio.byteLength === 0) {
        return {
          transcript: "",
          isFinal: true,
        };
      }

      const wav = pcm16ToWav(audio);
      const file = await toFile(wav, "answer.wav", {
        type: "audio/wav",
      });

      const response = await client.audio.transcriptions.create({
        file,
        model,
        language: options.language,
        response_format: "json",
        temperature: 0,
      });

      return {
        transcript: response.text.trim(),
        isFinal: true,
      };
    },
  };
}
