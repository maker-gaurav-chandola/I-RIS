import { useState, type ReactElement } from "react";
import type { VoiceInterviewController } from "@/hooks/useVoiceInterview";
import {
  canSubmitVoiceResponse,
  describeVoiceState,
  getMicAction,
} from "./voiceStateView";

interface VoiceWorkspaceProps {
  voice: VoiceInterviewController;
  question: string | null;
  isFollowUp: boolean;
  language: string;
  busy: boolean;
  onSubmit: () => void;
  onEnd: () => void;
  onUseText: () => void;
}

// Voice-first interview surface. It renders only what the voice session
// actually reports: no simulated speech, no fake waveform activity.
export function VoiceWorkspace({
  voice,
  question,
  isFollowUp,
  language,
  busy,
  onSubmit,
  onEnd,
  onUseText,
}: VoiceWorkspaceProps): ReactElement {
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const { state, connected, transcript, interimTranscript, error } = voice;

  const view = describeVoiceState(state, connected);
  const micAction = getMicAction(state, connected, busy);
  const canSubmit = canSubmitVoiceResponse(state, transcript, busy);
  const voiceDown = state === "error" || state === "disconnected";

  function handleMicClick() {
    if (micAction === "start") void voice.startListening();
    else if (micAction === "stop") void voice.stopListening();
  }

  return (
    <div className="voice-interview-workspace">
      <section className="voice-question-panel" aria-label="Interviewer">
        <div className="voice-panel-label">
          {isFollowUp ? "FOLLOW-UP QUESTION" : "CURRENT QUESTION"}
        </div>

        <div className="voice-interviewer">
          <div className="voice-avatar">
            <span>IR</span>
          </div>
          <div>
            <span className="voice-role">I-RIS Interviewer</span>
            <span
              className={`voice-state ${state === "speaking" ? "is-speaking" : ""}`}
              aria-live="polite"
            >
              {view.label}
            </span>
          </div>
        </div>

        <div className="voice-question-text">
          {question ?? "Waiting for the next question..."}
        </div>

        {state === "speaking" && (
          <div className="voice-speaking-bars" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
        )}
      </section>

      <section className="voice-response-panel" aria-label="Your response">
        <div className="voice-panel-label">YOUR RESPONSE · {language.toUpperCase()}</div>

        <button
          type="button"
          className={`voice-mic-orb ${
            state === "listening"
              ? "is-listening"
              : state === "processing"
                ? "is-processing"
                : ""
          }`}
          onClick={handleMicClick}
          disabled={micAction === "none"}
          aria-pressed={state === "listening"}
          aria-label={
            micAction === "stop" ? "Stop speaking" : "Start speaking"
          }
        >
          <span className="voice-mic-icon" aria-hidden="true">🎙</span>
        </button>

        <h2>{view.label}</h2>
        <p className="muted voice-help">{view.hint}</p>

        <div className="voice-transcript" aria-live="polite">
          <span className="voice-transcript-label">
            {state === "listening" ? "Live transcription" : "Transcription"}
          </span>
          <p>
            {transcript || interimTranscript ? (
              <>
                {transcript}
                {interimTranscript && (
                  <span className="voice-interim">
                    {transcript ? " " : ""}
                    {interimTranscript}
                  </span>
                )}
              </>
            ) : (
              "Your spoken response will appear here."
            )}
          </p>
        </div>

        {error && (
          <div className="voice-error" role="alert">
            <strong>Voice issue</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="voice-controls">
          <button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {busy ? "Submitting..." : "Submit response"}
          </button>

          {transcript && state !== "listening" && state !== "processing" && (
            <button
              type="button"
              className="secondary-button"
              onClick={voice.clearTranscript}
              disabled={busy}
            >
              Clear and re-record
            </button>
          )}

          {state === "speaking" && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => void voice.interrupt()}
            >
              Interrupt interviewer
            </button>
          )}

          {voiceDown && (
            <button
              type="button"
              className="secondary-button"
              onClick={voice.retry}
            >
              Retry voice
            </button>
          )}
        </div>

        <div className="voice-secondary-actions">
          <button
            type="button"
            className="voice-text-fallback"
            onClick={onUseText}
            disabled={busy || state === "listening"}
          >
            Answer by typing instead
          </button>

          {confirmingEnd ? (
            <span className="voice-end-confirm">
              End interview and go to the closing?{" "}
              <button
                type="button"
                className="voice-end-button"
                onClick={onEnd}
                disabled={busy}
              >
                Yes, end
              </button>{" "}
              <button
                type="button"
                className="voice-text-fallback"
                onClick={() => setConfirmingEnd(false)}
              >
                Keep going
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="voice-end-button"
              onClick={() => setConfirmingEnd(true)}
              disabled={busy}
            >
              End interview
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
