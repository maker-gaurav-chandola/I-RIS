import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { StateBadge } from "@/components/interview/StateBadge";
import { interviewService } from "@/services/interview";
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
    loadSession();
  }, [loadSession]);

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
    await withBusy(async () => {
      const updated = await interviewService.submitAnswer(sid, {
        answer,
      });

      setAnswer("");
      setSession(updated);
    });
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
              onChange={(event) => setAnswer(event.target.value)}
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

          <Button
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </Button>
        </Card>
      )}

      {state === "not_started" && (
        <Card title="Interview not started">
          <p>
            This interview has not started yet.
          </p>

          <Button
            onClick={() => navigate("/interview/setup")}
          >
            Back to setup
          </Button>
        </Card>
      )}
    </div>
  );
}
