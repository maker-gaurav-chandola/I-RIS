import { Link } from "react-router-dom";
import { useAsyncData } from "@/hooks/useAsyncData";
import { historyService } from "@/services/history";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";

export function History() {
  const { data, loading, error } = useAsyncData(() =>
    historyService.getHistory(),
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Interview history</h1>
      </div>
      <Card>
        {loading && <Spinner label="Loading history" />}
        <ErrorBanner message={error} />
        {!loading && data && data.history.length === 0 && (
          <p className="empty-state">No completed interviews yet.</p>
        )}
        {data && data.history.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((item) => (
                <tr key={item.sessionId}>
                  <td>
                    {item.hasResults ? (
                      <Link to={`/interview/${item.sessionId}/results`}>
                        {item.topic}
                      </Link>
                    ) : (
                      item.topic
                    )}
                  </td>
                  <td>{item.interviewType}</td>
                  <td>{item.difficulty}</td>
                  <td>Completed</td>
                  <td>{item.actualScore ?? "—"}</td>
                  <td>{new Date(item.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
