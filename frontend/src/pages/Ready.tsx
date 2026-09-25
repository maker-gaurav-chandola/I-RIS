import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { interviewService } from "@/services/interview";
import { ApiError } from "@/services/http";
import type { InterviewSessionConfig } from "@/types/interview";

// Displays the chosen configuration and hands off to the Session Engine.
// The frontend does not decide the session's initial state — whatever
// createSession() returns is what gets rendered next.
export function Ready() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = (location.state as { config?: InterviewSessionConfig })
    ?.config;
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    navigate("/interview/setup", { replace: true });
    return null;
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      const session = await interviewService.createSession(
        config as InterviewSessionConfig,
      );
      navigate(`/interview/${session.id}`, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not start the interview",
      );
      setStarting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ready to begin?</h1>
      </div>
      <Card title="Your configuration">
        <ErrorBanner message={error} />
        <dl className="config-summary">
          <div>
            <dt>Type</dt>
            <dd>{config.interviewType}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>{config.topic}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{config.difficulty}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{config.duration} min</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{config.language}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{config.mode}</dd>
          </div>
        </dl>
        <div className="ready-actions">
          <Button
            variant="secondary"
            onClick={() => navigate("/interview/setup", { state: { config } })}
          >
            Edit configuration
          </Button>
          <Button onClick={handleStart} loading={starting}>
            Start interview
          </Button>
        </div>
      </Card>
    </div>
  );
}
