import type { FormEvent } from 'react'
import type { UserEditForm, UserRecord } from './dashboard.types'
import { toEnglishDigits } from '../../utils/digits'

function getRoleLabel(roleId: number | null) {
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

export function DashboardUsersPage({
  canManageUsers,
  managedRoleOptions,
  createUserForm,
  createUserLoading,
  createUserMessage,
  isCreateUserModalOpen,
  selectedUser,
  selectedUserId,
  userActionLoading,
  userActionMessage,
  userEditForm,
  users,
  usersError,
  usersLoading,
  onCreateUserClose,
  onCreateUserEmailChange,
  onCreateUserOpen,
  onCreateUserPasswordChange,
  onCreateUserRoleChange,
  onCreateUserSubmit,
  onCreateUserUsernameChange,
  onEmailChange,
  onResetPassword,
  onRoleChange,
  onSaveUser,
  onSelectUser,
  isSupervisor,
}: {
  canManageUsers: boolean
  managedRoleOptions: Array<{ value: string; label: string }>
  createUserForm: {
    username: string
    password: string
    email: string
    roleId: string
  }
  createUserLoading: boolean
  createUserMessage: string
  isCreateUserModalOpen: boolean
  selectedUser: UserRecord | undefined
  selectedUserId: string | number | null
  userActionLoading: boolean
  userActionMessage: string
  userEditForm: UserEditForm
  users: UserRecord[]
  usersError: string
  usersLoading: boolean
  onCreateUserClose: () => void
  onCreateUserEmailChange: (value: string) => void
  onCreateUserOpen: () => void
  onCreateUserPasswordChange: (value: string) => void
  onCreateUserRoleChange: (value: string) => void
  onCreateUserSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCreateUserUsernameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onResetPassword: (event: FormEvent<HTMLFormElement>) => void
  onRoleChange: (value: string) => void
  onSaveUser: (event: FormEvent<HTMLFormElement>) => void
  onSelectUser: (id: string | number | null) => void
  isSupervisor: boolean
}) {
  if (!canManageUsers) {
    return (
      <section className="profile-section-card access-denied-card">
        <span>دسترسی محدود</span>
      </section>
    )
  }

  return (
    <section className="profile-section-card users-admin-card">
      <div className="users-admin-header">
        <div>
          <span>کاربران</span>
          <h2>مدیریت نقش و اطلاعات کاربران</h2>
        </div>
      </div>

      <div className="users-admin-grid">
        <section className="users-list-panel">
          <div className="users-list-panel__header">
            <h3>فهرست کاربران</h3>
            <button
              className="users-create-button"
              type="button"
              onClick={onCreateUserOpen}
            >
              ایجاد کاربر
            </button>
          </div>

          {usersLoading ? (
            <div className="admin-state">در حال دریافت کاربران...</div>
          ) : usersError ? (
            <div className="admin-state admin-state--error">{usersError}</div>
          ) : users.length ? (
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th scope="col">نام کاربری</th>
                    <th scope="col">ایمیل</th>
                    <th scope="col">نقش</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((record) => {
                      // Supervisor cannot see admin users (role 0)
                      if (isSupervisor && (record.role ?? null) === 0) {
                        return false
                      }
                      return true
                    })
                    .map((record) => {
                      const rowRoleId = record.role ?? null
                      const isSelected =
                        String(record.id) === String(selectedUserId)

                      return (
                        <tr
                          key={String(record.id ?? record.username)}
                          className={isSelected ? 'is-selected' : ''}
                          onClick={() => {
                            onSelectUser(record.id ?? null)
                          }}
                        >
                          <td>
                            {toEnglishDigits(
                              record.username ?? record.displayName ?? '—',
                            )}
                          </td>
                          <td>{toEnglishDigits(record.email ?? '—')}</td>
                          <td>{toEnglishDigits(getRoleLabel(rowRoleId))}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-state">کاربری برای نمایش وجود ندارد.</div>
          )}
        </section>

        <section className="users-editor-panel">
          <h3>ویرایش کاربر</h3>

          {selectedUser ? (
            <>
              <div className="users-editor-meta">
                <span>کاربر انتخاب‌شده</span>
                <strong>
                  {toEnglishDigits(
                    selectedUser.username ?? selectedUser.displayName ?? '—',
                  )}
                </strong>
              </div>

              <form className="users-form" onSubmit={onSaveUser}>
                <label className="field">
                  <span>ایمیل</span>
                  <input
                    type="email"
                    value={userEditForm.email}
                    onChange={(event) => onEmailChange(event.target.value)}
                  />
                </label>

                {!isSupervisor && (
                  <label className="field">
                    <span>نقش</span>
                    <select
                      value={userEditForm.roleId}
                      onChange={(event) => onRoleChange(event.target.value)}
                    >
                      {managedRoleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {isSupervisor && selectedUser && (
                  <label className="field">
                    <span>نقش</span>
                    <div className="field-readonly">
                      {toEnglishDigits(getRoleLabel(selectedUser.role ?? null))}
                    </div>
                  </label>
                )}

                <button className="submit-button" type="submit" disabled={userActionLoading}>
                  {userActionLoading ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
                </button>
              </form>

              <form className="users-form" onSubmit={onResetPassword}>
                <label className="field">
                  <span>رمز عبور جدید</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="رمز عبور جدید"
                  />
                </label>

                <button className="submit-button" type="submit" disabled={userActionLoading}>
                  {userActionLoading ? 'در حال بازنشانی...' : 'بازنشانی رمز'}
                </button>
              </form>

              {userActionMessage ? (
                <p className="admin-message">{userActionMessage}</p>
              ) : null}
            </>
          ) : (
            <div className="admin-state">یک کاربر را از فهرست انتخاب کنید.</div>
          )}
        </section>
      </div>

      {isCreateUserModalOpen ? (
        <div className="users-modal" role="dialog" aria-modal="true" aria-label="ایجاد کاربر جدید">
          <button
            className="users-modal__backdrop"
            type="button"
            aria-label="بستن پنجره"
            onClick={onCreateUserClose}
          />
          <div className="users-modal__dialog">
            <div className="users-modal__header">
              <div>
                <span>ایجاد کاربر</span>
                <h3>افزودن کاربر جدید</h3>
              </div>
              <button
                className="users-modal__close"
                type="button"
                onClick={onCreateUserClose}
                aria-label="بستن"
              >
                ×
              </button>
            </div>

            <form className="users-form users-create-form" onSubmit={onCreateUserSubmit}>
              <label className="field">
                <span>نام کاربری</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={createUserForm.username}
                  onChange={(event) => onCreateUserUsernameChange(event.target.value)}
                />
              </label>

              <label className="field">
                <span>رمز عبور</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={createUserForm.password}
                  onChange={(event) => onCreateUserPasswordChange(event.target.value)}
                />
              </label>

              <label className="field">
                <span>ایمیل</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={createUserForm.email}
                  onChange={(event) => onCreateUserEmailChange(event.target.value)}
                />
              </label>

              {isSupervisor ? (
                <label className="field">
                  <span>نقش</span>
                  <div className="field-readonly">
                    ارزیاب
                  </div>
                </label>
              ) : (
                <label className="field">
                  <span>نقش</span>
                  <select
                    value={createUserForm.roleId}
                    onChange={(event) => onCreateUserRoleChange(event.target.value)}
                  >
                    {managedRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <button className="submit-button" type="submit" disabled={createUserLoading}>
                {createUserLoading ? 'در حال ایجاد...' : 'ایجاد کاربر'}
              </button>
            </form>

            {createUserMessage ? (
              <p className="admin-message">{createUserMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
