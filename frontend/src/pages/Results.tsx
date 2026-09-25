import { Link, useParams } from "react-router-dom";
import { useAsyncData } from "@/hooks/useAsyncData";
import { evaluationService } from "@/services/evaluation";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { Button } from "@/components/common/Button";

export function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, loading, error } = useAsyncData(
    () => evaluationService.getResults(sessionId as string),
    [sessionId],
  );

  if (loading) return <Spinner label="Loading results" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your results</h1>
        <div className="score-pill">{data.actualScore}</div>
      </div>

      <Card title="Overall assessment">
        <p>{data.overallAssessment}</p>
      </Card>

      <div className="results-grid">
        <Card title="Strengths">
          <ul className="tag-list tag-list-positive">
            {data.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
        <Card title="Weaknesses">
          <ul className="tag-list tag-list-negative">
            {data.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Improvement areas">
        <ul className="plain-list">
          {data.improvementAreas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Card>

      <Card title="Recommendations">
        <ul className="plain-list">
          {data.actionableRecommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>

      <div className="results-actions">
        <Link to="/history">
          <Button variant="secondary">Back to history</Button>
        </Link>
        <Link to="/interview/setup" state={{ config: undefined }}>
          <Button>Practice again</Button>
        </Link>
      </div>
    </div>
  );
}
