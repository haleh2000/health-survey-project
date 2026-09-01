import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { DaydarLogo } from '../components/DaydarLogo'
import { ApiError } from '../services/api'
import { useAuth } from './useAuth'

const initialFormState = {
  username: '',
  password: '',
}

interface Star {
  left: number
  top: number
  size: number
  opacity: number
  duration: number
  delay: number
}

function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1.5 + Math.random() * 2,
    opacity: 0.35 + Math.random() * 0.3,
    duration: 4 + Math.random() * 3,
    delay: Math.random() * 4,
  }))
}

export function Starfield({ count = 55 }: { count?: number }) {
  const [stars, setStars] = useState(() => createStars(count))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStars(createStars(count))
    }, 6500)

    return () => window.clearInterval(timer)
  }, [count])

  return (
    <div className="auth-stars" aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="auth-stars__star"
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--star-opacity': star.opacity,
              '--star-duration': `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function LoginForm() {
  const { isLoading, login } = useAuth()
  const [formState, setFormState] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const username = formState.username.trim()
    const password = formState.password.trim()

    if (!username || !password) {
      setErrorMessage('نام کاربری و رمز عبور را وارد کنید.')
      return
    }

    try {
      await login({ username, password })
      setSuccessMessage('در حال ورود به سامانه...')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
        return
      }

      setErrorMessage('ورود انجام نشد. تنظیمات سرویس را بررسی کنید.')
    }
  }

  return (
    <>
      <Starfield />

      <section className="auth-card">
        <div className="auth-card__content">
        <DaydarLogo />

        <div className="auth-copy">
          <p>پنل تشخیص تقلب</p>
          <span>Fraud Detection Panel</span>
          <h1>ورود به حساب کاربری</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">نام کاربری</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="نام کاربری"
              disabled={isLoading}
              value={formState.username}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  username: event.target.value,
                }))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="password">رمز عبور</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="رمز عبور"
              disabled={isLoading}
              value={formState.password}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  password: event.target.value,
                }))
              }
            />
          </div>

          <p
            className={`feedback ${
              errorMessage ? 'feedback--error' : 'feedback--success'
            }`}
            role="status"
            aria-live="polite"
          >
            {errorMessage || successMessage}
          </p>

          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? 'در حال بررسی...' : 'ورود'}
          </button>
        </form>
        </div>

        <img
          className="auth-card__image"
          src="/logos/fruad-detect.png"
          alt="سیستم هوشمند تشخیص تقلب"
        />
      </section>
    </>
  )
}
