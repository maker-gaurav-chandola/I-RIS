export interface TextToSpeechResult {
  audio: ArrayBuffer;
  mimeType: string;
}

export interface TextToSpeechProvider {
  synthesize(text: string): Promise<TextToSpeechResult>;
  stop(): Promise<void>;
}
