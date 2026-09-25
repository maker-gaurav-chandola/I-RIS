import type { ReactElement } from "react";

export function InterviewSessionEntry(): ReactElement {
  return (
    <section className="session-entry" aria-labelledby="session-entry-heading">
      <p className="eyebrow">Interview session entry point</p>
      <h2 id="session-entry-heading">Interview session is ready for Step 6.</h2>
      <p className="note">
        No question, timer, answer, AI call, evaluation, or interview record has
        been created.
      </p>
    </section>
  );
}
