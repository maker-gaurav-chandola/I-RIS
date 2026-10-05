import type { VoiceState } from "@/types/voice";

export interface VoiceStateView {
  label: string;
  hint: string;
}

// What the candidate sees for each voice state. `connected` is tracked
// separately from VoiceState because "idle" means both "not connected yet"
// and "connected, mic closed".
export function describeVoiceState(
  state: VoiceState,
  connected: boolean,
): VoiceStateView {
  switch (state) {
    case "connecting":
      return { label: "Connecting", hint: "Setting up the voice connection…" };
    case "listening":
      return { label: "Listening", hint: "Speak your answer, then tap to stop." };
    case "processing":
      return { label: "Processing", hint: "Turning your speech into a transcript…" };
    case "speaking":
      return { label: "Interviewer speaking", hint: "You can interrupt if you need to." };
    case "interrupted":
      return { label: "Interrupted", hint: "Tap the microphone when you're ready." };
    case "error":
      return { label: "Voice unavailable", hint: "Retry voice, or answer by typing." };
    case "disconnected":
      return { label: "Disconnected", hint: "Retry voice, or answer by typing." };
    case "idle":
    default:
      return connected
        ? { label: "Ready", hint: "Tap the microphone and speak your answer." }
        : { label: "Preparing", hint: "Setting up the voice connection…" };
  }
}

export type MicAction = "start" | "stop" | "none";

export function getMicAction(
  state: VoiceState,
  connected: boolean,
  busy: boolean,
): MicAction {
  if (busy || !connected) return "none";
  if (state === "listening") return "stop";
  if (state === "idle" || state === "interrupted") return "start";
  return "none";
}

// A transcript can only be submitted once capture has stopped and the
// transcript has settled, otherwise a late final fragment could be lost.
export function canSubmitVoiceResponse(
  state: VoiceState,
  transcript: string,
  busy: boolean,
): boolean {
  return (
    !busy &&
    transcript.trim().length > 0 &&
    state !== "listening" &&
    state !== "processing"
  );
}

export function describeMicrophoneError(err: unknown): string {
  const name =
    typeof err === "object" && err !== null && "name" in err
      ? String((err as { name: unknown }).name)
      : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Microphone access is blocked. Allow the microphone in your browser and try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No microphone was found. Connect one and try again.";
    case "NotReadableError":
      return "The microphone is in use by another app.";
    default:
      return err instanceof Error && err.message
        ? err.message
        : "Could not start the microphone.";
  }
}
