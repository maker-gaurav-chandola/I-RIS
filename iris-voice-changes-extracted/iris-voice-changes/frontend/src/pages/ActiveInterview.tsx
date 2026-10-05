import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { VoiceWorkspace } from "@/components/interview/VoiceWorkspace";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { interviewService } from "@/services/interview";
import { evaluationService } from "@/services/evaluation";
import { ApiError } from "@/services/http";
import { isVoiceMode } from "@/services/interviewMode";
import { buildVoiceUrl } from "@/services/voiceSession";
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

  const [textFallback, setTextFallback] = useState(false);

  const voiceMode = session != null && isVoiceMode(session.mode);
  const voice = useVoiceInterview({
    enabled: voiceMode && session?.state === "active" && !textFallback,
    sessionId: sessionId ?? "",
    voiceUrl: buildVoiceUrl(import.meta.env.VITE_API_BASE_URL ?? ""),
  });

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
  const isVoice = voiceMode;

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
      const updated = await interviewService.submitAnswer(interviewSessionId, {
        answer,
      });

      setAnswer("");
      setSession(updated);
    });
  }

  async function handleVoiceSubmit() {
    const text = voice.transcript.trim();
    if (!text) return;

    await withBusy(async () => {
      const updated = await interviewService.submitAnswer(interviewSessionId, {
        answer: text,
      });

      voice.clearTranscript();
      setSession(updated);
    });
  }

  async function handleCloseInterview() {
    await withBusy(async () => {
      const updated = await interviewService.submitClosing(interviewSessionId);
      setSession(updated);
    });
  }

  async function handleExpectedScore() {
    await withBusy(async () => {
      const updated = await interviewService.submitExpectedScore(
        interviewSessionId,
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

  return (
    <div className="page-stack active-interview-page">

      <div className="interview-header-card">
        <div>
          <div className="eyebrow">
            INTERVIEW WORKSPACE / {isVoice && !textFallback ? "VOICE" : "TEXT"}
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

      {error && <ErrorBanner message={error} />}

      {state === "active" && isVoice && !textFallback && (
        <VoiceWorkspace
          voice={voice}
          question={session.currentQuestion}
          isFollowUp={Boolean(session.pendingFollowUpQuestion)}
          language={session.language}
          busy={busy}
          onSubmit={() => void handleVoiceSubmit()}
          onEnd={() => void handleCloseInterview()}
          onUseText={() => setTextFallback(true)}
        />
      )}

      {state === "active" && (!isVoice || textFallback) && (
        <>
          {isVoice && (
            <p className="voice-text-mode-note">
              <span>You are answering by typing. This is a voice interview.</span>
              <Button variant="ghost" onClick={() => setTextFallback(false)}>
                Try voice again
              </Button>
            </p>
          )}

          <Card>
            <div className="question-panel">
              <div className="eyebrow">
                {session.pendingFollowUpQuestion
                  ? "FOLLOW-UP QUESTION"
                  : "CURRENT QUESTION"}
              </div>

              <div className="question-text">
                {session.currentQuestion ??
                  "The interviewer is preparing the next question..."}
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-response-workspace">
              <label className="field-label">Your response</label>

              <textarea
                className="text-response-area"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
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
