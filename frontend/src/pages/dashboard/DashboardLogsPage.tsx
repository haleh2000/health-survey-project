import { useEffect, useState, useCallback } from "react";
import { apiGet, ApiError } from "../../services/api";
import { useAuth } from "../../auth/useAuth";

interface RequestLog {
  id: string;
  sequenceId: number;
  userId: number | null;
  userRole: number | null;
  username: string | null;
  userEmail: string | null;
  method: string;
  route: string;
  apiContext: string;
  payload: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number;
  createdAt: string;
}

interface PaginatedLogs {
  data: RequestLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LogQueryParams {
  page?: number;
  limit?: number;
  userId?: number;
  method?: string;
  route?: string;
  apiContext?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface LogStats {
  totalLogs: number;
  logsByContext: Record<string, number>;
  logsByMethod: Record<string, number>;
  logsByStatusCode: Record<number, number>;
  recentErrors: number;
}

const ROLE_LABELS: Record<number, string> = {
  0: "ادمین",
  1: "ارزیاب",
  2: "سوپروایزر",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "method-get",
  POST: "method-post",
  PUT: "method-put",
  PATCH: "method-patch",
  DELETE: "method-delete",
};

function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return "status-success";
  if (statusCode >= 400 && statusCode < 500) return "status-client-error";
  if (statusCode >= 500) return "status-server-error";
  return "";
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      calendar: "persian",
      numberingSystem: "latn",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function DashboardLogsPage() {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<LogQueryParams>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiGet<PaginatedLogs>(
        `/logs?${params.toString()}`,
        accessToken,
      );
      setLogs(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("خطا در دریافت لاگ‌ها");
      }
    } finally {
      setLoading(false);
    }
  }, [filters, accessToken]);

  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await apiGet<LogStats>("/logs/stats", accessToken);
      setStats(response);
    } catch {
      // Silently fail stats fetch
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLogs, fetchStats]);

  const handleFilterChange = (
    key: keyof LogQueryParams,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const handleLogClick = (log: RequestLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setShowDetails(false);
  };

  if (loading && logs.length === 0) {
    return (
      <section className="profile-section-card logs-card">
        <div className="logs-loading">در حال بارگذاری لاگ‌ها...</div>
      </section>
    );
  }

  return (
    <section className="profile-section-card logs-card">
      <div className="settings-card__header">
        <div>
          <span>وقایع</span>
          <h2>رویدادهای سامانه</h2>
          <p>نمایش تاریخچه درخواست‌های API با قابلیت فیلتر و جستجو</p>
        </div>
      </div>

      {stats && (
        <div className="logs-stats" aria-label="آمار لاگ‌ها">
          <div className="stat-item">
            <span className="stat-value">
              {stats.totalLogs.toLocaleString("fa-IR")}
            </span>
            <span className="stat-label">کل لاگ‌ها</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {stats.recentErrors.toLocaleString("fa-IR")}
            </span>
            <span className="stat-label">خطاهای ۲۴ ساعت اخیر</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {Object.values(stats.logsByMethod).reduce((a, b) => a + b, 0)}
            </span>
            <span className="stat-label">کل درخواست‌ها</span>
          </div>
        </div>
      )}

      <div className="logs-filters" aria-label="فیلترهای لاگ‌ها">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="log-search">جستجو</label>
            <input
              id="log-search"
              type="text"
              placeholder="مسیر، نام کاربری، IP..."
              value={filters.search ?? ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="log-method">متد</label>
            <select
              id="log-method"
              value={filters.method ?? ""}
              onChange={(e) =>
                handleFilterChange("method", e.target.value || undefined)
              }
              className="filter-select"
            >
              <option value="">همه</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="log-context">محنوا</label>
            <select
              id="log-context"
              value={filters.apiContext ?? ""}
              onChange={(e) =>
                handleFilterChange("apiContext", e.target.value || undefined)
              }
              className="filter-select"
            >
              <option value="">همه</option>
              <option value="auth">احراز هویت</option>
              <option value="user">کاربران</option>
              <option value="claim">کلیم</option>
              <option value="fraud-detection">تقلب یابی</option>
              <option value="feedback">بازخورد</option>
              <option value="export">صادرسازی</option>
              <option value="import">ورود داده</option>
              <option value="image">تصاویر</option>
              <option value="job">جاب‌ ها</option>
              <option value="superset">سوپرست</option>
              <option value="dashboard">داشبورد</option>
              <option value="other">سایر</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="log-status">کد وضعیت</label>
            <input
              id="log-status"
              type="number"
              placeholder="مثال: 200"
              value={filters.statusCode ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "statusCode",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="filter-input"
            />
          </div>
        </div>
        <div className="filters-actions">
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-secondary"
          >
            پاک کردن فیلترها
          </button>
        </div>
      </div>

      {error && (
        <div className="logs-error" role="alert">
          {error}
        </div>
      )}

      <div
        className="logs-table-container"
        role="region"
        aria-label="جدول لاگ‌ها"
        tabIndex={0}
      >
        <table className="logs-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">زمان</th>
              <th scope="col">متد</th>
              <th scope="col">مسیر</th>
              <th scope="col">کاربر</th>
              <th scope="col">وضعیت</th>
              <th scope="col">مدت</th>
              <th scope="col">IP</th>
              <th scope="col">Context</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="logs-empty">
                  هیچ لاگی یافت نشد
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr
                  key={log.id}
                  onClick={() => handleLogClick(log)}
                  className="logs-table__row"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleLogClick(log);
                    }
                  }}
                >
                  <td>
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="logs-time">{formatDate(log.createdAt)}</td>
                  <td>
                    <span
                      className={`method-badge ${METHOD_COLORS[log.method] || ""}`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="logs-route" title={log.route}>
                    {log.route.length > 50
                      ? log.route.substring(0, 50) + "…"
                      : log.route}
                  </td>
                  <td className="logs-user">
                    {log.username ? (
                      <>
                        <span>{log.username}</span>
                        {log.userRole !== null && (
                          <span className="role-badge">
                            {ROLE_LABELS[log.userRole] ?? log.userRole}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusColor(log.statusCode)}`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="logs-duration">
                    {formatDuration(log.durationMs)}
                  </td>
                  <td className="logs-ip">{log.ipAddress ?? "—"}</td>
                  <td>
                    <span className="context-badge">{log.apiContext}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <nav className="logs-pagination" aria-label="صفحه‌بندی لاگ‌ها">
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-secondary btn-sm"
          >
            قبلی
          </button>
          <span className="pagination-info">
            صفحه {pagination.page} از {pagination.totalPages} (کل{" "}
            {pagination.total} رکورد)
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary btn-sm"
          >
            بعدی
          </button>
        </nav>
      )}

      {showDetails && selectedLog && (
        <div
          className="log-modal-overlay"
          onClick={handleCloseDetails}
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-modal-title"
        >
          <div className="log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal__header">
              <h3 id="log-modal-title">جزئیات لاگ</h3>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="btn-close"
                aria-label="بستن"
              >
                ×
              </button>
            </div>
            <div className="log-modal__body">
              <div className="log-detail-grid">
                <div className="log-detail-item">
                  <label>شناسه</label>
                  <code>{selectedLog.id}</code>
                </div>
                <div className="log-detail-item">
                  <label>Sequence ID</label>
                  <code>{selectedLog.sequenceId}</code>
                </div>
                <div className="log-detail-item">
                  <label>زمان</label>
                  <span>{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div className="log-detail-item">
                  <label>متد</label>
                  <span
                    className={`method-badge ${METHOD_COLORS[selectedLog.method] || ""}`}
                  >
                    {selectedLog.method}
                  </span>
                </div>
                <div className="log-detail-item">
                  <label>مسیر</label>
                  <code>{selectedLog.route}</code>
                </div>
                <div className="log-detail-item">
                  <label>Context</label>
                  <span className="context-badge">
                    {selectedLog.apiContext}
                  </span>
                </div>
                <div className="log-detail-item">
                  <label>کد وضعیت</label>
                  <span
                    className={`status-badge ${getStatusColor(selectedLog.statusCode)}`}
                  >
                    {selectedLog.statusCode}
                  </span>
                </div>
                <div className="log-detail-item">
                  <label>مدت اجرا</label>
                  <span>{formatDuration(selectedLog.durationMs)}</span>
                </div>
                <div className="log-detail-item">
                  <label>IP</label>
                  <code>{selectedLog.ipAddress ?? "—"}</code>
                </div>
                <div className="log-detail-item">
                  <label>کاربر</label>
                  <span>
                    {selectedLog.username ?? "—"}
                    {selectedLog.userRole !== null && (
                      <span className="role-badge ml-2">
                        {ROLE_LABELS[selectedLog.userRole] ??
                          selectedLog.userRole}
                      </span>
                    )}
                  </span>
                </div>
                <div className="log-detail-item">
                  <label>ایمیل کاربر</label>
                  <span>{selectedLog.userEmail ?? "—"}</span>
                </div>
                <div className="log-detail-item">
                  <label>User Agent</label>
                  <code className="user-agent">
                    {selectedLog.userAgent ?? "—"}
                  </code>
                </div>
              </div>

              {selectedLog.payload && (
                <div className="log-detail-section">
                  <h4>Payload (درخواست)</h4>
                  <pre className="log-json">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.response && (
                <div className="log-detail-section">
                  <h4>Response (پاسخ)</h4>
                  <pre className="log-json">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.response &&
                selectedLog.route.includes("/fraud-case") && (
                  <div className="log-detail-section">
                    <p className="text-muted">
                      پاسخ برای درخواست‌های fraud-case ثبت نشده است (طبق سیاست
                      امنیت).
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
