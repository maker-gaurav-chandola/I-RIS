export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "interrupted"
  | "error"
  | "disconnected";

export type VoiceErrorCode =
  | "MICROPHONE_PERMISSION_DENIED"
  | "MICROPHONE_UNAVAILABLE"
  | "CONNECTION_FAILED"
  | "STT_FAILED"
  | "TTS_FAILED"
  | "AUDIO_PLAYBACK_FAILED"
  | "INTERRUPTED"
  | "UNKNOWN";

export interface VoiceStateSnapshot {
  state: VoiceState;
  errorCode?: VoiceErrorCode;
  errorMessage?: string;
}

export interface VoiceSession {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  interrupt(): Promise<void>;
  getState(): VoiceStateSnapshot;
}
