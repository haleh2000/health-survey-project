import './App.css'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import { LoginForm } from './auth/LoginForm'
import { DashboardPage } from './pages/DashboardPage'

function AppShell() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <DashboardPage />
  }

  return (
    <main className="auth-page">
      <LoginForm />
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
