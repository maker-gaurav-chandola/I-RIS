import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
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
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const currentState = session?.state;

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

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadSession]);

  /*
   * Voice lifecycle.
   *
   * Important:
   * This connects the existing VoiceSession abstraction to the UI.
   * The backend/provider still needs to provide the complete STT/TTS
   * pipeline separately.
   */
  useEffect(() => {
    if (
      session?.mode !== "Voice" ||
      currentState !== "active" ||
      !sessionId
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

        if (snapshot.errorMessage) {
          setError(snapshot.errorMessage);
        }
      },

      onTranscript: (transcript, isFinal) => {
        if (!isFinal) return;

        setVoiceTranscript((current) =>
          current ? `${current} ${transcript}` : transcript,
        );

        setAnswer((current) =>
          current ? `${current} ${transcript}` : transcript,
        );
      },

      onError: (_code, message) => {
        setError(message);
      },
    });

    setVoiceSession(sessionInstance);

    void sessionInstance.connect().catch((err) => {
      setError(
        err instanceof Error
          ? err.message
          : "Voice connection failed",
      );
    });

    return () => {
      void sessionInstance.disconnect();
      setVoiceSession(null);
      setVoiceState("idle");
    };
  }, [session?.mode, currentState, sessionId]);

  if (!sessionId) {
    return <ErrorBanner message="Interview session ID is missing." />;
  }

  const interviewSessionId = sessionId;

  if (loading) {
    return <Spinner label="Loading interview" />;
  }

  if (!session) {
    return <ErrorBanner message={error ?? "Interview not found"} />;
  }

  const state = session.state;
  const isVoice = session.mode === "Voice";

  async function withBusy(action: () => Promise<void>) {
    setBusy(true);
    setError(null);

    try {
      await action();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) return;

    await withBusy(async () => {
      const updated = await interviewService.submitAnswer(sessionId!, {
        answer,
      });

      setAnswer("");
      setSession(updated);
    });
  }

  async function handleStartSpeaking() {
    if (!voiceSession) {
      setError("Voice session is not ready yet.");
      return;
    }

    try {
      setError(null);
      setVoiceTranscript("");
      await voiceSession.startListening();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not access the microphone.",
      );
    }
  }

  async function handleStopSpeaking() {
    if (!voiceSession) return;

    try {
      await voiceSession.stopListening();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not stop microphone capture.",
      );
    }
  }

  async function handleInterrupt() {
    if (!voiceSession) return;

    try {
      await voiceSession.interrupt();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not interrupt voice session.",
      );
    }
  }

  async function handleVoiceSubmit() {
    if (!answer.trim()) {
      setError("Speak an answer before submitting.");
      return;
    }

    if (voiceSession) {
      try {
        await voiceSession.stopListening();
      } catch {
        // The answer can still be submitted if microphone shutdown fails.
      }
    }

    await handleSubmitAnswer();

    setVoiceTranscript("");
  }

  async function handleCloseInterview() {
    await withBusy(async () => {
      if (voiceSession) {
        try {
          await voiceSession.stopListening();
        } catch {
          // Continue with interview closing.
        }
      }

      const updated = await interviewService.submitClosing(interviewSessionId);
      setSession(updated);
    });
  }

  async function handleExpectedScore() {
    await withBusy(async () => {
      const updated = await interviewService.submitExpectedScore(
        sessionId!,
        {
          expectedScore,
        },
      );

      setSession(updated);
    });
  }

  async function handleEvaluate() {
    await withBusy(async () => {
      await evaluationService.evaluate(interviewSessionId);
      navigate(`/interview/${interviewSessionId}/results`);
    });
  }

  function getVoiceLabel() {
    switch (voiceState) {
      case "connecting":
        return "Connecting...";
      case "listening":
        return "Listening";
      case "processing":
        return "Processing";
      case "speaking":
        return "Interviewer speaking";
      case "interrupted":
        return "Interrupted";
      case "error":
        return "Voice error";
      case "disconnected":
        return "Disconnected";
      default:
        return "Ready to speak";
    }
  }

  return (
    <div className="page-stack active-interview-page">

      <div className="interview-header-card">
        <div>
          <div className="eyebrow">
            INTERVIEW WORKSPACE / {isVoice ? "VOICE" : "TEXT"}
          </div>

          <h1>{session.topic}</h1>

          <p className="muted">
            {session.interviewType} · {session.difficulty} ·{" "}
            {session.language}
          </p>
        </div>

        <div className="session-status-pill">
          <span className="status-dot" />
          {session.duration} min session
        </div>
      </div>

      <div className="interview-progress-strip">
        <div className="progress-step active">
          <strong>01</strong>
          <span>Question</span>
        </div>

        <div className="progress-step active">
          <strong>02</strong>
          <span>Response</span>
        </div>

        <div className="progress-step">
          <strong>03</strong>
          <span>Analysis</span>
        </div>

        <div className="progress-step">
          <strong>04</strong>
          <span>Next move</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {state === "active" && (
        <>
          <Card>
            <div className="question-panel">
              <div className="eyebrow">CURRENT QUESTION</div>

              <div className="question-text">
                {session.currentQuestion ??
                  "The interviewer is preparing the next question..."}
              </div>
            </div>
          </Card>

          {isVoice ? (
            <Card>
              <div className="voice-workspace">

                <div className="voice-interviewer">
                  <div className="voice-avatar">
                    <span className="voice-avatar-pulse" />
                    <span>R</span>
                  </div>

                  <div>
                    <div className="eyebrow">
                      I-RIS INTERVIEWER
                    </div>

                    <h2>Voice Interview</h2>

                    <p className="muted">
                      Speak naturally. I-RIS will capture your response
                      and continue the interview.
                    </p>
                  </div>
                </div>

                <div className={`voice-state voice-state-${voiceState}`}>
                  <span className="voice-state-dot" />
                  {getVoiceLabel()}
                </div>

                <div className="voice-mic-zone">
                  <button
                    type="button"
                    className={`voice-mic-button ${
                      voiceState === "listening"
                        ? "is-listening"
                        : ""
                    }`}
                    onClick={
                      voiceState === "listening"
                        ? handleStopSpeaking
                        : handleStartSpeaking
                    }
                    disabled={
                      busy ||
                      voiceState === "connecting" ||
                      voiceState === "processing"
                    }
                    aria-label={
                      voiceState === "listening"
                        ? "Stop speaking"
                        : "Start speaking"
                    }
                  >
                    <span className="voice-mic-icon">??</span>
                  </button>

                  <div className="voice-mic-title">
                    {voiceState === "listening"
                      ? "Listening..."
                      : "Tap to speak"}
                  </div>

                  <div className="voice-mic-help">
                    {voiceState === "listening"
                      ? "Speak your answer clearly"
                      : "Microphone is ready"}
                  </div>
                </div>

                <div className="voice-transcript-panel">
                  <div className="voice-transcript-header">
                    <span>LIVE TRANSCRIPT</span>

                    {voiceState === "listening" && (
                      <span className="transcript-live">
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="voice-transcript">
                    {voiceTranscript ||
                      "Your spoken response will appear here..."}
                  </div>
                </div>

                <div className="voice-controls">
                  <Button
                    variant="ghost"
                    onClick={handleInterrupt}
                    disabled={
                      !voiceSession ||
                      busy ||
                      voiceState === "idle" ||
                      voiceState === "disconnected"
                    }
                  >
                    Interrupt
                  </Button>

                  <Button
                    onClick={handleVoiceSubmit}
                    loading={busy}
                    disabled={!answer.trim()}
                  >
                    Submit response
                  </Button>
                </div>

                <div className="voice-secondary-actions">
                  <Button
                    variant="ghost"
                    onClick={handleCloseInterview}
                    disabled={busy}
                  >
                    End interview
                  </Button>
                </div>

              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-response-workspace">
                <label className="field-label">
                  Your response
                </label>

                <textarea
                  className="text-response-area"
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  placeholder="Write your answer here"
                  disabled={busy}
                />

                <div className="response-actions">
                  <Button
                    onClick={handleSubmitAnswer}
                    loading={busy}
                    disabled={!answer.trim()}
                  >
                    Submit answer
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleCloseInterview}
                    disabled={busy}
                  >
                    End interview
                  </Button>
                </div>
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
            Your expected score is a self-assessment. It is stored with
            the interview but is not used to calculate your actual
            evaluation score.
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

          <Button
            onClick={handleExpectedScore}
            loading={busy}
          >
            Submit expected score
          </Button>
        </Card>
      )}

      {state === "completed" && (
        <Card title="Interview completed">
          <p>
            Your interview is complete. Generate your evaluation to
            see your performance feedback.
          </p>

          <Button
            onClick={handleEvaluate}
            loading={busy}
          >
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
          <p>
            This interview has not started yet.
          </p>

          <Button onClick={() => navigate("/interview/setup")}>
            Back to setup
          </Button>
        </Card>
      )}

    </div>
  );
}



