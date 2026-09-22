import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getSurveyDependencies } from "@app/di/container";
import { SurveyDependenciesProvider } from "@app/providers/SurveyDependenciesProvider";
import { SurveyPage } from "@survey/presentation/pages/SurveyPage";
import WelcomePage from '@survey/presentation/pages/WelcomePage';
import { AuthProvider } from "../auth/AuthContext";
import { LoginForm } from "../auth/LoginForm";
import { useAuth } from "../auth/useAuth";

function AuthGate() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <SurveyDependenciesProvider dependencies={getSurveyDependencies()}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="flex justify-end px-4 pt-3">
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            {user?.full_name ? `خروج (${user.full_name})` : "خروج"}
          </button>
        </div>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
        </Routes>
      </BrowserRouter>
    </SurveyDependenciesProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
