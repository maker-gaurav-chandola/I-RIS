import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { Select } from "@/components/common/Select";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { InterviewSessionConfig } from "@/types/interview";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES: InterviewSessionConfig["language"][] = ["Hinglish", "English", "Hindi"];
const TYPES: InterviewSessionConfig["interviewType"][] = ["Technical", "HR", "Mixed"];
// Only "Text" is actually implemented server-side today.
const MODES = ["Text"];

// Configuration only — this page never talks to the session engine. The
// session is created once the candidate confirms on the Ready page.
export function InterviewSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<InterviewSessionConfig>({
    interviewType: "Technical",
    topic: "",
    difficulty: DIFFICULTIES[0],
    duration: 20,
    language: "Hinglish",
    mode: "Text",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate("/interview/ready", { state: { config } });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Set up your interview</h1>
      </div>
      <Card>
        <form className="setup-form" onSubmit={handleSubmit}>
          <Select
            label="Interview type"
            options={TYPES}
            value={config.interviewType}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                interviewType: e.target.value as InterviewSessionConfig["interviewType"],
              }))
            }
          />
          <Input
            label="Topic / skill"
            placeholder="e.g. C pointers, DSA, HR round"
            value={config.topic}
            onChange={(e) => setConfig((c) => ({ ...c, topic: e.target.value }))}
            required
          />
          <Select
            label="Difficulty"
            options={DIFFICULTIES}
            value={config.difficulty}
            onChange={(e) => setConfig((c) => ({ ...c, difficulty: e.target.value }))}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            min={5}
            max={90}
            value={config.duration}
            onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) }))}
          />
          <Select
            label="Language"
            options={LANGUAGES}
            value={config.language}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                language: e.target.value as InterviewSessionConfig["language"],
              }))
            }
          />
          <Select
            label="Mode"
            options={MODES}
            value={config.mode}
            onChange={(e) => setConfig((c) => ({ ...c, mode: e.target.value }))}
          />
          <Button type="submit">Review and start</Button>
        </form>
      </Card>
    </div>
  );
}
