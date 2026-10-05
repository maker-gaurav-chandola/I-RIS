import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { VoiceWorkspace } from "./interview/VoiceWorkspace";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { buildVoiceUrl } from "@/services/voiceSession";
import { isVoiceMode } from "@/services/interviewMode";

type AnalysisCategory =
  | "strong"
  | "partial"
  | "weak"
  | "irrelevant"
  | "unclear";

type AnalysisBlock = {
  assessment: string;
  uncertain: boolean;
};

type SessionAnalysis = {
  category: AnalysisCategory;
  technicalCorrectness: AnalysisBlock;
  relevance: AnalysisBlock;
  completeness: AnalysisBlock;
  explanationQuality: AnalysisBlock;
  reasoning: AnalysisBlock;
  strengths: string[];
  missingImportantPoints: string[];
  improvementOpportunities: string[];
  analysisNotes: string;
};

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
  lastTurnAnalysisStatus: "pending" | "completed" | "failed" | null;
  lastTurnAnalysis: SessionAnalysis | null;
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
  const [answer, setAnswer] = useState("");
  const [closingScore, setClosingScore] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  // Voice is the primary mode; this only flips when the candidate (or a
  // voice failure) sends them to the text fallback.
  const [textFallback, setTextFallback] = useState(false);

  const voiceMode = session != null && isVoiceMode(session.mode);
  const voice = useVoiceInterview({
    enabled: voiceMode && session?.state === "active" && !textFallback,
    sessionId,
    voiceUrl: buildVoiceUrl(apiBaseUrl),
  });

  async function loadSession(): Promise<void> {
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
    setLoading(false);
  }

  useEffect(() => {
    void loadSession();
  }, [sessionId]);

  async function submitAnswerText(text: string): Promise<boolean> {
    if (!text.trim()) {
      setError("Answer cannot be empty.");
      return false;
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
        return false;
      }
      setSession(result.session);
      return true;
    } catch {
      setError("Answer could not be submitted. Check your connection.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswer(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (await submitAnswerText(answer)) setAnswer("");
  }

  async function submitVoiceResponse(): Promise<void> {
    if (await submitAnswerText(voice.transcript)) voice.clearTranscript();
  }

  async function terminate(): Promise<void> {
    setError("");
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
    setSubmittingScore(false);
    if (!response.ok || !result.session) {
      setError(result.error ?? "Expected score could not be submitted.");
      return;
    }
    setSession(result.session);
    setClosingScore("");
  }

  async function loadResults(forceGenerate = false): Promise<void> {
    setError("");
    setLoadingResults(true);
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
    setLoadingResults(false);
    if (!response.ok || !result.evaluation) {
      setError(result.error ?? "Evaluation could not be generated.");
      return;
    }
    setEvaluation(result.evaluation);
  }

  useEffect(() => {
    if (session?.state === "completed" && !evaluation && !loadingResults) {
      void loadResults(true);
    }
  }, [evaluation, loadingResults, session?.state]);

  if (loading)
    return (
      <section className="session-entry">
        <p className="status">Loading interview...</p>
      </section>
    );
  if (!session)
    return (
      <section className="session-entry">
        <p className="error">{error}</p>
      </section>
    );

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
          expected to receive — this is a self-assessment and stays separate
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
              {submittingScore ? "Submitting..." : "Submit expected score"}
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
          The actual evaluation below comes from your interview evidence and is
          kept separate from your self-assessment.
        </p>
        {session.expectedScore != null && (
          <p className="note">Your self-assessment: {session.expectedScore}</p>
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
              <p className="eyebrow">What happened?</p>
              <p>{evaluation.overallAssessment}</p>
              <p className="results-evidence">
                <strong>Evidence:</strong> {evaluation.evidenceSummary}
              </p>
            </div>
            <div className="results-section">
              <p>
                <strong>Strengths</strong>
              </p>
              <ul>
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="results-section">
              <p>
                <strong>Weaknesses</strong>
              </p>
              <ul>
                {evaluation.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="results-section">
              <p>
                <strong>Improvement areas</strong>
              </p>
              <ul>
                {evaluation.improvementAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="results-section">
              <p>
                <strong>Actionable recommendations</strong>
              </p>
              <ul>
                {evaluation.actionableRecommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={() => void loadResults(true)}>
              Retry evaluation
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
          <p className="note">Expected score: {session.expectedScore}</p>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  const questionPanel = (
    <div
      className={
        session.pendingFollowUpQuestion
          ? "question-panel is-follow-up"
          : "question-panel"
      }
    >
      <p className="eyebrow">
        {session.pendingFollowUpQuestion
          ? "Follow-up — from your previous response"
          : "Current question"}
      </p>
      <p>{session.currentQuestion}</p>
    </div>
  );

  return (
    <section
      className="active-interview"
      aria-labelledby="active-interview-heading"
    >
      <div className="sheet">
        <div className="session-header">
          <div>
            <p className="eyebrow">
              Interview workspace / {voiceMode && !textFallback ? "voice" : "text"}
            </p>
            <h2 id="active-interview-heading">{session.topic}</h2>
          </div>
          <span className="status numeral">{session.duration} min session</span>
        </div>
      </div>
      <p className="session-context">
        {session.interviewType} · {session.difficulty} · {session.language} ·
        Question {session.turnCount + 1}
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {voiceMode && !textFallback ? (
        <VoiceWorkspace
          voice={voice}
          question={session.currentQuestion}
          isFollowUp={Boolean(session.pendingFollowUpQuestion)}
          language={session.language}
          busy={submitting}
          onSubmit={() => void submitVoiceResponse()}
          onEnd={() => void terminate()}
          onUseText={() => setTextFallback(true)}
        />
      ) : (
        <>
          {voiceMode && (
            <p className="voice-text-mode-note">
              <span>You are answering by typing. This is a voice interview.</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setTextFallback(false)}
              >
                Try voice again
              </button>
            </p>
          )}
          {questionPanel}
          <form className="sheet answer-form" onSubmit={submitAnswer}>
            <label>
              Your response
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer here"
                rows={7}
                disabled={submitting}
              />
            </label>
            <div className="configuration-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit answer"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={terminate}
              >
                End interview
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
