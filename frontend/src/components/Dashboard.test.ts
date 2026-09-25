import { describe, expect, it } from "vitest";
import { getDashboardViewModel, type DashboardUser } from "./Dashboard";

const user: DashboardUser = {
  id: "account-1",
  email: "candidate@example.com",
  createdAt: "2026-09-09T00:00:00.000Z",
};

describe("dashboard foundation", () => {
  it("uses the authenticated user identity", () => {
    const viewModel = getDashboardViewModel(user);

    expect(viewModel.welcome).toContain("candidate@example.com");
  });

  it("reports an honest empty activity state without fabricated metrics", () => {
    const viewModel = getDashboardViewModel(user);

    expect(viewModel.activitySummary).toBe("No completed interviews yet.");
    expect(viewModel.emptyState).not.toMatch(
      /score|percent|streak|chart|last interview/i,
    );
  });
});
