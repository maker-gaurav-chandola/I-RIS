import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";

export const interviewTypes = [
  "Technical Interview",
  "HR Interview",
  "Mixed Interview",
] as const;
export const difficulties = ["Easy", "Medium", "Hard"] as const;
export const durations = ["15", "30", "45"] as const;
export const languages = ["Hinglish", "English", "Hindi"] as const;
export const modes = ["Text"] as const;

export type InterviewConfiguration = {
  interviewType: string;
  topic: string;
  difficulty: string;
  duration: string;
  language: string;
  mode: string;
};

export type ConfigurationAction = "back" | "accepted";

export const initialConfiguration: InterviewConfiguration = {
  interviewType: "",
  topic: "",
  difficulty: "",
  duration: "",
  language: "Hinglish",
  mode: "Text",
};

export function validateConfiguration(
  configuration: InterviewConfiguration,
): Partial<Record<keyof InterviewConfiguration, string>> {
  const errors: Partial<Record<keyof InterviewConfiguration, string>> = {};

  if (
    !interviewTypes.includes(
      configuration.interviewType as (typeof interviewTypes)[number],
    )
  ) {
    errors.interviewType = "Choose an interview type.";
  }
  if (!configuration.topic.trim()) {
    errors.topic = "Enter a topic or skill to practice.";
  }
  if (
    !difficulties.includes(
      configuration.difficulty as (typeof difficulties)[number],
    )
  ) {
    errors.difficulty = "Choose a difficulty level.";
  }
  if (
    !durations.includes(configuration.duration as (typeof durations)[number])
  ) {
    errors.duration = "Choose an interview duration.";
  }
  if (
    !languages.includes(configuration.language as (typeof languages)[number])
  ) {
    errors.language = "Choose a language.";
  }
  if (!modes.includes(configuration.mode as (typeof modes)[number])) {
    errors.mode = "Choose an interview mode.";
  }

  return errors;
}

type InterviewConfigurationProps = {
  configuration: InterviewConfiguration;
  onChange: (configuration: InterviewConfiguration) => void;
  onAction: (
    action: ConfigurationAction,
    configuration?: InterviewConfiguration,
  ) => void;
};

export function InterviewConfiguration({
  configuration,
  onChange,
  onAction,
}: InterviewConfigurationProps): ReactElement {
  const [errors, setErrors] = useState<
    Partial<Record<keyof InterviewConfiguration, string>>
  >({});
  const [accepted, setAccepted] = useState(false);

  function updateField(
    field: keyof InterviewConfiguration,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    onChange({ ...configuration, [field]: event.target.value });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setAccepted(false);
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateConfiguration(configuration);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setAccepted(true);
    onAction("accepted", configuration);
  }

  return (
    <section className="configuration" aria-labelledby="configuration-heading">
      <div className="configuration-intro">
        <p className="eyebrow">Interview setup</p>
        <h2 id="configuration-heading">Configure Your Interview</h2>
        <p>Select the scope and format for a focused text interview session.</p>
      </div>

      <form className="configuration-form" onSubmit={submit} noValidate>
        <label>
          Interview Type
          <select
            value={configuration.interviewType}
            onChange={(event) => updateField("interviewType", event)}
          >
            <option value="">Choose a type</option>
            {interviewTypes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {errors.interviewType && (
            <span className="field-error">{errors.interviewType}</span>
          )}
        </label>

        <label>
          Topic or Skill
          <input
            value={configuration.topic}
            onChange={(event) => updateField("topic", event)}
            placeholder="For example, Java or DBMS"
          />
          {errors.topic && <span className="field-error">{errors.topic}</span>}
        </label>

        <label>
          Difficulty
          <select
            value={configuration.difficulty}
            onChange={(event) => updateField("difficulty", event)}
          >
            <option value="">Choose a difficulty</option>
            {difficulties.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {errors.difficulty && (
            <span className="field-error">{errors.difficulty}</span>
          )}
        </label>

        <label>
          Duration
          <select
            value={configuration.duration}
            onChange={(event) => updateField("duration", event)}
          >
            <option value="">Choose a duration</option>
            {durations.map((option) => (
              <option key={option} value={option}>
                {option} minutes
              </option>
            ))}
          </select>
          {errors.duration && (
            <span className="field-error">{errors.duration}</span>
          )}
        </label>

        <label>
          Language
          <select
            value={configuration.language}
            onChange={(event) => updateField("language", event)}
          >
            {languages.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {errors.language && (
            <span className="field-error">{errors.language}</span>
          )}
        </label>

        <label>
          Mode
          <select
            value={configuration.mode}
            onChange={(event) => updateField("mode", event)}
          >
            {modes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {errors.mode && <span className="field-error">{errors.mode}</span>}
        </label>

        <div className="configuration-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onAction("back")}
          >
            Back to Dashboard
          </button>
          <button type="submit">Continue</button>
        </div>
        {accepted && (
          <p className="configuration-success" role="status">
            Configuration accepted. Review the session details before starting.
          </p>
        )}
      </form>
    </section>
  );
}
