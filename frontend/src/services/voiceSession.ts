import type {
  VoiceErrorCode,
  VoiceSession,
  VoiceState,
  VoiceStateSnapshot,
} from "@/types/voice";
import { createMicrophoneCapture } from "./microphone";

export interface VoiceSessionOptions {
  url: string;
  sessionId: string;
  onStateChange?: (snapshot: VoiceStateSnapshot) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (code: VoiceErrorCode, message: string) => void;
}

// Voice socket lives on the same host as the API. If VITE_API_BASE_URL is
// set, derive ws(s)://<api host>/voice from it; otherwise fall back to the
// page's own host (only works when a dev/prod proxy forwards /voice).
export function buildVoiceUrl(
  apiBaseUrl: string,
  location: { protocol: string; host: string } = window.location,
): string {
  if (apiBaseUrl) {
    const api = new URL(apiBaseUrl);
    const protocol = api.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${api.host}/voice`;
  }
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/voice`;
}

export function createVoiceSession(
  options: VoiceSessionOptions,
): VoiceSession {
  const microphone = createMicrophoneCapture();

  let socket: WebSocket | null = null;
  let state: VoiceState = "idle";
  let errorCode: VoiceErrorCode | undefined;
  let errorMessage: string | undefined;

  const updateState = (
    nextState: VoiceState,
    nextErrorCode?: VoiceErrorCode,
    nextErrorMessage?: string,
  ) => {
    state = nextState;
    errorCode = nextErrorCode;
    errorMessage = nextErrorMessage;

    options.onStateChange?.({
      state,
      ...(errorCode ? { errorCode } : {}),
      ...(errorMessage ? { errorMessage } : {}),
    });
  };

  microphone.onAudio((audio) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(audio);
    }
  });

  return {
    async connect() {
      if (socket?.readyState === WebSocket.OPEN) return;

      updateState("connecting");

      await new Promise<void>((resolve, reject) => {
        const separator = options.url.includes("?") ? "&" : "?";
        socket = new WebSocket(`${options.url}${separator}sessionId=${encodeURIComponent(options.sessionId)}`);

        socket.onopen = () => {
          // Connected is not the same as listening: the microphone is only
          // opened by startListening(), so report "idle" (ready) here.
          updateState("idle");
          resolve();
        };

        socket.onerror = () => {
          updateState(
            "error",
            "CONNECTION_FAILED",
            "Voice connection failed.",
          );
          options.onError?.(
            "CONNECTION_FAILED",
            "Voice connection failed.",
          );
          reject(new Error("Voice connection failed"));
        };

        socket.onclose = () => {
          if (state !== "error") {
            updateState("disconnected");
          }
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === "state") {
              updateState(message.state);
            } else if (message.type === "transcription") {
              options.onTranscript?.(
                message.transcript,
                Boolean(message.isFinal),
              );
            } else if (message.type === "error") {
              updateState(
                "error",
                message.code,
                message.message,
              );
              options.onError?.(message.code, message.message);
            } else if (message.type === "interrupted") {
              updateState("interrupted");
            }
          } catch {
            updateState(
              "error",
              "CONNECTION_FAILED",
              "Invalid voice message.",
            );
          }
        };
      });
    },

    async disconnect() {
      microphone.stop();
      socket?.close();
      socket = null;
      updateState("disconnected");
    },

    async startListening() {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("Voice session is not connected");
      }

      await microphone.start();
      updateState("listening");
    },

    async stopListening() {
      microphone.stop();

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "stopListening" }));
      }

      updateState("processing");
    },

    async interrupt() {
      microphone.stop();

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "interrupt" }));
      }

      updateState("interrupted");
    },

    getState() {
      return {
        state,
        ...(errorCode ? { errorCode } : {}),
        ...(errorMessage ? { errorMessage } : {}),
      };
    },
  };
}
