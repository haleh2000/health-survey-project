import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { feedbackApi } from "../../services/feedbackApi";
import { getFraudCasesCount, getFraudCasesWithFeedbackCountByUser } from "../../services/fraudCasesService";
import { jobApi } from "../../services/jobApi";
import type { Feedback } from "../../services/feedbackApi";
import type { JobState, JobsStatusResponse } from "../../services/jobApi";

type FeedbackFormMode = "create" | "edit" | null;

export function DashboardHomePage({
  dateLabel,
  isAdmin,
  isSupervisor,
}: {
  dateLabel: string;
  isAdmin: boolean;
  isSupervisor: boolean;
}) {
  const { session } = useAuth();
  const accessToken = session?.tokens.accessToken;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  // استیت‌های مربوط به آمار جدید
  const [totalCasesCount, setTotalCasesCount] = useState<number | null>(null);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState<number | null>(null);
  const [casesWithFeedbackCount, setCasesWithFeedbackCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formMode, setFormMode] = useState<FeedbackFormMode>(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null,
  );
  const [title, setTitle] = useState("");

  // استیت‌های مربوط به مدیریت شغل‌ها
  const [jobStatus, setJobStatus] = useState<JobsStatusResponse | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobActionLoading, setJobActionLoading] = useState<string | null>(null);
  const jobPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // دریافت لیست فیدبک‌ها و آمار موارد مشکوک
  useEffect(() => {
    // بارگذاری فیدبک‌ها
    feedbackApi
      .getAll(accessToken)
      .then((data) => {
        setFeedbacks(data);
      })
      .catch(() => {
        setErrorMessage("دریافت لیست بازخوردها با خطا مواجه شد.");
      })
      .finally(() => {
        setIsLoadingFeedbacks(false);
      });

    // بارگذاری آمار
    Promise.all([
      getFraudCasesCount(accessToken),
      getFraudCasesWithFeedbackCountByUser(accessToken)
    ])
      .then(([totalRes, feedbackRes]) => {
        setTotalCasesCount(totalRes.count);
        setTotalFeedbackCount(feedbackRes.totalCount);
        setCasesWithFeedbackCount(feedbackRes.count);
      })
      .catch(() => {
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  }, [accessToken]);

  // بارگذاری وضعیت شغل‌ها و به‌روزرسانی دوره‌ای
  useEffect(() => {
    if (!isAdmin && !isSupervisor) return;

    const fetchJobStatus = () => {
      jobApi
        .getStatus(accessToken)
        .then((data) => {
          setJobStatus(data);
        })
        .catch(() => {
        })
        .finally(() => {
          setIsLoadingJobs(false);
        });
    };

    fetchJobStatus();

    jobPollRef.current = setInterval(fetchJobStatus, 3000);

    return () => {
      if (jobPollRef.current) {
        clearInterval(jobPollRef.current);
      }
    };
  }, [accessToken, isAdmin, isSupervisor]);

  // اگر هیچ شغلی در حال اجرا نباشد، فاصله پولینگ را کاهش بده
  useEffect(() => {
    if ((!isAdmin && !isSupervisor) || !jobStatus) return;

    const anyRunning =
      jobStatus.fraudSync.isRunning || jobStatus.claimSync.isRunning;

    if (jobPollRef.current) {
      clearInterval(jobPollRef.current);
    }

    const interval = anyRunning ? 3000 : 10000;
    jobPollRef.current = setInterval(() => {
      jobApi
        .getStatus(accessToken)
        .then(setJobStatus)
        .catch(() => {});
    }, interval);

    return () => {
      if (jobPollRef.current) {
        clearInterval(jobPollRef.current);
      }
    };
  }, [accessToken, isAdmin, isSupervisor, jobStatus]);

  const editingFeedback = useMemo(
    () => feedbacks.find((item) => item.id === editingFeedbackId) ?? null,
    [editingFeedbackId, feedbacks],
  );

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setFormMode(null);
    setEditingFeedbackId(null);
    setTitle("");
  };

  const openCreateForm = () => {
    resetMessages();
    setFormMode("create");
    setEditingFeedbackId(null);
    setTitle("");
  };

  const openEditForm = (feedback: Feedback) => {
    resetMessages();
    setFormMode("edit");
    setEditingFeedbackId(feedback.id);
    setTitle(feedback.title);
  };

  const handleCreate = async () => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setErrorMessage("عنوان بازخورد الزامی است.");
      return;
    }

    try {
      setIsSubmitting(true);
      resetMessages();

      const createdFeedback = await feedbackApi.create(
        { title: normalizedTitle },
        accessToken,
      );

      setFeedbacks((current) => [createdFeedback, ...current]);
      setSuccessMessage("بازخورد جدید با موفقیت ایجاد شد.");
      resetForm();
    } catch {
      setErrorMessage("ایجاد بازخورد با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    const normalizedTitle = title.trim();

    if (!editingFeedbackId) {
      setErrorMessage("بازخوردی برای ویرایش انتخاب نشده است.");
      return;
    }

    if (!normalizedTitle) {
      setErrorMessage("عنوان بازخورد الزامی است.");
      return;
    }

    try {
      setIsSubmitting(true);
      resetMessages();

      const updatedFeedback = await feedbackApi.update(
        editingFeedbackId,
        { title: normalizedTitle },
        accessToken,
      );

      setFeedbacks((current) =>
        current.map((item) =>
          item.id === updatedFeedback.id ? updatedFeedback : item,
        ),
      );

      setSuccessMessage("بازخورد با موفقیت بروزرسانی شد.");
      resetForm();
    } catch {
      setErrorMessage("ویرایش بازخورد با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (feedback: Feedback) => {
    const isConfirmed = window.confirm(
      `آیا از حذف بازخورد «${feedback.title}» مطمئن هستید؟`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setActiveDeleteId(feedback.id);
      resetMessages();

      await feedbackApi.remove(feedback.id, accessToken);

      setFeedbacks((current) =>
        current.filter((item) => item.id !== feedback.id),
      );

      if (editingFeedbackId === feedback.id) {
        resetForm();
      }

      setSuccessMessage("بازخورد با موفقیت حذف شد.");
    } catch {
      setErrorMessage("حذف بازخورد با خطا مواجه شد.");
    } finally {
      setActiveDeleteId(null);
    }
  };

  const handleSubmit = async () => {
    if (formMode === "edit") {
      await handleUpdate();
      return;
    }

    await handleCreate();
  };

  const handleJobToggle = async (type: "fraudSync" | "claimSync") => {
    if (!jobStatus) return;

    const isRunning =
      type === "fraudSync"
        ? jobStatus.fraudSync.isRunning
        : jobStatus.claimSync.isRunning;

    setJobActionLoading(type);
    try {
      if (isRunning) {
        await jobApi.stopJob(type, accessToken);
      } else {
        await jobApi.startJob(type, accessToken);
      }
      const updated = await jobApi.getStatus(accessToken);
      setJobStatus(updated);
    } catch {
      // Error is handled by setting jobActionLoading to null in finally
    } finally {
      setJobActionLoading(null);
    }
  };

  return (
    <section className="profile-section-card home-overview-card">
      <div className="home-overview-header">
        <div>
          <span>خانه</span>
          <h2>سامانه هوشمند پایش و بررسی موارد مشکوک</h2>
        </div>
        <img
          className="home-overview-logo"
          src="/didi/Robot-BTL-Stand.svg"
          alt="ربات سامانه"
        />
      </div>

      <p className="home-description">
        این پنل برای مدیریت، پایش و بررسی گزارش‌های مرتبط با موارد مشکوک در
        فرآیندهای ثبت و ارزیابی اطلاعات طراحی شده است. کاربران مجاز می‌توانند
        گزارشات ثبت‌شده را مشاهده کرده، وضعیت پرونده‌ها را بررسی کنند و داده‌های
        مورد نیاز را از طریق فایل اکسل بارگذاری کنند.
      </p>

      {/* بخش آمار بازطراحی شده با ۳ کارت مختلف */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <span className="stat-label">تعداد کل موارد مشکوک</span>
          <span className="stat-value">
            {isLoadingStats || totalCasesCount === null ? "..." : totalCasesCount}
          </span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">تعداد کل بازخودر های ثبت شده در سامانه</span>
          <span className="stat-value">
            {isLoadingStats || totalFeedbackCount === null ? "..." : totalFeedbackCount}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">تعداد کل بازخودر های ثبت شده توسط شما </span>
          <span className="stat-value">
            {isLoadingStats || casesWithFeedbackCount === null ? "..." : casesWithFeedbackCount}
          </span>
        </div>
        
        <div className="stat-card" style={{ gridColumn: "span 3" }}>
          <span className="stat-label">آخرین بازخودر ثبت شده</span>
          <span className="stat-value-date">{dateLabel}</span>
        </div>
      </div>

      {(isAdmin || isSupervisor) ? (
        <div className="job-control-section">
          <div className="job-control-header">
            <div>
              <h3 className="job-control-title">مدیریت عملیات پس‌زمینه</h3>
            </div>
          </div>

          <div className="job-cards-grid">
            {renderJobCard(
              "fraudSync",
              "همگام‌سازی وضعیت پرونده‌ها از موارد مشکوک",
              jobStatus?.fraudSync,
              isLoadingJobs,
              jobActionLoading,
              handleJobToggle,
            )}
            {renderJobCard(
              "claimSync",
              "همگام‌سازی وضعیت پرونده‌ها از ادعاها",
              jobStatus?.claimSync,
              isLoadingJobs,
              jobActionLoading,
              handleJobToggle,
            )}
          </div>
        </div>
      ) : null}

      <div className="home-overview-illustration">
        <img src="/didi/download.png" alt="تصویر دانلود" />
      </div>
      
{(isAdmin || isSupervisor) ? (
        <div className="feedback-crud-section">
          <div className="feedback-crud-header">
            <div>
              <h3 className="feedback-crud-title">مدیریت نوع بازخورد ها</h3>
              <p className="feedback-crud-subtitle">
                {isAdmin
                  ? "ایجاد، ویرایش و حذف بازخوردهای ثبت‌شده"
                  : "مشاهده بازخوردهای ثبت‌شده و تعداد استفاده"}
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                className="feedback-crud-primary-button"
                onClick={openCreateForm}
                disabled={isSubmitting}
              >
                افزودن بازخورد
              </button>
            )}
          </div>

          {isAdmin && (formMode === "create" || formMode === "edit") && (
            <div className="feedback-crud-form-card">
              <div className="feedback-crud-form-header">
                <h4>
                  {formMode === "edit"
                    ? `ویرایش بازخورد${editingFeedback ? `: ${editingFeedback.title}` : ""}`
                    : "ایجاد بازخورد جدید"}
                </h4>
              </div>

              <div className="feedback-crud-form-grid">
                <label className="feedback-crud-field">
                  <span>عنوان بازخورد</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="عنوان بازخورد را وارد کنید"
                    maxLength={255}
                  />
                </label>
              </div>

              <div className="feedback-crud-form-actions">
                <button
                  type="button"
                  className="feedback-crud-primary-button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "در حال ذخیره..."
                    : formMode === "edit"
                    ? "ذخیره تغییرات"
                    : "ایجاد بازخورد"}
                </button>

                <button
                  type="button"
                  className="feedback-crud-secondary-button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {errorMessage ? (
            <div className="feedback feedback--error">{errorMessage}</div>
          ) : null}

          {successMessage ? (
            <div className="feedback feedback--success">{successMessage}</div>
          ) : null}

          <div className="feedback-crud-table-wrapper">
            <table className="feedback-crud-table">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>تعداد موارد</th>
                  <th>تاریخ ایجاد</th>
                  <th>آخرین بروزرسانی</th>
                  {isAdmin && <th>عملیات</th>}
                </tr>
              </thead>
              <tbody>
                {isLoadingFeedbacks ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="feedback-crud-empty-cell">
                      در حال بارگذاری بازخوردها...
                    </td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="feedback-crud-empty-cell">
                      هنوز هیچ بازخوردی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>{feedback.title}</td>
                      <td>{feedback.fraudCases?.length ?? 0}</td>
                      <td>{formatDate(feedback.createdAt)}</td>
                      <td>{formatDate(feedback.updatedAt)}</td>
                      {isAdmin && (
                        <td>
                          <div className="feedback-crud-row-actions">
                            <button
                              type="button"
                              className="feedback-crud-secondary-button"
                              onClick={() => openEditForm(feedback)}
                              disabled={isSubmitting}
                            >
                              ویرایش
                            </button>
                            <button
                              type="button"
                              className="feedback-crud-danger-button"
                              onClick={() => void handleDelete(feedback)}
                              disabled={activeDeleteId === feedback.id}
                            >
                              {activeDeleteId === feedback.id
                                ? "در حال حذف..."
                                : "حذف"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderJobCard(
  type: "fraudSync" | "claimSync",
  label: string,
  state: JobState | undefined,
  isLoading: boolean,
  actionLoading: string | null,
  onToggle: (type: "fraudSync" | "claimSync") => void,
) {
  if (isLoading || !state) {
    return (
      <div className="job-card">
        <span className="job-card-label">{label}</span>
        <span className="job-card-status">...</span>
      </div>
    );
  }

  const percent =
    state.total > 0 ? Math.round((state.processed / state.total) * 100) : 0;
  const isCompleted =
    !state.isRunning && state.processed > 0 && state.processed >= state.total;

  return (
    <div className="job-card">
      <div className="job-card-header">
        <span className="job-card-label">{label}</span>
        <span
          className={`job-card-status ${
            state.isRunning
              ? "job-card-status--running"
              : isCompleted
                ? "job-card-status--completed"
                : "job-card-status--idle"
          }`}
        >
          {state.isRunning
            ? "در حال اجرا"
            : isCompleted
              ? "تکمیل شد"
              : "متوقف"}
        </span>
      </div>

      <div className="job-progress-bar">
        <div
          className={`job-progress-fill ${
            state.isRunning ? "job-progress-fill--animated" : ""
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="job-card-footer">
        <span className="job-card-progress-text">
          {state.total > 0
            ? `${state.processed} از ${state.total}`
            : "بدون داده"}
        </span>

        <button
          type="button"
          className={`job-toggle-button ${
            state.isRunning ? "job-toggle-button--stop" : "job-toggle-button--start"
          }`}
          onClick={() => onToggle(type)}
          disabled={actionLoading === type}
        >
          {actionLoading === type
            ? "در حال پردازش..."
            : state.isRunning
              ? "توقف"
              : "شروع"}
        </button>
      </div>
    </div>
  );
}
