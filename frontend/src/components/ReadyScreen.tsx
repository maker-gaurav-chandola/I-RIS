import type { ReactElement } from "react";
import type { InterviewConfiguration } from "./InterviewConfiguration";

export type ReadyAction = "edit" | "start";

export function hasValidConfiguration(
  configuration: InterviewConfiguration | null,
): configuration is InterviewConfiguration {
  return Boolean(
    configuration?.interviewType &&
    configuration.topic.trim() &&
    configuration.difficulty &&
    configuration.duration &&
    configuration.language &&
    configuration.mode,
  );
}

type ReadyScreenProps = {
  configuration: InterviewConfiguration;
  onAction: (action: ReadyAction) => void | Promise<void>;
};

export function ReadyScreen({
  configuration,
  onAction,
}: ReadyScreenProps): ReactElement {
  const summary = [
    ["Interview Type", configuration.interviewType],
    ["Topic / Skill", configuration.topic],
    ["Difficulty", configuration.difficulty],
    ["Duration", `${configuration.duration} minutes`],
    ["Language", configuration.language],
    ["Mode", configuration.mode],
  ];

  return (
    <section className="ready-screen" aria-labelledby="ready-heading">
      <div className="ready-intro">
        <p className="eyebrow">Configuration accepted</p>
        <h2 id="ready-heading">You're Ready!</h2>
        <p>
          Review your interview configuration before entering the interview
          workspace.
        </p>
      </div>
      <dl className="configuration-summary">
        {summary.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="configuration-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => onAction("edit")}
        >
          Edit Configuration
        </button>
        <button type="button" onClick={() => onAction("start")}>
          Start Interview
        </button>
      </div>
    </section>
  );
}
