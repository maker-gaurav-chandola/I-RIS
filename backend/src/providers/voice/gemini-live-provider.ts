import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";

export type GeminiLiveAudioHandler = (audio: string) => void;

export type GeminiLiveTranscriptHandler = (
  transcript: string,
  isFinal: boolean,
  source: "input" | "output",
) => void;

export type GeminiLiveStateHandler = (
  state: "connected" | "disconnected" | "error",
) => void;

export type GeminiLiveTurnCompleteHandler = (source: "input" | "output") => void;

export type GeminiLiveProvider = {
  connect(): Promise<void>;
  sendQuestion(question: string): void;
  sendAudio(audio: Buffer): void;
  interrupt(): void;
  disconnect(): void;
  onAudio(handler: GeminiLiveAudioHandler): void;
  onTranscript(handler: GeminiLiveTranscriptHandler): void;
  onState(handler: GeminiLiveStateHandler): void;
  onTurnComplete(handler: GeminiLiveTurnCompleteHandler): void;
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
  let turnCompleteHandler: GeminiLiveTurnCompleteHandler | null = null;

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
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
              },
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

            const inputTranscription =
              message.serverContent?.inputTranscription;

            const inputTranscript = inputTranscription?.text;

            const outputTranscription =
              message.serverContent?.outputTranscription;

            const outputTranscript = outputTranscription?.text;

            if (inputTranscript) {
              const inputFinished = Boolean(inputTranscription?.finished);

              transcriptHandler?.(
                inputTranscript,
                inputFinished,
                "input",
              );

              if (inputFinished) {
                turnCompleteHandler?.("input");
              }
            }

            if (outputTranscript) {
              transcriptHandler?.(
                outputTranscript,
                Boolean(outputTranscription?.finished),
                "output",
              );
            }

            if (message.serverContent?.turnComplete) {
              turnCompleteHandler?.("output");
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
        turns: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
        turnComplete: true,
      });
    },

    sendAudio(audio: Buffer) {
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

    onTurnComplete(handler) {
      turnCompleteHandler = handler;
    },
  };
}

