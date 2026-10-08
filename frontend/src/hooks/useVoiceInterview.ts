import { useCallback, useEffect, useRef, useState } from "react";
import { createVoiceSession } from "@/services/voiceSession";
import { describeMicrophoneError } from "@/components/interview/voiceStateView";
import type { VoiceSession, VoiceState } from "@/types/voice";

// If the server never reports back after the mic is closed, don't leave the
// candidate stuck on "Processing" forever.
const PROCESSING_TIMEOUT_MS = 12_000;

interface UseVoiceInterviewOptions {
  enabled: boolean;
  sessionId: string;
  voiceUrl: string;
}

// Binds the existing VoiceSession abstraction (WebSocket + microphone) to
// React. It adds no transport of its own: transcripts and state changes are
// whatever the voice server sends.
export function useVoiceInterview({
  enabled,
  sessionId,
  voiceUrl,
}: UseVoiceInterviewOptions) {
  const sessionRef = useRef<VoiceSession | null>(null);
  const [state, setState] = useState<VoiceState>("idle");
  const [socketOpen, setSocketOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    setState("idle");
    setSocketOpen(false);
    setError(null);

    const session = createVoiceSession({
      url: voiceUrl,
      sessionId,
      onStateChange: (snapshot) => {
        if (disposed) return;

        setState(snapshot.state);

        if (snapshot.state === "error") {
          setError(snapshot.errorMessage ?? "Voice connection failed.");
          return;
        }

        if (snapshot.state === "listening") {
          void session.startListening().catch((err) => {
            if (disposed) return;
            setError(describeMicrophoneError(err));
            setState("error");
          });
        }
      },
      onTranscript: (text, isFinal) => {
        if (disposed || !text.trim()) return;
        if (isFinal) {
          setTranscript((current) =>
            current ? `${current} ${text.trim()}` : text.trim(),
          );
          setInterimTranscript("");
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (_code, message) => {
        if (!disposed) setError(message);
      },
    });

    sessionRef.current = session;

    session
      .connect()
      .then(() => {
        if (!disposed) setSocketOpen(true);
      })
      .catch(() => {
        // Already reported through onStateChange/onError.
      });

    return () => {
      disposed = true;
      sessionRef.current = null;
      void session.disconnect();
      setSocketOpen(false);
      setState("idle");
    };
  }, [enabled, sessionId, voiceUrl, attempt]);

  useEffect(() => {
    if (state !== "processing") return;
    const timer = window.setTimeout(() => {
      setState("idle");
      setError(
        "The voice service did not finish processing your speech. Speak again, or answer by typing.",
      );
    }, PROCESSING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const connected = socketOpen && state !== "error" && state !== "disconnected";

  const startListening = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    setError(null);
    setInterimTranscript("");
    try {
      await session.startListening();
    } catch (err) {
      setError(describeMicrophoneError(err));
    }
  }, []);

  const stopListening = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      await session.stopListening();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not stop the microphone.");
    }
  }, []);

  const interrupt = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      await session.interrupt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not interrupt.");
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  return {
    state,
    connected,
    error,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    interrupt,
    clearTranscript,
    retry,
  };
}

export type VoiceInterviewController = ReturnType<typeof useVoiceInterview>;

