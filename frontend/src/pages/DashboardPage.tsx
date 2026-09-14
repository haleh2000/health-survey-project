import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiGet, apiRequest, ApiError } from "../services/api";
import { useAuth } from "../auth/useAuth";
import type { AuthUser } from "../auth/types";
import { DashboardLayout } from "../components/DashboardLayout";
import { getStoredTheme, setTheme, type ThemeMode } from "../utils/theme";
import { DashboardHomePage } from "./dashboard/DashboardHomePage";
import { DashboardLogsPage } from "./dashboard/DashboardLogsPage";
import { DashboardProfilePage } from "./dashboard/DashboardProfilePage";
import { DashboardReportsPage } from "./dashboard/DashboardReportsPage";
import { DashboardSuspiciousCasesPage } from "./dashboard/DashboardSuspiciousCasesPage";
import { DashboardSettingsPage } from "./dashboard/DashboardSettingsPage";
import { DashboardUsersPage } from "./dashboard/DashboardUsersPage";
import type {
  UserEditForm,
  UserRecord,
  UsersApiResponse,
} from "./dashboard/dashboard.types";
import { getProfileAvatarName } from "../utils/avatar";
import { toEnglishDigits } from "../utils/digits";

type DashboardMenuKey =
  | "خانه"
  | "پروفایل و تنظیمات"
  | "جدول موارد مشکوک"
  | "گزارشات"
  | "وقایع"
  | "کاربران";

type DashboardMenuItem = {
  key: DashboardMenuKey;
  label: string;
  adminOnly?: boolean;
  managementOnly?: boolean;
};

const ADMIN_ROLE_ID = 0;
const SUPERVISOR_ROLE_ID = 1;
const EVALUATOR_ROLE_ID = 2;

const menuItems: DashboardMenuItem[] = [
  { key: "خانه", label: "خانه" },
  { key: "پروفایل و تنظیمات", label: "پروفایل و تنظیمات" },
  { key: "جدول موارد مشکوک", label: "جدول موارد مشکوک" },
  { key: "گزارشات", label: "گزارشات" },
  { key: "وقایع", label: "وقایع", adminOnly: true },
  { key: "کاربران", label: "کاربران", managementOnly: true },
];

async function loadUsers(
  token: string | undefined,
  signal?: AbortSignal,
): Promise<UserRecord[]> {
  const response = await apiGet<UsersApiResponse>("/user", token, {
    signal,
  });

  return normalizeUsersResponse(response);
}

type CreateUserFormState = {
  username: string;
  password: string;
  email: string;
  roleId: string;
};

const EMPTY_CREATE_USER_FORM: CreateUserFormState = {
  username: "",
  password: "",
  email: "",
  roleId: String(1),
};

export function DashboardPage() {
  const { session, user, logout, updateProfile } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState<DashboardMenuKey>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeMenuItem");
      if (stored) return stored as DashboardMenuKey;
    }
    return "خانه";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [profile, setProfile] = useState<AuthUser | null>(user ?? null);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileStatusMessage, setProfileStatusMessage] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [avatarValue, setAvatarValue] = useState(
    getProfileAvatarName(user?.avatar) ?? "",
  );
  const [avatarCurrentPassword, setAvatarCurrentPassword] = useState("");
  const [avatarStatusMessage, setAvatarStatusMessage] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersReloadKey, setUsersReloadKey] = useState(0);
  const [profileReloadKey, setProfileReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(
    null,
  );
  const [userEditForm, setUserEditForm] = useState<UserEditForm>({
    email: "",
    roleId: String(1),
  });

  const handleSelectUser = useCallback((userId: string | number | null) => {
    setSelectedUserId(userId);
    if (userId !== null) {
      const selectedUser = users.find(
        (item) => String(item.id) === String(userId),
      );
      if (selectedUser) {
        setUserEditForm({
          email: String(selectedUser.email ?? ""),
          roleId: String(getUserRoleId(selectedUser) ?? 2),
        });
      }
    } else {
      setUserEditForm({ email: "", roleId: String(1) });
    }
  }, [users]);

  const [userActionMessage, setUserActionMessage] = useState("");
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<CreateUserFormState>({
    username: "",
    password: "",
    email: "",
    roleId: String(1),
  });
  const [createUserMessage, setCreateUserMessage] = useState("");
  const [createUserLoading, setCreateUserLoading] = useState(false);

  const todayJalali = toEnglishDigits(
    new Intl.DateTimeFormat("fa-IR", {
      calendar: "persian",
      numberingSystem: "latn",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  );

  const currentUserRoleId = getUserRoleId(user);
  const isAdmin = currentUserRoleId === ADMIN_ROLE_ID;
  const isSupervisor = currentUserRoleId === SUPERVISOR_ROLE_ID;
  const canManageUsers = isAdmin || isSupervisor;
  const managedUserRoleOptions = isAdmin
    ? [
        { value: String(ADMIN_ROLE_ID), label: "ادمین" },
        { value: String(EVALUATOR_ROLE_ID), label: "ارزیاب" },
        { value: String(SUPERVISOR_ROLE_ID), label: "سوپروایزر" },
      ]
    : [{ value: String(EVALUATOR_ROLE_ID), label: "ارزیاب" }];

  const visibleMenuItems = useMemo(
    () =>
      menuItems.filter((item) => {
        if (item.adminOnly) {
          return isAdmin;
        }

        if (item.managementOnly) {
          return canManageUsers;
        }

        return true;
      }),
    [canManageUsers, isAdmin],
  );

  useEffect(() => {
    if (!visibleMenuItems.some((item) => item.key === activeMenuItem)) {
      window.setTimeout(() => setActiveMenuItem("خانه"), 0);
    }
  }, [visibleMenuItems, activeMenuItem]);

  useEffect(() => {
    if (!activeMenuItem || activeMenuItem !== "پروفایل و تنظیمات") {
      return undefined;
    }

    const controller = new AbortController();

    void apiGet<{ user?: AuthUser; data?: { user?: AuthUser } }>(
      "/auth/me",
      session?.tokens.accessToken,
      { signal: controller.signal },
    )
      .then((response) => {
        const nextProfile = response.user ?? response.data?.user ?? null;
        setProfile(nextProfile);
        setAvatarValue(getProfileAvatarName(nextProfile?.avatar) ?? "");
        setProfileForm({
          username: nextProfile?.username ?? "",
          email: nextProfile?.email ?? "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError) {
          setProfileError(error.message);
          setProfile(null);
          return;
        }

        setProfileError("دریافت اطلاعات پروفایل انجام نشد.");
        setProfile(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setProfileLoading(false);
        }
      });

    return () => {
      controller.abort();
      setProfileLoading(false);
    };
  }, [activeMenuItem, session?.tokens.accessToken, profileReloadKey]);

  useEffect(() => {
    if (activeMenuItem !== "کاربران" || !canManageUsers) {
      return undefined;
    }

    const controller = new AbortController();

    loadUsers(session?.tokens.accessToken, controller.signal)
      .then((nextUsers) => {
        if (controller.signal.aborted) {
          return;
        }
        setUsers(nextUsers);

        setSelectedUserId((currentSelectedId) => {
          if (
            currentSelectedId !== null &&
            nextUsers.some(
              (record) => String(record.id) === String(currentSelectedId),
            )
          ) {
            return currentSelectedId;
          }

          return nextUsers.length ? (nextUsers[0].id ?? null) : null;
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError) {
          setUsersError(error.message);
          setUsers([]);
          return;
        }

        setUsersError("دریافت فهرست کاربران انجام نشد.");
        setUsers([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [activeMenuItem, canManageUsers, session?.tokens.accessToken, usersReloadKey]);

  const selectedUser = users.find(
    (item) => String(item.id) === String(selectedUserId),
  );

  function handleThemeToggle() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    setTheme(nextTheme);
    setSettingsMessage(
      nextTheme === "dark" ? "حالت تاریک فعال شد." : "حالت روشن فعال شد.",
    );
  }

  function handleSelectMenu(item: DashboardMenuKey) {
    setActiveMenuItem(item);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeMenuItem", item);
    }
    setProfileStatusMessage("");
    setSettingsMessage("");
    setAvatarStatusMessage("");
    setCreateUserMessage("");
    setIsCreateUserModalOpen(false);

    if (item === "پروفایل و تنظیمات") {
      if (activeMenuItem === "پروفایل و تنظیمات") {
        setProfileReloadKey((k) => k + 1);
      } else {
        setProfileLoading(true);
        setProfileError("");
      }
    }

    if (item === "کاربران" && canManageUsers) {
      if (activeMenuItem === "کاربران") {
        setUsersReloadKey((k) => k + 1);
      } else {
        setUsersLoading(true);
        setUsersError("");
      }
    }
  }

  function handleToggleSidebar() {
    setIsSidebarCollapsed((current) => !current);
  }

  async function handleSaveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser || selectedUserId === null) {
      setUserActionMessage("ابتدا یک کاربر را انتخاب کنید.");
      return;
    }

    setUserActionLoading(true);
    setUserActionMessage("");

    try {
      await apiRequest(`/user/${encodeURIComponent(String(selectedUserId))}`, {
        method: "PATCH",
        token: session?.tokens.accessToken,
        body: JSON.stringify({
          email: userEditForm.email.trim(),
          role: Number(userEditForm.roleId),
        }),
      });

      setUserActionMessage("اطلاعات کاربر ذخیره شد.");
    } catch (error) {
      if (error instanceof ApiError) {
        setUserActionMessage(error.message);
      } else {
        setUserActionMessage("ذخیره اطلاعات کاربر انجام نشد.");
      }
    } finally {
      setUserActionLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser || selectedUserId === null) {
      setUserActionMessage("ابتدا یک کاربر را انتخاب کنید.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "").trim();

    if (!password) {
      setUserActionMessage("رمز عبور جدید را وارد کنید.");
      return;
    }

    setUserActionLoading(true);
    setUserActionMessage("");

    try {
      await apiRequest(
        `/auth/${encodeURIComponent(String(selectedUserId))}/reset-password`,
        {
          method: "POST",
          token: session?.tokens.accessToken,
          body: JSON.stringify({ password }),
        },
      );

      setUserActionMessage("رمز عبور کاربر بازنشانی شد.");
      event.currentTarget.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setUserActionMessage(error.message);
      } else {
        setUserActionMessage("بازنشانی رمز عبور انجام نشد.");
      }
    } finally {
      setUserActionLoading(false);
    }
  }

  async function handleCreateUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = createUserForm.username.trim();
    const password = createUserForm.password.trim();
    const email = createUserForm.email.trim();

    if (!username) {
      setCreateUserMessage("نام کاربری را وارد کنید.");
      return;
    }

    if (!password) {
      setCreateUserMessage("رمز عبور را وارد کنید.");
      return;
    }

    setCreateUserLoading(true);
    setCreateUserMessage("");

    try {
      const createdUser = await apiRequest<UserRecord>("/user", {
        method: "POST",
        token: session?.tokens.accessToken,
        body: JSON.stringify({
          username,
          password,
          email: email || undefined,
          role: Number(createUserForm.roleId),
        }),
      });

      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setSelectedUserId(createdUser.id ?? null);
      setCreateUserForm(EMPTY_CREATE_USER_FORM);
      setIsCreateUserModalOpen(false);
      setUserActionMessage("کاربر جدید ایجاد شد.");
    } catch (error) {
      setCreateUserMessage(
        error instanceof ApiError ? error.message : "ایجاد کاربر انجام نشد.",
      );
    } finally {
      setCreateUserLoading(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      setProfileStatusMessage("اطلاعات پروفایل در دسترس نیست.");
      return;
    }

    const nextUsername = profileForm.username.trim();
    const nextEmail = profileForm.email.trim();
    const currentPassword = profileForm.currentPassword.trim();
    const nextPassword = profileForm.newPassword.trim();
    const confirmNewPassword = profileForm.confirmNewPassword.trim();
    const hasProfileChanges =
      nextUsername !== (profile.username ?? "") ||
      nextEmail !== (profile.email ?? "") ||
      Boolean(nextPassword) ||
      Boolean(confirmNewPassword);

    if (!hasProfileChanges) {
      setProfileStatusMessage("برای ذخیره، ابتدا یک تغییر اعمال کنید.");
      return;
    }

    if (!currentPassword) {
      setProfileStatusMessage(
        "برای ذخیره تغییرات، رمز عبور فعلی را وارد کنید.",
      );
      return;
    }

    if (nextPassword || confirmNewPassword) {
      if (!nextPassword || !confirmNewPassword) {
        setProfileStatusMessage(
          "برای تغییر رمز عبور، هر دو فیلد را کامل کنید.",
        );
        return;
      }

      if (nextPassword !== confirmNewPassword) {
        setProfileStatusMessage("رمز عبور جدید و تکرار آن یکسان نیست.");
        return;
      }
    }

    setProfileSubmitting(true);
    setProfileStatusMessage("");

    try {
      const nextSession = await updateProfile({
        username: nextUsername,
        email: nextEmail,
        currentPassword,
        password: nextPassword || undefined,
      });

      setProfile(nextSession.user);
      setAvatarValue(getProfileAvatarName(nextSession.user.avatar) ?? "");
      setProfileForm((current) => ({
        ...current,
        username: nextSession.user.username ?? "",
        email: nextSession.user.email ?? "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      setProfileStatusMessage(
        "اطلاعات پروفایل ذخیره شد و نشست شما به‌روزرسانی شد.",
      );
    } catch (error) {
      setProfileStatusMessage(
        error instanceof ApiError
          ? error.message
          : "ذخیره اطلاعات پروفایل انجام نشد.",
      );
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleAvatarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      setAvatarStatusMessage("اطلاعات پروفایل در دسترس نیست.");
      return;
    }

    const nextAvatar = avatarValue.trim();
    const currentPassword = avatarCurrentPassword.trim();
    const currentAvatar = getProfileAvatarName(profile.avatar) ?? "";

    if (!nextAvatar) {
      setAvatarStatusMessage("یک آواتار انتخاب کنید.");
      return;
    }

    if (nextAvatar === currentAvatar) {
      setAvatarStatusMessage("این آواتار قبلاً انتخاب شده است.");
      return;
    }

    if (!currentPassword) {
      setAvatarStatusMessage("برای ذخیره آواتار، رمز عبور فعلی را وارد کنید.");
      return;
    }

    setAvatarSaving(true);
    setAvatarStatusMessage("");

    try {
      const nextSession = await updateProfile({
        avatar: nextAvatar,
        currentPassword,
      });

      setProfile(nextSession.user);
      setAvatarValue(getProfileAvatarName(nextSession.user.avatar) ?? "");
      setAvatarCurrentPassword("");
      setAvatarStatusMessage("آواتار پروفایل ذخیره شد.");
    } catch (error) {
      setAvatarStatusMessage(
        error instanceof ApiError ? error.message : "ذخیره آواتار انجام نشد.",
      );
    } finally {
      setAvatarSaving(false);
    }
  }

  const content =
    activeMenuItem === "خانه" ? (
      <DashboardHomePage dateLabel={todayJalali.replace(',','')} isAdmin={isAdmin} isSupervisor={isSupervisor}/>
    ) : activeMenuItem === "پروفایل و تنظیمات" ? (
      <div className="dashboard-profile-settings">
        <DashboardProfilePage
          error={profileError}
          loading={profileLoading}
          onEmailChange={(value) =>
            setProfileForm((current) => ({
              ...current,
              email: value,
            }))
          }
          onCurrentPasswordChange={(value) =>
            setProfileForm((current) => ({
              ...current,
              currentPassword: value,
            }))
          }
          onConfirmNewPasswordChange={(value) =>
            setProfileForm((current) => ({
              ...current,
              confirmNewPassword: value,
            }))
          }
          onNewPasswordChange={(value) =>
            setProfileForm((current) => ({
              ...current,
              newPassword: value,
            }))
          }
          onSubmit={handleProfileSubmit}
          onUsernameChange={(value) =>
            setProfileForm((current) => ({
              ...current,
              username: value,
            }))
          }
          profile={profile}
          profileForm={profileForm}
          statusMessage={profileStatusMessage}
          submitting={profileSubmitting}
        />
        <DashboardSettingsPage
          avatarCurrentPassword={avatarCurrentPassword}
          avatarSaving={avatarSaving}
          avatarStatusMessage={avatarStatusMessage}
          avatarValue={avatarValue}
          onAvatarCurrentPasswordChange={(value) =>
            setAvatarCurrentPassword(value)
          }
          onAvatarSave={handleAvatarSubmit}
          onAvatarSelect={(value) => {
            setAvatarValue(value);
            setAvatarStatusMessage("");
          }}
          message={settingsMessage}
          onThemeToggle={handleThemeToggle}
          theme={theme}
          user={user}
        />
      </div>
    ) : activeMenuItem === "جدول موارد مشکوک" ? (
      <DashboardSuspiciousCasesPage />
    ) : activeMenuItem === "گزارشات" ? (
      <DashboardReportsPage />
    ) : activeMenuItem === "وقایع" ? (
      <DashboardLogsPage />
    ) : activeMenuItem === "کاربران" ? (
      <DashboardUsersPage
        canManageUsers={canManageUsers}
        managedRoleOptions={managedUserRoleOptions}
        createUserForm={createUserForm}
        createUserLoading={createUserLoading}
        createUserMessage={createUserMessage}
        isCreateUserModalOpen={isCreateUserModalOpen}
        onEmailChange={(value) =>
          setUserEditForm((current) => ({
            ...current,
            email: value,
          }))
        }
        onCreateUserClose={() => {
          setIsCreateUserModalOpen(false);
          setCreateUserMessage("");
        }}
        onCreateUserEmailChange={(value) =>
          setCreateUserForm((current) => ({
            ...current,
            email: value,
          }))
        }
        onCreateUserOpen={() => {
          setIsCreateUserModalOpen(true);
          setCreateUserMessage("");
          setCreateUserForm(EMPTY_CREATE_USER_FORM);
        }}
        onCreateUserPasswordChange={(value) =>
          setCreateUserForm((current) => ({
            ...current,
            password: value,
          }))
        }
        onCreateUserRoleChange={(value) =>
          setCreateUserForm((current) => ({
            ...current,
            roleId: value,
          }))
        }
        onCreateUserSubmit={handleCreateUserSubmit}
        onCreateUserUsernameChange={(value) =>
          setCreateUserForm((current) => ({
            ...current,
            username: value,
          }))
        }
        onResetPassword={handleResetPassword}
        onRoleChange={(value) =>
          setUserEditForm((current) => ({
            ...current,
            roleId: value,
          }))
        }
        onSaveUser={handleSaveUser}
        onSelectUser={handleSelectUser}
        selectedUser={selectedUser}
        selectedUserId={selectedUserId}
        userActionLoading={userActionLoading}
        userActionMessage={userActionMessage}
        userEditForm={userEditForm}
        users={users}
        usersError={usersError}
        usersLoading={usersLoading}
        isSupervisor={isSupervisor}
      />
    ) : (
      <DashboardHomePage dateLabel={todayJalali.replace(',','')} isAdmin={isAdmin} isSupervisor={isSupervisor}/>
    );

  return (
    <DashboardLayout
      user={user}
      dateLabel={todayJalali.replace(',','')}
      onLogout={logout}
      onToggleSidebar={handleToggleSidebar}
      isSidebarCollapsed={isSidebarCollapsed}
      content={content}
    >
      <nav className="dashboard-menu" aria-label="منوی اصلی">
        {visibleMenuItems.map((item) => (
          <button
            className={`dashboard-menu__item ${
              activeMenuItem === item.key ? "dashboard-menu__item--active" : ""
            }`}
            type="button"
            key={item.key}
            onClick={() => handleSelectMenu(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </DashboardLayout>
  );
}

function normalizeUsersResponse(response: UsersApiResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    const dataRecord = data as { users?: UserRecord[] };

    if (Array.isArray(dataRecord.users)) {
      return dataRecord.users;
    }
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  return [];
}

function getUserRoleId(user: UserRecord | null | undefined) {
  if (!user) {
    return ADMIN_ROLE_ID;
  }

  return user.role ?? ADMIN_ROLE_ID;
}
