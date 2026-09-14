import { apiGet, apiRequest, API_BASE_URL, apiGetFile } from "./api";
import type {
  FraudCase,
  FraudCasesApiResponse,
  Tag,
  DuplicateMatchResponse,
} from "../pages/dashboard/dashboard.types";

export type { Tag };

const FRAUD_CASE_PAGE_SIZE = 50;

export type FraudCaseImportType =
  | "duplicates"
  | "case-details"
  | "case-more-details";

export type FraudSortField =
  | "id"
  | "createdAt"
  | "updatedAt"
  | "registrationDateCase1"
  | "registrationDateCase2";

export type FraudSortOrder = "ASC" | "DESC";

export type FraudCasePageResult = {
  items: FraudCase[];
  meta: {
    page?: number;
    size?: number;
    total?: number;
    totalPages?: number;
  } | null;
};

export interface FeedbackOption {
  id: string;
  title: string;
}

export interface FraudCasesWithFeedbackCountResponse {
  count: number;
  totalCount: number;
}

export interface CountResponse {
  count: number;
}

export async function getFeedbacks(token?: string): Promise<FeedbackOption[]> {
  return apiGet<FeedbackOption[]>("/feedback", token);
}

export async function updateFraudCaseFeedback(
  fraudCaseId: number,
  feedbackId: string | null,
  token?: string,
): Promise<FraudCase> {
  return apiRequest<FraudCase>(`/fraud-detection/fraud-case/${fraudCaseId}/feedback`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ feedbackId }),
  });
}

export async function loadAllFraudCases(
  token: string | undefined,
): Promise<FraudCase[]> {
  const firstResponse = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case?page=1&size=${FRAUD_CASE_PAGE_SIZE}`,
    {
      method: "GET",
      token,
    },
  );

  const firstPage = normalizeFraudCasesResponse(firstResponse);
  const allItems = [...firstPage.items];
  const totalPages = firstPage.meta?.totalPages ?? null;

  if (totalPages !== null) {
    for (let page = 2; page <= totalPages; page += 1) {
      const response = await apiRequest<FraudCasesApiResponse>(
        `/fraud-detection/fraud-case?page=${page}&size=${FRAUD_CASE_PAGE_SIZE}`,
        {
          method: "GET",
          token,
        },
      );

      allItems.push(...normalizeFraudCasesResponse(response).items);
    }

    return allItems;
  }

  let currentPage = 2;

  while (true) {
    const response = await apiRequest<FraudCasesApiResponse>(
      `/fraud-detection/fraud-case?page=${currentPage}&size=${FRAUD_CASE_PAGE_SIZE}`,
      {
        method: "GET",
        token,
      },
    );

    const nextPage = normalizeFraudCasesResponse(response);
    allItems.push(...nextPage.items);

    if (nextPage.items.length < FRAUD_CASE_PAGE_SIZE) {
      break;
    }

    currentPage += 1;
  }

  return allItems;
}

export async function loadFraudCasesPage(
  token: string | undefined,
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
): Promise<FraudCasePageResult> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (sortBy) {
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case?${params.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export function clearFraudCasesCache() {
  // No-op: caching removed
}

export async function importFraudCasesFile(
  file: File,
  token: string | undefined,
  type: FraudCaseImportType = "duplicates",
) {
  const formData = new FormData();
  formData.append("file", file);

  const result = await apiRequest(`/import/excell/${type}`, {
    method: "POST",
    body: formData,
    token,
  });

  clearFraudCasesCache();

  return result;
}

export async function importFraudCasesJson(
  file: File,
  token: string | undefined,
  type: FraudCaseImportType = "case-more-details",
) {
  const formData = new FormData();
  formData.append("file", file);

  const result = await apiRequest(`/import/json/${type}`, {
    method: "POST",
    body: formData,
    token,
  });

  clearFraudCasesCache();

  return result;
}

function normalizeFraudCasesResponse(response: FraudCasesApiResponse) {
  if (Array.isArray(response)) {
    return {
      items: response,
      meta: null,
    };
  }

  return {
    items: Array.isArray(response.items) ? response.items : [],
    meta: response.meta ?? null,
  };
}

export function resolveStoredImageUrl(value: string) {
  const trimmed = value.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const path = trimmed.replace(/^\/+/, "");

  return `${API_BASE_URL}/${path}`;
}

export async function updateFraudCaseNote(
  id: number,
  additionalNote: string | null,
  token: string | undefined,
): Promise<FraudCase> {
  return apiRequest<FraudCase>(`/fraud-detection/fraud-case/${id}/note`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ additionalNote }),
  });
}

export async function getFraudCasesWithFeedbackCountByUser(
  token?: string,
): Promise<FraudCasesWithFeedbackCountResponse> {
  return apiGet<FraudCasesWithFeedbackCountResponse>(
    "/fraud-detection/fraud-case/feedback/count",
    token,
  );
}

export async function getFraudCasesCount(
  token?: string,
): Promise<CountResponse> {
  return apiGet<CountResponse>("/fraud-detection/fraud-case/count", token);
}

export async function getFraudCasesCountByType(
  token: string | undefined,
  type: string,
): Promise<CountResponse> {
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-suspicious-type/count?suspiciousCaseType=${encodeURIComponent(type)}`,
    token,
  );
}

export async function getFraudCasesCountByNationalId(
  token: string | undefined,
  params: {
    case1NationalId?: string;
    case2NationalId?: string;
    mode?: "any" | "both";
  },
): Promise<CountResponse> {
  const { case1NationalId = "", case2NationalId = "", mode = "any" } = params;
  const queryParams = new URLSearchParams({ mode });
  if (case1NationalId.trim()) {
    queryParams.append("case1NationalId", case1NationalId.trim());
  }
  if (case2NationalId.trim()) {
    queryParams.append("case2NationalId", case2NationalId.trim());
  }
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-national-id/count?${queryParams.toString()}`,
    token,
  );
}

export async function getFraudCasesCountByClaimIds(
  token: string | undefined,
  params: {
    case1Id?: string;
    case2Id?: string;
    mode?: "any" | "both";
  },
): Promise<CountResponse> {
  const { case1Id = "", case2Id = "", mode = "any" } = params;
  const queryParams = new URLSearchParams({ mode });
  if (case1Id.trim()) {
    queryParams.append("case1Id", case1Id.trim());
  }
  if (case2Id.trim()) {
    queryParams.append("case2Id", case2Id.trim());
  }
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-claim-ids/count?${queryParams.toString()}`,
    token,
  );
}

export async function getFraudCasesCountByStatus(
  token: string | undefined,
  params: {
    case1Status?: string;
    case2Status?: string;
    mode?: "any" | "both";
  },
): Promise<CountResponse> {
  const { case1Status = "", case2Status = "", mode = "any" } = params;
  const queryParams = new URLSearchParams({ mode });
  if (case1Status.trim()) {
    queryParams.append("case1Status", case1Status.trim());
  }
  if (case2Status.trim()) {
    queryParams.append("case2Status", case2Status.trim());
  }
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-status/count?${queryParams.toString()}`,
    token,
  );
}

export async function getFraudCasesCountByFeedbackId(
  token: string | undefined,
  feedbackId: string,
): Promise<CountResponse> {
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-feedback-id/count?feedbackId=${encodeURIComponent(feedbackId)}`,
    token,
  );
}

export async function getFraudCasesCountById(
  token: string | undefined,
  fraudCaseId: number,
): Promise<CountResponse> {
  return apiGet<CountResponse>(
    `/fraud-detection/fraud-case/by-id/count?id=${fraudCaseId}`,
    token,
  );
}

export async function loadFraudCasesByType(
  token: string | undefined,
  type: string,
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
  feedbackId?: string,
): Promise<FraudCasePageResult> {
  const queryParams = new URLSearchParams({
    suspiciousCaseType: type,
    page: String(page),
    size: String(size),
  });

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  if (feedbackId) {
    queryParams.set("feedbackId", feedbackId);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-suspicious-type?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function loadFraudCasesByNationalId(
  token: string | undefined,
  params: {
    case1NationalId?: string;
    case2NationalId?: string;
    mode?: "any" | "both";
  },
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
  feedbackId?: string,
): Promise<FraudCasePageResult> {
  const { case1NationalId = "", case2NationalId = "", mode = "any" } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    mode,
  });

  if (case1NationalId.trim()) {
    queryParams.append("case1NationalId", case1NationalId.trim());
  }
  if (case2NationalId.trim()) {
    queryParams.append("case2NationalId", case2NationalId.trim());
  }

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  if (feedbackId) {
    queryParams.set("feedbackId", feedbackId);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-national-id?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function loadFraudCasesByClaimIds(
  token: string | undefined,
  params: {
    case1Id?: string;
    case2Id?: string;
    mode?: "any" | "both";
  },
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
  feedbackId?: string,
): Promise<FraudCasePageResult> {
  const { case1Id = "", case2Id = "", mode = "any" } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    mode,
  });

  if (case1Id.trim()) {
    queryParams.append("case1Id", case1Id.trim());
  }

  if (case2Id.trim()) {
    queryParams.append("case2Id", case2Id.trim());
  }

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  if (feedbackId) {
    queryParams.set("feedbackId", feedbackId);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-claim-ids?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function loadFraudCasesByStatus(
  token: string | undefined,
  params: {
    case1Status?: string;
    case2Status?: string;
    mode?: "any" | "both";
  },
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
  feedbackId?: string,
): Promise<FraudCasePageResult> {
  const { case1Status = "", case2Status = "", mode = "any" } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size),
    mode,
  });

  if (case1Status.trim()) {
    queryParams.append("case1Status", case1Status.trim());
  }

  if (case2Status.trim()) {
    queryParams.append("case2Status", case2Status.trim());
  }

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  if (feedbackId) {
    queryParams.set("feedbackId", feedbackId);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-status?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function loadFraudCasesByFeedbackId(
  token: string | undefined,
  feedbackId: string,
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
): Promise<FraudCasePageResult> {
  const queryParams = new URLSearchParams({
    feedbackId: feedbackId.trim(),
    page: String(page),
    size: String(size),
  });

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-feedback-id?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function loadFraudCasesById(
  token: string | undefined,
  fraudCaseId: number,
  page: number,
  size: number,
  sortBy?: FraudSortField,
  sortOrder: FraudSortOrder = "ASC",
): Promise<FraudCasePageResult> {
  const queryParams = new URLSearchParams({
    id: String(fraudCaseId),
    page: String(page),
    size: String(size),
  });

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
    queryParams.set("sortOrder", sortOrder);
  }

  const response = await apiRequest<FraudCasesApiResponse>(
    `/fraud-detection/fraud-case/by-id?${queryParams.toString()}`,
    {
      method: "GET",
      token,
    },
  );

  return normalizeFraudCasesResponse(response);
}

export async function exportFraudCases(
  token: string | undefined,
  params: {
    dateField:
      | "createdAt"
      | "updatedAt"
      | "registrationDateCase1"
      | "registrationDateCase2";
    fromDate?: string;
    toDate?: string;
    suspiciousCaseType?: string;
    case1NationalId?: string;
    case2NationalId?: string;
    case1Id?: string;
    case2Id?: string;
    case1Status?: string;
    case2Status?: string;
    feedbackId?: string;
    fraudCaseId?: string;
  },
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return apiGetFile(`/export?${query.toString()}`, token);
}

// ==================== Duplicate Image Comparison ====================

export async function findDuplicateMatches(
  fraudCaseId: number,
  token: string | undefined,
): Promise<DuplicateMatchResponse> {
  return apiRequest<DuplicateMatchResponse>(
    `/fraud-detection/fraud-case/${fraudCaseId}/duplicate-matches`,
    {
      method: "GET",
      token,
    },
  );
}

// ==================== Tag Management ====================

export async function getAllTags(token: string | undefined): Promise<Tag[]> {
  return apiGet<Tag[]>("/fraud-detection/tags", token);
}

// ==================== Tag Operations on Fraud Cases ====================

export async function addTagsToFraudCase(
  fraudCaseId: number,
  tagIds: string[],
  token: string | undefined,
): Promise<FraudCase> {
  return apiRequest<FraudCase>(`/fraud-detection/fraud-case/${fraudCaseId}/tags`, {
    method: "POST",
    token,
    body: JSON.stringify({ tagIds }),
  });
}

export async function removeTagFromFraudCase(
  fraudCaseId: number,
  tagId: string,
  token: string | undefined,
): Promise<FraudCase> {
  return apiRequest<FraudCase>(
    `/fraud-detection/fraud-case/${fraudCaseId}/tags/${tagId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
