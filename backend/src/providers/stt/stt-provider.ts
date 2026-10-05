export interface SpeechToTextResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface SpeechToTextProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
  transcribe(audio: ArrayBuffer): Promise<SpeechToTextResult>;
}
