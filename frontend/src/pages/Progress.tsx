import { useAsyncData } from "@/hooks/useAsyncData";
import { historyService } from "@/services/history";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";

// Only the fields the architecture doc actually lists: completed
// interviews, average score, latest/previous score, score change,
// direction. No invented analytics beyond this.
export function Progress() {
  const { data, loading, error } = useAsyncData(() =>
    historyService.getProgress(),
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your progress</h1>
      </div>
      {loading && <Spinner label="Loading progress" />}
      <ErrorBanner message={error} />
      {data && (
        <div className="progress-grid">
          <Card title="Completed interviews">
            <div className="stat-value">{data.totalCompleted}</div>
          </Card>
          <Card title="Average score">
            <div className="stat-value">{data.averageScore ?? "—"}</div>
          </Card>
          <Card title="Latest score">
            <div className="stat-value">{data.latestScore ?? "—"}</div>
          </Card>
          <Card title="Previous score">
            <div className="stat-value">{data.previousScore ?? "—"}</div>
          </Card>
          <Card title="Trend">
            <div className={`trend trend-${data.direction}`}>
              {data.direction}
              {data.scoreChange !== null && (
                <span className="trend-delta">
                  {data.scoreChange > 0 ? "+" : ""}
                  {data.scoreChange}
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
