import { apiGet, apiRequest } from "./api";

export type JobType = "fraudSync" | "claimSync";

export interface JobState {
  enabled: boolean;
  isRunning: boolean;
  processed: number;
  total: number;
  lastRunAt: string | null;
  startedAt: string | null;
}

export interface JobsStatusResponse {
  fraudSync: JobState;
  claimSync: JobState;
}

export const jobApi = {
  getStatus(token?: string) {
    return apiGet<JobsStatusResponse>("/jobs/status", token);
  },

  startJob(type: JobType, token?: string) {
    return apiRequest<JobState>(`/jobs/${type}/start`, {
      method: "POST",
      token,
    });
  },

  stopJob(type: JobType, token?: string) {
    return apiRequest<JobState>(`/jobs/${type}/stop`, {
      method: "POST",
      token,
    });
  },
};
