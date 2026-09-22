import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'

import { Alert } from '@ds/components/Alert'
import { Button } from '@ds/components/Button'
import { Card } from '@ds/components/Card'
import { TextInput } from '@ds/components/TextInput'
import { JalaliCalendarField } from '@survey/presentation/components/fields/JalaliCalendarField'
import { toAsciiDigits, toPersianDigits } from '@core/text/digits'

import daydarLogo from '@ds/assets/logo/daydar-logo.png'
import {
  DidarAuthError,
  captchaImageSrc,
  completeRegistration,
  loginWithPassword,
  registerIdentity,
  requestMobileStep,
  sendOtp,
  verifyOtp,
  type RegisterIdentityResponse,
} from '../services/authService'
import { useAuth } from './useAuth'

type Step =
  | 'mobile'
  | 'captcha'
  | 'method'
  | 'otp'
  | 'password'
  | 'register-identity'
  | 'register-confirm'
  | 'register-password'

const label = 'block text-sm font-medium text-gray-700 mb-1.5'

export function LoginForm() {
  const { completeLogin } = useAuth()

  const [step, setStep] = useState<Step>('mobile')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [mobile, setMobile] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaValue, setCaptchaValue] = useState('')

  const [otpCode, setOtpCode] = useState('')
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null)

  const [password, setPassword] = useState('')

  const [nationalId, setNationalId] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [identity, setIdentity] = useState<RegisterIdentityResponse | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  function resolveMessage(caughtError: unknown, fallback: string): string {
    return caughtError instanceof DidarAuthError ? caughtError.message : fallback
  }

  async function submitMobile(event: FormEvent) {
    event.preventDefault()
    setError('')

    const cleanMobile = toAsciiDigits(mobile).trim()
    if (!cleanMobile) {
      setError('شماره موبایل را وارد کنید.')
      return
    }

    setBusy(true)
    try {
      const response = await requestMobileStep({ mobile: cleanMobile })
      setSessionId(response.session_id)

      if (response.captcha_required) {
        setCaptchaImage(response.captcha ? captchaImageSrc(response.captcha) : '')
        setCaptchaValue('')
        setStep('captcha')
        return
      }

      routeAfterMobileStep(response.registered)
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'ارسال شماره موبایل انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  async function submitCaptcha(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!captchaValue.trim()) {
      setError('کد امنیتی را وارد کنید.')
      return
    }

    setBusy(true)
    try {
      const response = await requestMobileStep({
        mobile: toAsciiDigits(mobile).trim(),
        session_id: sessionId,
        captcha: captchaValue.trim(),
      })
      setSessionId(response.session_id)

      if (response.captcha_required) {
        setCaptchaImage(response.captcha ? captchaImageSrc(response.captcha) : '')
        setCaptchaValue('')
        setError('کد امنیتی نادرست بود، دوباره تلاش کنید.')
        return
      }

      routeAfterMobileStep(response.registered)
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'تایید کد امنیتی انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  function routeAfterMobileStep(registered: boolean | null) {
    setError('')
    if (registered === false) {
      setStep('register-identity')
    } else {
      setStep('method')
    }
  }

  async function startOtp() {
    setError('')
    setBusy(true)
    try {
      const response = await sendOtp(sessionId)
      setOtpExpiresIn(response.expires_in ?? null)
      setOtpCode('')
      setStep('otp')
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'ارسال کد پیامکی انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  async function submitOtp(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!otpCode.trim()) {
      setError('کد پیامک‌شده را وارد کنید.')
      return
    }

    setBusy(true)
    try {
      const response = await verifyOtp(sessionId, toAsciiDigits(otpCode).trim())
      completeLogin(response)
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'کد وارد شده معتبر نیست.'))
    } finally {
      setBusy(false)
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!password) {
      setError('رمز عبور را وارد کنید.')
      return
    }

    setBusy(true)
    try {
      const response = await loginWithPassword(sessionId, password)
      completeLogin(response)
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'ورود با رمز عبور انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  async function submitIdentity(event: FormEvent) {
    event.preventDefault()
    setError('')

    const cleanNationalId = toAsciiDigits(nationalId).trim()
    if (!cleanNationalId || !birthDate) {
      setError('کد ملی و تاریخ تولد را وارد کنید.')
      return
    }

    setBusy(true)
    try {
      const response = await registerIdentity(
        sessionId,
        cleanNationalId,
        birthDate.replace(/-/g, '/'),
      )
      setIdentity(response)
      setStep('register-confirm')
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'تطبیق اطلاعات هویتی انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  async function submitNewPassword(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!newPassword || newPassword !== newPasswordConfirm) {
      setError('رمز عبور و تکرار آن باید یکسان باشند.')
      return
    }

    setBusy(true)
    try {
      const response = await completeRegistration(sessionId, newPassword, newPasswordConfirm)
      completeLogin(response)
    } catch (caughtError) {
      setError(resolveMessage(caughtError, 'ثبت‌نام انجام نشد.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src={daydarLogo} alt="دایدار" className="h-14 w-auto object-contain" />
          <h1 className="text-xl font-black text-gray-900">ورود به ارزیابی ریسک سلامت</h1>
          <p className="text-sm text-gray-500">
            با شماره موبایل خود از طریق دایدار وارد شوید.
          </p>
        </div>

        <Card padding="lg" className="bg-white/90">
          {error && (
            <Alert tone="error" className="mb-5">
              {error}
            </Alert>
          )}

          {step === 'mobile' && (
            <form onSubmit={submitMobile} className="space-y-4">
              <div>
                <label className={label} htmlFor="mobile">
                  شماره موبایل
                </label>
                <TextInput
                  id="mobile"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="09xxxxxxxxx"
                  className="text-left"
                  value={toPersianDigits(mobile)}
                  onChange={(event) =>
                    setMobile(toAsciiDigits(event.target.value).replace(/\D/g, ''))
                  }
                  disabled={busy}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                ادامه
              </Button>
            </form>
          )}

          {step === 'captcha' && (
            <form onSubmit={submitCaptcha} className="space-y-4">
              {captchaImage && (
                <img
                  src={captchaImage}
                  alt="کد امنیتی"
                  className="mx-auto h-16 rounded-lg border border-gray-200"
                />
              )}
              <div>
                <label className={label} htmlFor="captcha">
                  کد امنیتی تصویر را وارد کنید
                </label>
                <TextInput
                  id="captcha"
                  dir="ltr"
                  className="text-center"
                  value={captchaValue}
                  onChange={(event) => setCaptchaValue(event.target.value)}
                  disabled={busy}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                تایید
              </Button>
            </form>
          )}

          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">روش ورود را انتخاب کنید.</p>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={busy}
                onClick={() => void startOtp()}
              >
                ورود با کد پیامکی
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() => {
                  setError('')
                  setPassword('')
                  setStep('password')
                }}
              >
                ورود با رمز عبور
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={submitOtp} className="space-y-4">
              <p className="text-sm text-gray-600">
                کد ارسال‌شده به {toPersianDigits(mobile)} را وارد کنید.
                {otpExpiresIn ? ` (اعتبار: ${toPersianDigits(otpExpiresIn)} ثانیه)` : ''}
              </p>
              <TextInput
                id="otp"
                dir="ltr"
                inputMode="numeric"
                className="text-center tracking-[0.3em]"
                value={toPersianDigits(otpCode)}
                onChange={(event) =>
                  setOtpCode(toAsciiDigits(event.target.value).replace(/\D/g, ''))
                }
                disabled={busy}
              />
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                تایید کد
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy}
                onClick={() => setStep('method')}
              >
                بازگشت
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className={label} htmlFor="login-password">
                  رمز عبور
                </label>
                <TextInput
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                ورود
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy}
                onClick={() => setStep('method')}
              >
                بازگشت
              </Button>
            </form>
          )}

          {step === 'register-identity' && (
            <form onSubmit={submitIdentity} className="space-y-4">
              <p className="text-sm text-gray-600">
                برای اولین ورود، کد ملی و تاریخ تولد خود را وارد کنید.
              </p>
              <div>
                <label className={label} htmlFor="national-id">
                  کد ملی
                </label>
                <TextInput
                  id="national-id"
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={10}
                  className="text-left tracking-[0.2em]"
                  value={toPersianDigits(nationalId)}
                  onChange={(event) =>
                    setNationalId(toAsciiDigits(event.target.value).replace(/\D/g, ''))
                  }
                  disabled={busy}
                />
              </div>
              <div>
                <label className={label}>تاریخ تولد</label>
                <JalaliCalendarField
                  value={birthDate}
                  onChange={setBirthDate}
                  disabled={busy}
                  placeholder="انتخاب تاریخ تولد"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                ادامه
              </Button>
            </form>
          )}

          {step === 'register-confirm' && identity && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">آیا این اطلاعات متعلق به شماست؟</p>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800">
                <p className="font-bold">
                  {identity.first_name} {identity.last_name}
                </p>
                {identity.father_name && <p>نام پدر: {identity.father_name}</p>}
                <p>کد ملی: {toPersianDigits(identity.national_id)}</p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => {
                  setError('')
                  setNewPassword('')
                  setNewPasswordConfirm('')
                  setStep('register-password')
                }}
              >
                بله، خودم هستم
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setIdentity(null)
                  setStep('register-identity')
                }}
              >
                خیر، اصلاح اطلاعات
              </Button>
            </div>
          )}

          {step === 'register-password' && (
            <form onSubmit={submitNewPassword} className="space-y-4">
              <div>
                <label className={label} htmlFor="new-password">
                  رمز عبور جدید
                </label>
                <TextInput
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={label} htmlFor="new-password-confirm">
                  تکرار رمز عبور
                </label>
                <TextInput
                  id="new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordConfirm}
                  onChange={(event) => setNewPasswordConfirm(event.target.value)}
                  disabled={busy}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={busy}>
                تکمیل ثبت‌نام و ورود
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
