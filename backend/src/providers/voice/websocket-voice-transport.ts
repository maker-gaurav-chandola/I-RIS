import type { VoiceTransport, VoiceTransportMessage } from "./voice-transport.js";

export function createVoiceTransport(url: string): VoiceTransport {
  let socket: WebSocket | null = null;
  let messageHandler: ((message: VoiceTransportMessage) => void) | null = null;

  return {
    connect() {
      return new Promise((resolve, reject) => {
        socket = new WebSocket(url);

        socket.onopen = () => resolve();

        socket.onerror = () => {
          reject(new Error("Voice transport connection failed"));
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as VoiceTransportMessage;
            messageHandler?.(message);
          } catch {
            messageHandler?.({
              type: "error",
              code: "CONNECTION_FAILED",
              message: "Invalid voice transport message",
            });
          }
        };
      });
    },

    disconnect() {
      socket?.close();
      socket = null;
      return Promise.resolve();
    },

    sendAudio(audio) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(audio);
      }
    },

    sendInterrupt() {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "interrupt" }));
      }
    },

    onMessage(handler) {
      messageHandler = handler;
    },
  };
}
