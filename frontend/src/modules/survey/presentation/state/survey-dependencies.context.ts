import { createContext, useContext } from "react";

import type { SubmitSurveyUseCase } from "@survey/application/use-cases/submit-survey.use-case";
import type { SurveyProgressUseCase } from "@survey/application/use-cases/survey-progress.use-case";
import type { ValidateStepUseCase } from "@survey/application/use-cases/validate-step.use-case";
import type { SurveyDefinition } from "@survey/domain/entities/survey-definition.entity";
import type { HistoryRepository } from "@survey/domain/ports/history.repository";

/**
 * What the UI needs in order to run, stated as an interface it owns.
 *
 * The presentation layer never constructs a repository or an HTTP client; the
 * composition root in `app/di` builds them and passes them in. That keeps the
 * UI testable by handing it fakes, and is what makes the dependency arrow
 * point inwards at runtime and not just on paper.
 */
export interface SurveyDependencies {
  readonly definition: SurveyDefinition;
  readonly validateStep: ValidateStepUseCase;
  readonly submitSurvey: SubmitSurveyUseCase;
  readonly progress: SurveyProgressUseCase;
  readonly historyRepository: HistoryRepository;
}

export const SurveyDependenciesContext = createContext<SurveyDependencies | null>(null);

export const useSurveyDependencies = (): SurveyDependencies => {
  const dependencies = useContext(SurveyDependenciesContext);

  if (!dependencies) {
    throw new Error(
      "useSurveyDependencies must be used inside <SurveyDependenciesProvider>.",
    );
  }

  return dependencies;
};
