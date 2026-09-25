import { apiRequest } from "./http";
import type { HistoryProgressResponse } from "@/types/history";

// History / Progress Boundary.
export const historyService = {
  getHistory: () =>
    apiRequest<HistoryProgressResponse>("/api/interview-history"),

  getProgress: () =>
    apiRequest<HistoryProgressResponse>("/api/interview-history").then(
      ({ progress }) => progress,
    ),
};
