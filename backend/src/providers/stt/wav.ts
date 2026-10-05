export function pcm16ToWav(
  pcm: ArrayBuffer,
  sampleRate = 16000,
  channels = 1,
): ArrayBuffer {
  const pcmBytes = new Uint8Array(pcm);
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + pcmBytes.byteLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcmBytes.byteLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, pcmBytes.byteLength, true);

  new Uint8Array(buffer, headerSize).set(pcmBytes);

  return buffer;
}
