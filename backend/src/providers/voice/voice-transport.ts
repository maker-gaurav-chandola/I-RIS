import type { VoiceErrorCode, VoiceState } from "./voice-provider.js";

export type VoiceTransportMessage =
  | {
      type: "audio";
      audio: string;
    }
  | {
      type: "transcription";
      transcript: string;
      isFinal: boolean;
    }
  | {
      type: "state";
      state: VoiceState;
    }
  | {
      type: "error";
      code: VoiceErrorCode;
      message: string;
    }
  | {
      type: "interrupted";
    }
  | {
      type: "turnComplete";
    };

export interface VoiceTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendAudio(audio: ArrayBuffer): void;
  sendInterrupt(): void;
  onMessage(handler: (message: VoiceTransportMessage) => void): void;
}
