import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";

export type GeminiLiveAudioHandler = (audio: string) => void;
export type GeminiLiveTranscriptHandler = (
  transcript: string,
  isFinal: boolean,
  source: "input" | "output",
) => void;
export type GeminiLiveStateHandler = (state: "connected" | "disconnected" | "error") => void;

export type GeminiLiveProvider = {
  connect(): Promise<void>;
  sendQuestion(question: string): void;
  sendAudio(audio: Buffer): void;
  interrupt(): void;
  disconnect(): void;
  onAudio(handler: GeminiLiveAudioHandler): void;
  onTranscript(handler: GeminiLiveTranscriptHandler): void;
  onState(handler: GeminiLiveStateHandler): void;
};

export function createGeminiLiveProvider(options: {
  apiKey: string;
  model: string;
  systemInstruction?: string;
}): GeminiLiveProvider {
  const ai = new GoogleGenAI({ apiKey: options.apiKey });

  let session: Session | null = null;
  let audioHandler: GeminiLiveAudioHandler | null = null;
  let transcriptHandler: GeminiLiveTranscriptHandler | null = null;
  let stateHandler: GeminiLiveStateHandler | null = null;

  return {
    async connect() {
      if (!options.apiKey) {
        throw new Error("Gemini API key is not configured.");
      }

      session = await ai.live.connect({
        model: options.model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Aoede" },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          ...(options.systemInstruction
            ? { systemInstruction: options.systemInstruction }
            : {}),
        },
        callbacks: {
          onopen: () => {
            stateHandler?.("connected");
          },
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.find(
              (part) => Boolean(part.inlineData?.data),
            )?.inlineData?.data;

            if (audio) {
              audioHandler?.(audio);
            }

            const inputTranscript =
              message.serverContent?.inputTranscription?.text;

            const outputTranscript =
              message.serverContent?.outputTranscription?.text;

            if (inputTranscript) {
              transcriptHandler?.(
                inputTranscript,
                Boolean(message.serverContent?.turnComplete),
                "input",
              );
            }

            if (outputTranscript) {
              transcriptHandler?.(
                outputTranscript,
                Boolean(message.serverContent?.turnComplete),
                "output",
              );
            }
          },
          onerror: () => {
            stateHandler?.("error");
          },
          onclose: () => {
            session = null;
            stateHandler?.("disconnected");
          },
        },
      });
    },

    sendQuestion(question: string) {
      if (!session) return;
      session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: question }] }],
        turnComplete: true,
      });
    },

    sendAudio(audio) {
      if (!session) return;

      session.sendRealtimeInput({
        audio: {
          data: audio.toString("base64"),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    },

    interrupt() {
      if (!session) return;

      session.sendRealtimeInput({
        audioStreamEnd: true,
      });
    },

    disconnect() {
      session?.close();
      session = null;
    },

    onAudio(handler) {
      audioHandler = handler;
    },

    onTranscript(handler) {
      transcriptHandler = handler;
    },

    onState(handler) {
      stateHandler = handler;
    },
  };
}









