import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getSurveyDependencies } from "@app/di/container";
import { SurveyDependenciesProvider } from "@app/providers/SurveyDependenciesProvider";
import { SurveyPage } from "@survey/presentation/pages/SurveyPage";
import WelcomePage from '@survey/presentation/pages/WelcomePage';

export function App() {
   console.log('App rendered') 
  return (
    <SurveyDependenciesProvider dependencies={getSurveyDependencies()}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
        </Routes>
      </BrowserRouter>
    </SurveyDependenciesProvider>
  );
}
