import type { AppError } from "@core/errors/app-error";
import type { Result } from "@core/result/result";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

export interface HistoryRepository {
  fetchByNationalId(
    nationalId: string,
  ): Promise<Result<readonly AssessmentRecord[], AppError>>;
}
