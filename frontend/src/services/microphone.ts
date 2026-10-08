export interface MicrophoneCapture {
  start(): Promise<void>;
  stop(): void;
  isActive(): boolean;
  onAudio(handler: (audio: ArrayBuffer) => void): void;
}

export function createMicrophoneCapture(): MicrophoneCapture {
  let stream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let processor: ScriptProcessorNode | null = null;
  let active = false;
  let audioHandler: ((audio: ArrayBuffer) => void) | null = null;

  return {
    async start() {
      console.log("[I-RIS MIC] microphone.start() CALLED");
      if (active) return;

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioContext = new AudioContext({ sampleRate: 16000 });
      console.log("[I-RIS MIC] AudioContext state:", audioContext.state);
      await audioContext.resume();
      console.log("[I-RIS MIC] AudioContext after resume:", audioContext.state);
      source = audioContext.createMediaStreamSource(stream);
      processor = audioContext.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = (event) => {
        if (!active || !audioHandler) return;

        const input = event.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);

        for (let i = 0; i < input.length; i += 1) {
          const sample = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }

        audioHandler(pcm.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      active = true;
    },

    stop() {
      active = false;

      processor?.disconnect();
      source?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());

      void audioContext?.close();

      processor = null;
      source = null;
      stream = null;
      audioContext = null;
    },

    isActive() {
      return active;
    },

    onAudio(handler) {
      audioHandler = handler;
    },
  };
}


