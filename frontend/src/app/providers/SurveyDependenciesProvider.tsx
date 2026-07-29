import type { ReactNode } from "react";

import {
  SurveyDependenciesContext,
  type SurveyDependencies,
} from "@survey/presentation/state/survey-dependencies.context";

export interface SurveyDependenciesProviderProps {
  dependencies: SurveyDependencies;
  children: ReactNode;
}

export function SurveyDependenciesProvider({
  dependencies,
  children,
}: SurveyDependenciesProviderProps) {
  return (
    <SurveyDependenciesContext value={dependencies}>{children}</SurveyDependenciesContext>
  );
}
