import { useCallback, useEffect, useState } from "react";

import {
  loadAssessmentHistoryByNationalId,
  mergeAssessmentHistories,
  type AssessmentRecord,
} from "@survey/infrastructure/storage/assessment-history.storage";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";

/**
 * Backend is the source of truth for every completed assessment.
 * Local storage is a cache so the UI still works offline / before the request returns.
 */
export function useAssessmentHistory(nationalId: string) {
  const { historyRepository } = useSurveyDependencies();
  const normalized = nationalId.trim();

  const [history, setHistory] = useState<AssessmentRecord[]>(() =>
    normalized ? loadAssessmentHistoryByNationalId(normalized) : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!normalized) {
      setHistory([]);
      setError(false);
      return;
    }

    const local = loadAssessmentHistoryByNationalId(normalized);
    setHistory(local);
    setLoading(true);
    setError(false);

    const result = await historyRepository.fetchByNationalId(normalized);

    if (result.ok) {
      // Prefer the full backend archive; local cache only fills gaps.
      setHistory(
        result.value.length > 0
          ? mergeAssessmentHistories(result.value, local)
          : local,
      );
      setError(false);
    } else {
      setHistory(local);
      setError(true);
    }

    setLoading(false);
  }, [historyRepository, normalized]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { history, loading, error, refresh };
}
