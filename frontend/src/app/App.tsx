import { getSurveyDependencies } from "@app/di/container";
import { SurveyDependenciesProvider } from "@app/providers/SurveyDependenciesProvider";
import { SurveyPage } from "@survey/presentation/pages/SurveyPage";

export function App() {
  return (
    <SurveyDependenciesProvider dependencies={getSurveyDependencies()}>
      <SurveyPage />
    </SurveyDependenciesProvider>
  );
}
