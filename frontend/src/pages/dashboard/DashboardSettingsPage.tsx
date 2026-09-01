import type { FormEvent } from 'react'
import type { AuthUser } from '../../auth/types'
import {
  PROFILE_AVATARS,
  getProfileAvatarName,
  getProfileAvatarSrc,
} from '../../utils/avatar'

export function DashboardSettingsPage({
  avatarCurrentPassword,
  avatarSaving,
  avatarStatusMessage,
  avatarValue,
  onAvatarCurrentPasswordChange,
  onAvatarSave,
  onAvatarSelect,
  message,
  onThemeToggle,
  theme,
  user,
}: {
  avatarCurrentPassword: string
  avatarSaving: boolean
  avatarStatusMessage: string
  avatarValue: string
  onAvatarCurrentPasswordChange: (value: string) => void
  onAvatarSave: (event: FormEvent<HTMLFormElement>) => void
  onAvatarSelect: (value: string) => void
  message: string
  onThemeToggle: () => void
  theme: 'dark' | 'light'
  user: AuthUser | null
}) {
  const selectedAvatar = getProfileAvatarName(avatarValue || user?.avatar)
  const previewAvatar = getProfileAvatarSrc(selectedAvatar)

  return (
    <section className="profile-section-card settings-card">
      <div className="settings-card__header">
        <div>
          <span>تنظیمات</span>
          <h2>کنترل نمایش پنل</h2>
        </div>
        <p>تنظیمات ظاهری و رفتاری سامانه</p>
      </div>

      <div className="settings-card__body">
        <div>
          <strong>حالت نمایش پنل</strong>
          <span>تغییر بین حالت روشن و تاریک برای استفاده راحت‌تر</span>
        </div>
        <label className="theme-toggle">
          <input type="checkbox" checked={theme === 'dark'} onChange={onThemeToggle} />
          <span className="theme-toggle__slider" />
        </label>
      </div>

      <form className="settings-avatar-form" onSubmit={onAvatarSave}>
        <div className="settings-avatar-form__header">
          <div>
            <strong>آواتار پروفایل</strong>
            <span>یک تصویر PNG برای کارت پروفایل خود انتخاب کنید.</span>
          </div>
          <div className="settings-avatar-form__preview">
            {previewAvatar ? (
              <img src={previewAvatar} alt="پیش‌نمایش آواتار" />
            ) : (
              <span aria-hidden="true">{(user?.displayName ?? user?.username ?? 'U').charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="avatar-picker" role="radiogroup" aria-label="انتخاب آواتار">
          {PROFILE_AVATARS.map((avatar) => {
            const src = getProfileAvatarSrc(avatar)
            const checked = selectedAvatar === avatar

            return (
              <label
                className={`avatar-picker__item ${
                  checked ? 'avatar-picker__item--selected' : ''
                }`}
                key={avatar}
              >
                <input
                  type="radio"
                  name="profile-avatar"
                  value={avatar}
                  checked={checked}
                  onChange={() => onAvatarSelect(avatar)}
                />
                <img src={src ?? ''} alt="" aria-hidden="true" />
                <span>{avatar.replace('.png', '')}</span>
              </label>
            )
          })}
        </div>

        <label className="field">
          <span>رمز عبور فعلی</span>
          <input
            type="password"
            autoComplete="current-password"
            value={avatarCurrentPassword}
            onChange={(event) => onAvatarCurrentPasswordChange(event.target.value)}
            placeholder="برای ذخیره آواتار، رمز فعلی را وارد کنید"
          />
        </label>

        <button className="submit-button" type="submit" disabled={avatarSaving}>
          {avatarSaving ? 'در حال ذخیره...' : 'ذخیره آواتار'}
        </button>
      </form>

      {avatarStatusMessage ? (
        <p className="settings-card__feedback">{avatarStatusMessage}</p>
      ) : null}

      {message ? <p className="settings-card__feedback">{message}</p> : null}
    </section>
  )
}
