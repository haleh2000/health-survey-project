import { ENV } from "@core/config/env";
import { AxiosHttpClient } from "@core/http/axios-http-client.adapter";

import { SubmitSurveyUseCase } from "@survey/application/use-cases/submit-survey.use-case";
import { SurveyProgressUseCase } from "@survey/application/use-cases/survey-progress.use-case";
import { ValidateStepUseCase } from "@survey/application/use-cases/validate-step.use-case";
import { assertContractCoverage } from "@survey/infrastructure/contract/assert-contract-coverage";
import { createSurveyDefinition } from "@survey/infrastructure/definition/survey-definition.data";
import { HttpRiskAssessmentRepository } from "@survey/infrastructure/repositories/http-risk-assessment.repository";
import type { SurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";

/**
 * The composition root.
 *
 * The one place allowed to know every layer at once: it picks the concrete
 * adapters, wires them into the use cases, and hands the result to the UI.
 * Swapping the transport, or injecting fakes in a test, means changing this
 * file and nothing else.
 */
export const createSurveyDependencies = (): SurveyDependencies => {
  const definition = createSurveyDefinition();

  // Catches UI/backend contract drift before the first request rather than as
  // a wrong risk score later. Fatal in development, reported in production.
  assertContractCoverage(definition, { throwOnFailure: ENV.isDev });

  const httpClient = new AxiosHttpClient(ENV.apiUrl, ENV.requestTimeoutMs);
  const repository = new HttpRiskAssessmentRepository(httpClient);

  return {
    definition,
    validateStep: new ValidateStepUseCase(definition),
    submitSurvey: new SubmitSurveyUseCase(definition, repository),
    progress: new SurveyProgressUseCase(definition),
  };
};

let instance: SurveyDependencies | null = null;

/** Built once and reused, so the definition is not re-validated per render. */
export const getSurveyDependencies = (): SurveyDependencies =>
  (instance ??= createSurveyDependencies());
