export function createAudioPlayback() {
  let audioContext: AudioContext | null = null;
  let nextStartTime = 0;
  let activeSources = new Set<AudioBufferSourceNode>();

  const ensureContext = async () => {
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: 24000 });
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  };

  const enqueue = async (base64Audio: string) => {
    const context = await ensureContext();

    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    const pcm = new Int16Array(
      bytes.buffer,
      bytes.byteOffset,
      Math.floor(bytes.byteLength / 2),
    );

    const buffer = context.createBuffer(1, pcm.length, 24000);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < pcm.length; i += 1) {
      channel[i] = pcm[i] / 32768;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const now = context.currentTime;
    nextStartTime = Math.max(nextStartTime, now);

    source.start(nextStartTime);
    nextStartTime += buffer.duration;

    activeSources.add(source);

    source.onended = () => {
      activeSources.delete(source);
    };
  };

  const stop = () => {
    for (const source of activeSources) {
      try {
        source.stop();
      } catch {
        // Source may already have ended.
      }
    }

    activeSources.clear();
    nextStartTime = 0;
  };

  const close = async () => {
    stop();

    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }
  };

  return {
    enqueue,
    stop,
    close,
  };
}
