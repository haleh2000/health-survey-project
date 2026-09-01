import { apiGet, apiRequest } from "./api";

export interface Feedback {
  id: string;
  title: string;
  fraudCases?: Array<{
    id: number;
    feedbackId: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackPayload {
  title: string;
}

export interface UpdateFeedbackPayload {
  title?: string;
}

export interface FeedbackDefaultField {
  key: string;
  label: string;
}

const BASE_PATH = "/feedback";

export const feedbackApi = {
  getAll: (token?: string) => apiGet<Feedback[]>(BASE_PATH, token),

  getFields: (token?: string) =>
    apiGet<FeedbackDefaultField[]>(`${BASE_PATH}/fields`, token),

  getOne: (id: string, token?: string) =>
    apiGet<Feedback>(`${BASE_PATH}/${id}`, token),

  create: (payload: CreateFeedbackPayload, token?: string) =>
    apiRequest<Feedback>(BASE_PATH, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  update: (id: string, payload: UpdateFeedbackPayload, token?: string) =>
    apiRequest<Feedback>(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token,
    }),

  remove: (id: string, token?: string) =>
    apiRequest<{ message: string }>(`${BASE_PATH}/${id}`, {
      method: "DELETE",
      token,
    }),
};
