// Single place that decides which interview workspace to render.
// The backend stores mode as a free-form string ("Text" | "Voice" from the
// setup form), so compare case-insensitively instead of with ===.
export function isVoiceMode(mode: string | null | undefined): boolean {
  return (mode ?? "").trim().toLowerCase() === "voice";
}
