import { useEffect, useState, type ReactElement } from "react";
import { VoiceWorkspace } from "./interview/VoiceWorkspace";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { buildVoiceUrl } from "@/services/voiceSession";

type Session = {
  id: string;
  interviewType: string;
  topic: string;
  difficulty: string;
  duration: number;
  language: string;
  mode: string;
  state: "active" | "closing" | "completed" | "terminated";
  currentQuestion: string | null;
  pendingFollowUpQuestion: string | null;
  turnCount: number;
  expectedScore: number | null;
};

type EvaluationResult = {
  actualScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  actionableRecommendations: string[];
  evidenceSummary: string;
  generatedAt: string;
};

type ActiveInterviewProps = {
  apiBaseUrl: string;
  sessionId: string;
};

export function ActiveInterview({
  apiBaseUrl,
  sessionId,
}: ActiveInterviewProps): ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [closingScore, setClosingScore] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const voice = useVoiceInterview({
    enabled: session?.state === "active",
    sessionId,
    voiceUrl: buildVoiceUrl(apiBaseUrl),
  });

  async function loadSession(): Promise<void> {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/interview-sessions/${sessionId}`,
        { credentials: "include" },
      );

      const result = (await response.json()) as {
        session?: Session;
        error?: string;
      };

      if (!response.ok || !result.session) {
        setError(result.error ?? "Interview session could not be loaded.");
      } else {
        setSession(result.session);
      }
    } catch {
      setError("Interview session could not be loaded. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSession();
  }, [sessionId]);

  async function submitVoiceResponse(): Promise<void> {
    const text = voice.transcript.trim();

    if (!text) {
      setError("Speak an answer before submitting.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/interview-sessions/${sessionId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answer: text }),
        },
      );

      const result = (await response.json()) as {
        session?: Session;
        error?: string;
      };

      if (!response.ok || !result.session) {
        setError(result.error ?? "Answer could not be submitted.");
        return;
      }

      setSession(result.session);
      voice.clearTranscript();
    } catch {
      setError("Answer could not be submitted. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function terminate(): Promise<void> {
    setError("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/interview-sessions/${sessionId}/close`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const result = (await response.json()) as {
        session?: Session;
        error?: string;
      };

      if (!response.ok || !result.session) {
        setError(result.error ?? "Interview could not be closed.");
        return;
      }

      setSession(result.session);
    } catch {
      setError("Interview could not be closed. Check your connection.");
    }
  }

  async function submitExpectedScore(): Promise<void> {
    const numericScore = Number(closingScore);

    if (
      !Number.isFinite(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      setError("Provide a valid expected score from 0 to 100.");
      return;
    }

    setError("");
    setSubmittingScore(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/interview-sessions/${sessionId}/expected-score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ expectedScore: numericScore }),
        },
      );

      const result = (await response.json()) as {
        session?: Session;
        error?: string;
      };

      if (!response.ok || !result.session) {
        setError(result.error ?? "Expected score could not be submitted.");
        return;
      }

      setSession(result.session);
      setClosingScore("");
    } catch {
      setError(
        "Expected score could not be submitted. Check your connection.",
      );
    } finally {
      setSubmittingScore(false);
    }
  }

  async function loadResults(forceGenerate = false): Promise<void> {
    setError("");
    setLoadingResults(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/interview-sessions/${sessionId}/${forceGenerate ? "evaluate" : "results"}`,
        {
          method: forceGenerate ? "POST" : "GET",
          credentials: "include",
        },
      );

      const result = (await response.json()) as {
        evaluation?: EvaluationResult;
        error?: string;
      };

      if (!response.ok || !result.evaluation) {
        setError(result.error ?? "Evaluation could not be generated.");
        return;
      }

      setEvaluation(result.evaluation);
    } catch {
      setError("Evaluation could not be loaded. Check your connection.");
    } finally {
      setLoadingResults(false);
    }
  }

  useEffect(() => {
    if (session?.state === "completed" && !evaluation && !loadingResults) {
      void loadResults(true);
    }
  }, [evaluation, loadingResults, session?.state]);

  if (loading) {
    return (
      <section className="session-entry">
        <p className="status">Loading interview...</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="session-entry">
        <p className="error">{error || "Interview session not found."}</p>
      </section>
    );
  }

  if (session.state === "closing") {
    return (
      <section
        className="session-entry"
        aria-labelledby="session-state-heading"
      >
        <p className="eyebrow">Closing conversation</p>
        <h2 id="session-state-heading">Interview wrapping up.</h2>
        <p className="note">
          Thank you for participating. Before we finish, share the score you
          expected to receive. This is a self-assessment and stays separate
          from the actual evaluation.
        </p>

        <div className="question-panel">
          <label>
            Expected score
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={closingScore}
              onChange={(event) => setClosingScore(event.target.value)}
              disabled={submittingScore}
            />
          </label>

          <div className="configuration-actions">
            <button
              type="button"
              onClick={() => void submitExpectedScore()}
              disabled={submittingScore}
            >
              {submittingScore
                ? "Submitting..."
                : "Submit expected score"}
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  if (session.state === "completed") {
    return (
      <section
        className="session-entry"
        aria-labelledby="session-state-heading"
      >
        <p className="eyebrow">Interview complete</p>
        <h2 id="session-state-heading">Results are ready.</h2>
        <p className="note">
          The actual evaluation comes from your interview evidence and is
          kept separate from your self-assessment.
        </p>

        {session.expectedScore != null && (
          <p className="note">
            Your self-assessment: {session.expectedScore} / 100
          </p>
        )}

        {!evaluation && (
          <div className="configuration-actions">
            <button
              type="button"
              onClick={() => void loadResults(true)}
              disabled={loadingResults}
            >
              {loadingResults ? "Generating results..." : "View results"}
            </button>
          </div>
        )}

        {evaluation && (
          <div className="results-report">
            <div className="results-score">
              <p className="eyebrow">Actual evaluation</p>
              <strong>{evaluation.actualScore}</strong>
              <span>actual score / 100</span>
            </div>

            <div className="results-assessment">
              <p className="eyebrow">Overall assessment</p>
              <p>{evaluation.overallAssessment}</p>
              <p className="results-evidence">
                <strong>Evidence:</strong> {evaluation.evidenceSummary}
              </p>
            </div>

            <div className="results-section">
              <p><strong>Strengths</strong></p>
              <ul>
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="results-section">
              <p><strong>Weaknesses</strong></p>
              <ul>
                {evaluation.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="results-section">
              <p><strong>Improvement areas</strong></p>
              <ul>
                {evaluation.improvementAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="results-section">
              <p><strong>What should you practice next?</strong></p>
              <ul>
                {evaluation.actionableRecommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => void loadResults(true)}
              disabled={loadingResults}
            >
              {loadingResults ? "Generating..." : "Retry evaluation"}
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  if (session.state !== "active") {
    return (
      <section
        className="session-entry"
        aria-labelledby="session-state-heading"
      >
        <p className="eyebrow">Interview session</p>
        <h2 id="session-state-heading">Interview {session.state}.</h2>
        <p className="note">
          Your completed turns were preserved. Evaluation and results belong to
          a later stage of the session.
        </p>

        {session.expectedScore != null && (
          <p className="note">
            Expected score: {session.expectedScore} / 100
          </p>
        )}

        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  return (
    <section
      className="active-interview"
      aria-labelledby="active-interview-heading"
    >
      <div className="sheet">
        <div className="session-header">
          <div>
            <p className="eyebrow">Interview workspace / voice</p>
            <h2 id="active-interview-heading">{session.topic}</h2>
          </div>

          <span className="status numeral">
            {session.duration} min session
          </span>
        </div>
      </div>

      <p className="session-context">
        {session.interviewType} ? {session.difficulty} ? {session.language} ?
        Question {session.turnCount + 1}
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <VoiceWorkspace
        voice={voice}
        question={session.currentQuestion}
        isFollowUp={Boolean(session.pendingFollowUpQuestion)}
        language={session.language}
        busy={submitting}
        onSubmit={() => void submitVoiceResponse()}
        onEnd={() => void terminate()}
      />
    </section>
  );
}
