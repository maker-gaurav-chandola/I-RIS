import type { InterviewLifecycleState } from "@/types/interview";

// Purely presentational. It labels whatever state the backend reports — it
// never decides what the next state should be.
const LABELS: Record<InterviewLifecycleState, string> = {
  not_started: "Not started",
  active: "In progress",
  closing: "Wrapping up",
  completed: "Completed",
  terminated: "Terminated",
};

export function StateBadge({ state }: { state: InterviewLifecycleState }) {
  return (
    <span className={`state-badge state-${state.toLowerCase()}`}>
      {LABELS[state]}
    </span>
  );
}
