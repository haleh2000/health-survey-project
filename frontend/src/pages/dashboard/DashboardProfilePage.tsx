import type { FormEvent } from 'react'
import type { AuthUser } from '../../auth/types'

function getRoleLabel(roleId: number | undefined) {
  if (roleId === 0) {
    return 'ادمین'
  }

  if (roleId === 1) {
    return 'ارزیاب'
  }

  if (roleId === 2) {
    return 'سوپروایزر'
  }

  return 'نامشخص'
}

export function DashboardProfilePage({
  error,
  loading,
  onConfirmNewPasswordChange,
  onCurrentPasswordChange,
  onEmailChange,
  onNewPasswordChange,
  onSubmit,
  onUsernameChange,
  profile,
  profileForm,
  statusMessage,
  submitting,
}: {
  error: string
  loading: boolean
  onConfirmNewPasswordChange: (value: string) => void
  onCurrentPasswordChange: (value: string) => void
  onEmailChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUsernameChange: (value: string) => void
  profile: AuthUser | null
  profileForm: {
    username: string
    email: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }
  statusMessage: string
  submitting: boolean
}) {
  const roleLabel = getRoleLabel(profile?.role)

  return (
    <section className="profile-section-card profile-details-card">
      <div className="profile-details-header">
        <div>
          <span>پروفایل کاربر</span>
          <h2>ویرایش اطلاعات حساب</h2>
        </div>
        <p>فقط نام کاربری، ایمیل و رمز عبور قابل تغییر هستند.</p>
      </div>

      {loading ? (
        <div className="profile-details-state">در حال دریافت اطلاعات کاربر...</div>
      ) : error ? (
        <div className="profile-details-state profile-details-state--error">
          {error}
        </div>
      ) : profile ? (
        <div className="profile-details-grid">
          <article className="profile-details-item">
            <span>نام کاربری</span>
            <strong>{profile.username ?? '—'}</strong>
          </article>
          <article className="profile-details-item">
            <span>ایمیل</span>
            <strong>{profile.email ?? '—'}</strong>
          </article>
          <article className="profile-details-item">
            <span>نقش</span>
            <strong>{roleLabel}</strong>
          </article>
        </div>
      ) : (
        <div className="profile-details-state">
          اطلاعات کاربر برای نمایش موجود نیست.
        </div>
      )}

      <form className="users-form profile-edit-form" onSubmit={onSubmit}>
        <label className="field">
          <span>نام کاربری</span>
          <input
            type="text"
            autoComplete="username"
            value={profileForm.username}
            onChange={(event) => onUsernameChange(event.target.value)}
          />
        </label>

        <label className="field">
          <span>ایمیل</span>
          <input
            type="email"
            autoComplete="email"
            value={profileForm.email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>

        <label className="field">
          <span>رمز عبور فعلی</span>
          <input
            type="password"
            autoComplete="current-password"
            value={profileForm.currentPassword}
            onChange={(event) => onCurrentPasswordChange(event.target.value)}
            placeholder="برای ذخیره تغییرات، رمز فعلی را وارد کنید"
          />
        </label>

        <label className="field">
          <span>رمز عبور جدید</span>
          <input
            type="password"
            autoComplete="new-password"
            value={profileForm.newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
            placeholder="در صورت نیاز، رمز جدید را وارد کنید"
          />
        </label>

        <label className="field">
          <span>تکرار رمز عبور جدید</span>
          <input
            type="password"
            autoComplete="new-password"
            value={profileForm.confirmNewPassword}
            onChange={(event) => onConfirmNewPasswordChange(event.target.value)}
            placeholder="رمز جدید را دوباره وارد کنید"
          />
        </label>

        <button className="submit-button" type="submit" disabled={submitting}>
          {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </form>

      {statusMessage ? <p className="admin-message">{statusMessage}</p> : null}
    </section>
  )
}
