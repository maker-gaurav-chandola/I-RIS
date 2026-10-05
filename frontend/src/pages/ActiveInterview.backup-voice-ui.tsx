import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { StateBadge } from "@/components/interview/StateBadge";
import { interviewService } from "@/services/interview";
import { createVoiceSession } from "@/services/voiceSession";
import type {
  VoiceSession,
  VoiceState,
  VoiceStateSnapshot,
} from "@/types/voice";
import { evaluationService } from "@/services/evaluation";
import { ApiError } from "@/services/http";
import type { InterviewSession } from "@/types/interview";

const VOICE_LABELS: Record<VoiceState, string> = {
  idle: "Voice ready",
  connecting: "Connecting...",
  listening: "Listening",
  processing: "Processing your answer",
  speaking: "Interviewer speaking",
  interrupted: "Interrupted",
  error: "Voice error",
  disconnected: "Voice disconnected",
};

export function ActiveInterview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answer, setAnswer] = useState("");
  const [expectedScore, setExpectedScore] = useState(70);

  const [voiceSession, setVoiceSession] = useState<VoiceSession | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const data = await interviewService.getSession(sessionId);
      setSession(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load this interview",
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();

    const intervalId = window.setInterval(() => {
      void loadSession();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadSession]);

  useEffect(() => {
    if (
      !sessionId ||
      !session ||
      session.mode.toLowerCase() !== "voice" ||
      session.state !== "active"
    ) {
      return;
    }

    const protocol =
      window.location.protocol === "https:" ? "wss" : "ws";

    const sessionInstance = createVoiceSession({
      url: `${protocol}://${window.location.host}/voice`,
      sessionId,
      onStateChange: (snapshot: VoiceStateSnapshot) => {
        setVoiceState(snapshot.state);
        setVoiceError(snapshot.errorMessage ?? null);
      },
      onTranscript: (transcript, isFinal) => {
        if (!transcript.trim()) return;

        if (isFinal) {
          setAnswer((current) =>
            current ? `${current} ${transcript}` : transcript,
          );
        }
      },
      onError: (_code, message) => {
        setVoiceError(message);
      },
    });

    setVoiceSession(sessionInstance);

    void sessionInstance.connect().catch((err) => {
      setVoiceError(
        err instanceof Error
          ? err.message
          : "Voice connection failed.",
      );
    });

    return () => {
      void sessionInstance.disconnect();
      setVoiceSession(null);
    };
  }, [sessionId, session?.mode, session?.state]);

  if (!sessionId) {
    return <ErrorBanner message="Interview session ID is missing." />;
  }

  if (loading) {
    return <Spinner label="Loading interview" />;
  }

  if (!session) {
    return <ErrorBanner message={error ?? "Interview not found"} />;
  }

  const sid = sessionId;
  const state = session.state;
  const isVoice = session.mode.toLowerCase() === "voice";

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setError(null);

    try {
      await action();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) return;

    await withBusy(async () => {
      const updated = await interviewService.submitAnswer(sid, {
        answer: answer.trim(),
      });

      setAnswer("");
      setSession(updated);
    });
  }

  async function handleStartListening() {
    if (!voiceSession) {
      setVoiceError("Voice session is not connected yet.");
      return;
    }

    try {
      setVoiceError(null);
      await voiceSession.startListening();
    } catch (err) {
      setVoiceError(
        err instanceof Error
          ? err.message
          : "Microphone could not be started.",
      );
    }
  }

  async function handleStopListening() {
    if (!voiceSession) return;

    try {
      await voiceSession.stopListening();
    } catch (err) {
      setVoiceError(
        err instanceof Error
          ? err.message
          : "Could not stop microphone.",
      );
    }
  }

  async function handleInterrupt() {
    if (!voiceSession) return;

    try {
      await voiceSession.interrupt();
    } catch (err) {
      setVoiceError(
        err instanceof Error
          ? err.message
          : "Could not interrupt voice session.",
      );
    }
  }

  async function handleExpectedScore() {
    await withBusy(async () => {
      const updated = await interviewService.submitExpectedScore(sid, {
        expectedScore,
      });

      setSession(updated);
    });
  }

  async function handleEvaluate() {
    await withBusy(async () => {
      await evaluationService.evaluate(sid);
      navigate(`/interview/${sid}/results`);
    });
  }

  return (
    <div className="page interview-page">
      <div className="page-header">
        <div>
          <p className="hero-eyebrow">
            {isVoice
              ? "Voice interview / Live"
              : "Text interview / Live"}
          </p>

          <h1>{session.topic}</h1>

          <p className="muted">
            {session.interviewType} · {session.difficulty} ·{" "}
            {session.language} · {session.mode}
          </p>
        </div>

        <StateBadge state={state} />
      </div>

      <ErrorBanner message={error} />

      {state === "active" && (
        <>
          <div className="interview-progress">
            <div className="interview-progress-step active">
              <span>01</span>
              <strong>Question</strong>
            </div>

            <div
              className={`interview-progress-step ${
                answer ? "active" : ""
              }`}
            >
              <span>02</span>
              <strong>{isVoice ? "Your turn" : "Response"}</strong>
            </div>

            <div className="interview-progress-step">
              <span>03</span>
              <strong>Analysis</strong>
            </div>

            <div className="interview-progress-step">
              <span>04</span>
              <strong>Next move</strong>
            </div>
          </div>

          {isVoice ? (
            <div className="voice-interview-workspace">
              <section className="voice-question-panel">
                <div className="voice-panel-label">
                  CURRENT QUESTION
                </div>

                <div className="voice-interviewer">
                  <div className="voice-avatar">
                    <span>IR</span>
                  </div>

                  <div>
                    <span className="voice-role">
                      I-RIS Interviewer
                    </span>

                    <span
                      className={`voice-state ${
                        voiceState === "speaking"
                          ? "is-speaking"
                          : ""
                      }`}
                    >
                      {VOICE_LABELS[voiceState]}
                    </span>
                  </div>
                </div>

                <div className="voice-question-text">
                  {session.currentQuestion ??
                    "Waiting for the next question..."}
                </div>

                <div className="voice-speaking-bars">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </section>

              <section className="voice-response-panel">
                <div className="voice-panel-label">
                  YOUR RESPONSE
                </div>

                <div
                  className={`voice-mic-orb ${
                    voiceState === "listening"
                      ? "is-listening"
                      : voiceState === "processing"
                        ? "is-processing"
                        : ""
                  }`}
                >
                  <span className="voice-mic-icon">🎙</span>
                </div>

                <h2>
                  {VOICE_LABELS[voiceState]}
                </h2>

                <p className="muted voice-help">
                  Speak naturally. Your response will appear as
                  transcription below.
                </p>

                <div className="voice-waveform" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="voice-transcript">
                  <span className="voice-transcript-label">
                    Live transcription
                  </span>

                  <p>
                    {answer ||
                      "Your spoken response will appear here..."}
                  </p>
                </div>

                {voiceError && (
                  <div className="voice-error" role="alert">
                    <strong>Voice issue</strong>
                    <span>{voiceError}</span>
                  </div>
                )}

                <div className="voice-controls">
                  {voiceState === "listening" ? (
                    <Button
                      onClick={handleStopListening}
                      disabled={busy}
                    >
                      Stop speaking
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartListening}
                      disabled={
                        busy ||
                        voiceState === "connecting" ||
                        voiceState === "processing"
                      }
                    >
                      Start speaking
                    </Button>
                  )}

                  {voiceState === "speaking" && (
                    <Button
                      variant="secondary"
                      onClick={handleInterrupt}
                    >
                      Interrupt interviewer
                    </Button>
                  )}
                </div>

                <div className="voice-secondary-actions">
                  <button
                    type="button"
                    className="voice-text-fallback"
                    onClick={() =>
                      setVoiceError(
                        "Text fallback UI will be enabled in the next voice UI step.",
                      )
                    }
                  >
                    Switch to text fallback
                  </button>

                  <button
                    type="button"
                    className="voice-end-button"
                    onClick={() =>
                      void withBusy(async () => {
                        const updated =
                          await interviewService.terminate(sid);
                        setSession(updated);
                      })
                    }
                  >
                    End interview
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <Card title="Interview">
              <div className="question-block">
                <p className="block-label">Question</p>

                <p className="question-text">
                  {session.currentQuestion ??
                    "Waiting for the next question..."}
                </p>
              </div>

              <div className="response-block">
                <p className="block-label">Your response</p>

                <textarea
                  className="answer-input"
                  rows={7}
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  disabled={busy}
                />
              </div>

              <div className="interview-submit-row">
                <Button
                  onClick={handleSubmitAnswer}
                  loading={busy}
                  disabled={!answer.trim()}
                >
                  Submit answer
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {state === "closing" && (
        <Card title="Interview complete">
          <p>
            The interview is wrapping up. Before we generate your
            evaluation, give us your own expected score.
          </p>

          <p className="muted">
            Your expected score is a self-assessment. It is stored
            with the interview but is not used to calculate your
            actual evaluation score.
          </p>

          <div className="score-control">
            <input
              type="range"
              min={0}
              max={100}
              value={expectedScore}
              onChange={(event) =>
                setExpectedScore(Number(event.target.value))
              }
              disabled={busy}
            />

            <div className="score-readout">
              {expectedScore}
            </div>
          </div>

          <Button onClick={handleExpectedScore} loading={busy}>
            Submit expected score
          </Button>
        </Card>
      )}

      {state === "completed" && (
        <Card title="Interview completed">
          <p>
            Your interview is complete. Generate your evaluation
            to see your performance feedback.
          </p>

          <Button onClick={handleEvaluate} loading={busy}>
            Get evaluation
          </Button>
        </Card>
      )}

      {state === "terminated" && (
        <Card title="Interview terminated">
          <p>
            This interview session was terminated and can no longer
            accept answers.
          </p>

          <Button onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </Card>
      )}

      {state === "not_started" && (
        <Card title="Interview not started">
          <p>This interview has not started yet.</p>

          <Button onClick={() => navigate("/interview/setup")}>
            Back to setup
          </Button>
        </Card>
      )}
    </div>
  );
}
