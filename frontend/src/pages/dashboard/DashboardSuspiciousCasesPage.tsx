import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeRoleId } from "../../auth/role";
import { useAuth } from "../../auth/useAuth";
import { ApiError } from "../../services/api";
import { JalaliDatePicker } from "../../components/JalaliDatePicker";
import {
  clearFraudCasesCache,
  importFraudCasesFile,
  importFraudCasesJson,
  loadFraudCasesPage,
  loadFraudCasesByType,
  loadFraudCasesByNationalId,
  resolveStoredImageUrl,
  updateFraudCaseNote,
  getFeedbacks,
  updateFraudCaseFeedback,
  type FeedbackOption,
  type FraudCaseImportType,
  loadFraudCasesByClaimIds,
  loadFraudCasesByStatus,
  loadFraudCasesByFeedbackId,
  loadFraudCasesById,
  type FraudSortField,
  type FraudSortOrder,
  exportFraudCases,
  findDuplicateMatches,
  getAllTags,
  addTagsToFraudCase,
  removeTagFromFraudCase,
  type Tag,
  getFraudCasesCount,
  getFraudCasesCountByType,
  getFraudCasesCountByNationalId,
  getFraudCasesCountByClaimIds,
  getFraudCasesCountByStatus,
  getFraudCasesCountByFeedbackId,
  getFraudCasesCountById,
} from "../../services/fraudCasesService";
import type { FraudCase, FraudCaseColumn, FraudCaseFeedback } from "./dashboard.types";
import { toEnglishDigits } from "../../utils/digits";
import moment from "moment-jalaali";

const ADMIN_ROLE_ID = 0;
const FRAUD_CASES_PAGE_SIZE = 15;

const fraudCaseImportOptions: Array<{
  value: FraudCaseImportType;
  label: string;
}> = [
  { value: "duplicates", label: "جفت تکراری" },
  { value: "case-details", label: "جزئیات جفت پرونده" },
  { value: "case-more-details", label: "جزئیات تک پرونده (JSON)" },
];

const fraudCaseExportDateFieldOptions = [
  { value: "createdAt", label: "تاریخ ایجاد" },
  { value: "updatedAt", label: "آخرین بروزرسانی" },
  { value: "registrationDateCase1", label: "تاریخ ثبت پرونده اول" },
  { value: "registrationDateCase2", label: "تاریخ ثبت پرونده دوم" },
] as const;

// اضافه شدن ستون شناسه به ابتدای لیست ستون‌ها
const fraudCaseColumns: FraudCaseColumn[] = [
  { key: "id", label: "شناسه" },
  { key: "feedback", label: "فیدبک" },
  { key: "tags", label: "تگ‌ها" },
  { key: "actions", label: "عملیات" },
  { key: "suspiciousCaseType", label: "نوع مورد مشکوک" },
  { key: "case1Id", label: "شناسه پرونده اول" },
  { key: "case1NationalCode", label: "کد ملی پرونده اول" },
  { key: "case1Condition", label: "وضعیت پرونده اول" },
  { key: "registrationDateCase1", label: "تاریخ ثبت پرونده اول" },
  { key: "case2Id", label: "شناسه پرونده دوم" },
  { key: "case2NationalCode", label: "کد ملی پرونده دوم" },
  { key: "case2Condition", label: "وضعیت پرونده دوم" },
  { key: "registrationDateCase2", label: "تاریخ ثبت پرونده دوم" },
  { key: "additionalNote", label: "یادداشت اضافی" },
  { key: "createdAt", label: "تاریخ ایجاد" },
  { key: "updatedAt", label: "آخرین بروزرسانی" },
];

const fraudCaseDateColumns = new Set<FraudCaseColumn["key"]>([
  "registrationDateCase1",
  "registrationDateCase2",
  "createdAt",
  "updatedAt",
]);

const fraudCaseSortableColumns = new Set<FraudSortField>([
  "createdAt",
  "updatedAt",
  "registrationDateCase1",
  "registrationDateCase2",
]);

export function DashboardSuspiciousCasesPage() {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const exportDateMenuRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] =
    useState<FraudCaseImportType>("duplicates");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [fraudCasesByPage, setFraudCasesByPage] = useState<
    Record<number, FraudCase[]>
  >({});
  const [fraudCasesLoading, setFraudCasesLoading] = useState(false);
  const [totalFraudCasePages, setTotalFraudCasePages] = useState<number | null>(
    null,
  );
  const [fraudCasesReloadToken, setFraudCasesReloadToken] = useState(0);
  const [compareCase, setCompareCase] = useState<FraudCase | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<FraudCase[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagModalCase, setTagModalCase] = useState<FraudCase | null>(null);
  const [newTagId, setNewTagId] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<FraudSortField | null>(null);
  const [sortOrder, setSortOrder] = useState<FraudSortOrder>("ASC");
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");
  const [isExportDateMenuOpen, setIsExportDateMenuOpen] = useState(false);
  const [exportDateField, setExportDateField] = useState<
    | "createdAt"
    | "updatedAt"
    | "registrationDateCase1"
    | "registrationDateCase2"
  >("createdAt");

  const [filters, setFilters] = useState({
    suspiciousCaseType: "",
    case1NationalCode: "",
    case2NationalCode: "",
    case1Id: "",
    case2Id: "",
    case1Condition: "",
    case2Condition: "",
    feedback: "",
    fraudCaseId: "",
  });

  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});
  const [totalFilteredCount, setTotalFilteredCount] = useState<number | null>(null);

  const [feedbacksList, setFeedbacksList] = useState<FeedbackOption[]>([]);
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState<number | null>(
    null,
  );

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [viewNoteModalData, setViewNoteModalData] = useState<{
    isOpen: boolean;
    content: string;
  }>({ isOpen: false, content: "" });
  const [noteTargetCase, setNoteTargetCase] = useState<FraudCase | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const currentRoleId = normalizeRoleId(session?.user.role);
  const isAdmin = currentRoleId === ADMIN_ROLE_ID;
  const accessToken = session?.tokens.accessToken;
  const importFileAccept =
    importType === "case-more-details"
      ? ".json,application/json"
      : ".xlsx,.xls";
  const importFileLabel =
    importType === "case-more-details" ? "فایل JSON" : "فایل Excel";

  function isValidImportFileType(selectedFile: File) {
    const fileName = selectedFile.name.toLowerCase();
    if (importType === "case-more-details") {
      return (
        fileName.endsWith(".json") || selectedFile.type === "application/json"
      );
    }
    return fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
  }

  useEffect(() => {
    async function fetchFeedbacksData() {
      try {
        const list = await getFeedbacks(accessToken);
        setFeedbacksList(list);
      } catch {
        // Silently fail - feedback list is optional
      }
    }
    async function fetchTagsData() {
      try {
        const list = await getAllTags(accessToken);
        setAllTags(list);
      } catch {
        // Silently fail - tags list is optional
      }
    }
    if (accessToken) {
      void fetchFeedbacksData();
      void fetchTagsData();
    }
  }, [accessToken]);

  const fetchFilterCounts = useCallback(async () => {
    if (!accessToken) return;
    const newCounts: Record<string, number> = {};

    try {
      const filterType = filters.suspiciousCaseType.trim();
      const filterNationalCode1 = filters.case1NationalCode.trim();
      const filterNationalCode2 = filters.case2NationalCode.trim();
      const filterCaseId1 = filters.case1Id.trim();
      const filterCaseId2 = filters.case2Id.trim();
      const filterCondition1 = filters.case1Condition.trim();
      const filterCondition2 = filters.case2Condition.trim();
      const filterFeedback = filters.feedback.trim();
      const filterFraudCaseId = filters.fraudCaseId.trim();

      if (filterType) {
        const res = await getFraudCasesCountByType(accessToken, filterType);
        newCounts.suspiciousCaseType = res.count;
      }

      if (filterNationalCode1 || filterNationalCode2) {
        const res = await getFraudCasesCountByNationalId(accessToken, {
          case1NationalId: filterNationalCode1 || undefined,
          case2NationalId: filterNationalCode2 || undefined,
          mode: filterNationalCode1 && filterNationalCode2 ? "both" : "any",
        });
        newCounts.case1NationalCode = res.count;
        newCounts.case2NationalCode = res.count;
      }

      if (filterCaseId1 || filterCaseId2) {
        const res = await getFraudCasesCountByClaimIds(accessToken, {
          case1Id: filterCaseId1 || undefined,
          case2Id: filterCaseId2 || undefined,
          mode: filterCaseId1 && filterCaseId2 ? "both" : "any",
        });
        newCounts.case1Id = res.count;
        newCounts.case2Id = res.count;
      }

      if (filterCondition1 || filterCondition2) {
        const res = await getFraudCasesCountByStatus(accessToken, {
          case1Status: filterCondition1 || undefined,
          case2Status: filterCondition2 || undefined,
          mode: filterCondition1 && filterCondition2 ? "both" : "any",
        });
        newCounts.case1Condition = res.count;
        newCounts.case2Condition = res.count;
      }

      if (filterFeedback) {
        const res = await getFraudCasesCountByFeedbackId(accessToken, filterFeedback);
        newCounts.feedback = res.count;
      }

      if (filterFraudCaseId) {
        const res = await getFraudCasesCountById(accessToken, Number(filterFraudCaseId));
        newCounts.fraudCaseId = res.count;
      }

      if (!filterType && !filterNationalCode1 && !filterNationalCode2 && !filterCaseId1 && !filterCaseId2 && !filterCondition1 && !filterCondition2 && !filterFeedback && !filterFraudCaseId) {
        const res = await getFraudCasesCount(accessToken);
        newCounts.total = res.count;
      }
    } catch {
      // Silently fail - filter counts are optional
    } finally {
      setFilterCounts(newCounts);
    }
  }, [accessToken, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilterCounts();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchFilterCounts]);

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (
        exportDateMenuRef.current &&
        !exportDateMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportDateMenuOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExportDateMenuOpen(false);
        setIsNoteModalOpen(false);
        setViewNoteModalData({ isOpen: false, content: "" });
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const filterType = filters.suspiciousCaseType.trim();
    const filterNationalCode1 = filters.case1NationalCode.trim();
    const filterNationalCode2 = filters.case2NationalCode.trim();

    const filterCaseId1 = filters.case1Id.trim();
    const filterCaseId2 = filters.case2Id.trim();

    const filterCondition1 = filters.case1Condition.trim();
    const filterCondition2 = filters.case2Condition.trim();

    const filterFeedback = filters.feedback.trim();
const filterFraudCaseId = filters.fraudCaseId.trim();

    const isFilteringByNationalId =
      filterNationalCode1 !== "" || filterNationalCode2 !== "";

    const isFilteringByCaseId = filterCaseId1 !== "" || filterCaseId2 !== "";

    const isFilteringByCondition =
      filterCondition1 !== "" || filterCondition2 !== "";

    const isFilteringByFeedback = filterFeedback !== "";
    const isFilteringByFraudCaseId = filterFraudCaseId !== "";

    const isFiltering =
      filterType !== "" ||
      isFilteringByNationalId ||
      isFilteringByCaseId ||
      isFilteringByCondition ||
      isFilteringByFeedback ||
      isFilteringByFraudCaseId;

    const delay = isFiltering ? 2000 : 0;

const timer = window.setTimeout(() => {
      setErrorMessage("");
      setFraudCasesLoading(true);
      const feedbackParam = filterFeedback !== "" ? filterFeedback : undefined;

      let fetchPromise;

      if (filterType !== "") {
        fetchPromise = loadFraudCasesByType(
          accessToken,
          filterType,
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
          feedbackParam,
        );
      } else if (isFilteringByNationalId) {
        fetchPromise = loadFraudCasesByNationalId(
          accessToken,
          {
            case1NationalId: filterNationalCode1 || undefined,
            case2NationalId: filterNationalCode2 || undefined,
            mode: filterNationalCode1 && filterNationalCode2 ? "both" : "any",
          },
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
          feedbackParam,
        );
      } else if (isFilteringByCaseId) {
        fetchPromise = loadFraudCasesByClaimIds(
          accessToken,
          {
            case1Id: filterCaseId1 || undefined,
            case2Id: filterCaseId2 || undefined,
            mode: filterCaseId1 && filterCaseId2 ? "both" : "any",
          },
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
          feedbackParam,
        );
      } else if (isFilteringByCondition) {
        fetchPromise = loadFraudCasesByStatus(
          accessToken,
          {
            case1Status: filterCondition1 || undefined,
            case2Status: filterCondition2 || undefined,
            mode: filterCondition1 && filterCondition2 ? "both" : "any",
          },
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
          feedbackParam,
        );
      } else if (isFilteringByFeedback) {
        fetchPromise = loadFraudCasesByFeedbackId(
          accessToken,
          filterFeedback,
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
        );
      } else if (isFilteringByFraudCaseId) {
        fetchPromise = loadFraudCasesById(
          accessToken,
          Number(filterFraudCaseId),
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
        );
      } else {
        fetchPromise = loadFraudCasesPage(
          accessToken,
          currentPage,
          FRAUD_CASES_PAGE_SIZE,
          sortBy ?? undefined,
          sortOrder,
        );
      }

      fetchPromise
        .then(({ items, meta }) => {
          if (!isActive) return;

          setFraudCasesByPage((current) => ({
            ...current,
            [currentPage]: items,
          }));

          setTotalFilteredCount(meta?.total ?? null);

          const resolvedTotalPages =
            typeof meta?.totalPages === "number"
              ? meta.totalPages
              : items.length < FRAUD_CASES_PAGE_SIZE
                ? Math.max(
                    1,
                    items.length === 0 ? currentPage - 1 : currentPage,
                  )
                : null;

          setTotalFraudCasePages(resolvedTotalPages);
        })
        .catch((error) => {
          if (!isActive) return;

          setFraudCasesByPage((current) => ({
            ...current,
            [currentPage]: [],
          }));

          setTotalFraudCasePages(1);

          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "دریافت موارد مشکوک انجام نشد.",
          );
        })
        .finally(() => {
          if (isActive) {
            setFraudCasesLoading(false);
          }
        });
    }, delay);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [
    accessToken,
    currentPage,
    fraudCasesReloadToken,
    sortBy,
    sortOrder,
    filters.suspiciousCaseType,
    filters.case1NationalCode,
    filters.case2NationalCode,
    filters.case1Id,
    filters.case2Id,
    filters.case1Condition,
    filters.case2Condition,
    filters.feedback,
    filters.fraudCaseId,
  ]);

  const filteredFraudCases = useMemo(
    () => fraudCasesByPage[currentPage] ?? [],
    [currentPage, fraudCasesByPage],
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setCurrentPage(1);
    setFraudCasesByPage({});
    setTotalFraudCasePages(null);
  }, [
    filters.suspiciousCaseType,
    filters.case1NationalCode,
    filters.case2NationalCode,
    filters.case1Id,
    filters.case2Id,
    filters.case1Condition,
    filters.case2Condition,
    filters.feedback,
    filters.fraudCaseId,
    sortBy,
    sortOrder,
  ]);

  const canGoToNextPage =
    totalFraudCasePages === null || currentPage < totalFraudCasePages;
  const canGoToPreviousPage = currentPage > 1;

  async function handleFeedbackChange(caseId: number, feedbackId: string) {
    setIsUpdatingFeedback(caseId);
    setErrorMessage("");
    setMessage("");

    const targetFeedbackId = feedbackId === "" ? null : feedbackId;

    try {
      await updateFraudCaseFeedback(caseId, targetFeedbackId, accessToken);
      const selectedFeedback =
        feedbacksList.find((f) => f.id === feedbackId) || null;

      setFraudCasesByPage((current) => {
        const pageItems = current[currentPage] ?? [];
        const updatedItems = pageItems.map((item) => {
          if (item.id === caseId) {
            return {
              ...item,
              feedback: selectedFeedback as FraudCaseFeedback,
            };
          }
          return item;
        });
        return {
          ...current,
          [currentPage]: updatedItems,
        };
      });

      setMessage("فیدبک با موفقیت به روز رسانی شد.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "ثبت فیدبک با خطا مواجه شد.",
      );
    } finally {
      setIsUpdatingFeedback(null);
    }
  }

  const getSelectedFeedbackId = (fraudCase: FraudCase): string => {
    const feedback = fraudCase.feedback;
    if (feedback && typeof feedback === "object" && "id" in feedback) {
      return feedback.id || "";
    }
    return "";
  };

  function handleSortChange(field: FraudSortField) {
    if (sortBy === field) {
      setSortOrder((current) => (current === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  }

  function renderCellValue(
    key: FraudCaseColumn["key"],
    value: unknown,
    fraudCaseId?: number,
    fraudCase?: FraudCase,
  ) {
    if (key === "feedback" && fraudCase) {
      return (
        <select
          style={{
            padding: "0px 0px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            fontFamily: "inherit",
            cursor: "pointer",
            width: "100%",
            minWidth: "140px",
          }}
          value={getSelectedFeedbackId(fraudCase)}
          disabled={isUpdatingFeedback === fraudCase.id}
          onChange={(e) => {
            e.stopPropagation();
            handleFeedbackChange(fraudCase.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">بدون فیدبک</option>
          {feedbacksList.map((feedback) => (
            <option key={feedback.id} value={feedback.id}>
              {feedback.title}
            </option>
          ))}
        </select>
      );
    }

    if (key === "tags" && fraudCase) {
      return (
        <div className="tag-cell" style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
          {renderTagsForCase(fraudCase)}
          <TagAdder
            fraudCaseId={fraudCase.id}
            currentTags={fraudCase.tags ?? []}
            allTags={allTags}
            onAddTag={handleAddTagToCase}
          />
        </div>
      );
    }

    if (key === "actions" && fraudCase) {
      return (
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <button
            className="fraud-compare-button"
            type="button"
            onClick={() => handleCompareClick(fraudCase)}
          >
            مقایسه
          </button>
          <button
            className="fraud-compare-button"
            style={{ backgroundColor: "#2563eb" }}
            type="button"
            onClick={() => openNoteModal(fraudCase)}
          >
            یادداشت
          </button>
        </div>
      );
    }

    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (fraudCaseDateColumns.has(key)) {
      const formattedDate = formatJalaliDate(value);
      if (formattedDate) return formattedDate;
    }

    if (key === "additionalNote") {
      const noteStr = String(value);
      if (fraudCaseId === undefined) {
        return toEnglishDigits(noteStr);
      }
      return (
        <div
          onDoubleClick={() =>
            setViewNoteModalData({ isOpen: true, content: noteStr })
          }
          title="برای مشاهده کامل دابل کلیک کنید"
          style={{
            cursor: "pointer",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            userSelect: "none",
          }}
        >
          {toEnglishDigits(noteStr)}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return value.length ? toEnglishDigits(value.join("، ")) : "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return toEnglishDigits(String(value));
  }

  const handleExportExcel = async () => {
    const fromTime = exportFromDate
      ? parseGregorianMoment(exportFromDate)
      : null;
    const toTime = exportToDate ? parseGregorianMoment(exportToDate) : null;

    if (fromTime && toTime && fromTime.isAfter(toTime)) {
      setErrorMessage("تاریخ شروع باید قبل از تاریخ پایان باشد.");
      setIsExportDateMenuOpen(true);
      return;
    }

    setErrorMessage("");
    setMessage("در حال آماده‌سازی فایل خروجی...");

    try {
      // Use the token from your session state
      const token = accessToken;

      const result = await exportFraudCases(token, {
        dateField: exportDateField,
        fromDate: exportFromDate || undefined,
        toDate: exportToDate || undefined,
        // Pass active filters so the Excel matches what you see on screen
        suspiciousCaseType: filters.suspiciousCaseType.trim() || undefined,
        case1NationalId: filters.case1NationalCode.trim() || undefined,
        case2NationalId: filters.case2NationalCode.trim() || undefined,
        case1Id: filters.case1Id.trim() || undefined,
        case2Id: filters.case2Id.trim() || undefined,
        case1Status: filters.case1Condition.trim() || undefined,
        case2Status: filters.case2Condition.trim() || undefined,
        feedbackId: filters.feedback.trim() || undefined,
        fraudCaseId: filters.fraudCaseId.trim() || undefined,
      });

      // Trigger Download using the blob and filename from apiGetFile
      const url = window.URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;

      // result.fileName comes from the backend Content-Disposition header
      // It will be .xlsx for small data and .zip for large data automatically
      anchor.download = result.fileName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setMessage("فایل با موفقیت دریافت شد.");
      setIsExportDateMenuOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "دریافت خروجی با خطا مواجه شد. لطفا بازه زمانی کوتاه‌تری انتخاب کنید.",
      );
      setMessage("");
    }
  };

  async function handleImportFile(selectedFile: File) {
    if (!isAdmin) {
      setErrorMessage("فقط ادمین می‌تواند فایل وارد کند.");
      return;
    }

    if (!isValidImportFileType(selectedFile)) {
      setErrorMessage(
        importType === "case-more-details"
          ? "برای جزئیات تک پرونده باید فایل JSON انتخاب کنید."
          : "برای این نوع واردسازی باید فایل Excel انتخاب کنید.",
      );
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setMessage("");
    setErrorMessage("");

    const progressInterval = setInterval(() => {
      setImportProgress((prev) => (prev === null || prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      if (importType === "case-more-details") {
        await importFraudCasesJson(
          selectedFile,
          session?.tokens.accessToken,
          "case-more-details",
        );
      } else {
        await importFraudCasesFile(
          selectedFile,
          session?.tokens.accessToken,
          importType,
        );
      }

      clearInterval(progressInterval);
      setImportProgress(100);

      setMessage("فایل با موفقیت ارسال و پردازش شد.");
      clearFraudCasesCache();
      setFraudCasesByPage({});
      setTotalFraudCasePages(null);
      setCurrentPage(1);
      setFraudCasesReloadToken((current) => current + 1);
      setFile(null);
    } catch (error) {
      clearInterval(progressInterval);
      setErrorMessage(
        error instanceof ApiError ? error.message : "ارسال فایل انجام نشد.",
      );
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(null), 1000);
    }
  }

  function openNoteModal(fraudCase: FraudCase) {
    setNoteTargetCase(fraudCase);
    setNoteText(fraudCase.additionalNote ?? "");
    setIsNoteModalOpen(true);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSaveNote() {
    if (!noteTargetCase) return;

    setIsSavingNote(true);
    setErrorMessage("");
    setMessage("");

    try {
      await updateFraudCaseNote(
        noteTargetCase.id,
        noteText,
        session?.tokens.accessToken,
      );

      setFraudCasesByPage((current) => {
        const pageItems = current[currentPage] ?? [];
        const updatedItems = pageItems.map((item) => {
          if (item.id === noteTargetCase.id) {
            return { ...item, additionalNote: noteText };
          }
          return item;
        });
        return {
          ...current,
          [currentPage]: updatedItems,
        };
      });

      setMessage("یادداشت با موفقیت ثبت شد.");
      setIsNoteModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "ثبت یادداشت با خطا مواجه شد.",
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleCompareClick(fraudCase: FraudCase) {
    setCompareCase(fraudCase);
    setIsLoadingMatches(true);
    setDuplicateMatches([]);
    setErrorMessage("");

    try {
      const response = await findDuplicateMatches(fraudCase.id, accessToken);
      setDuplicateMatches(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "یافتن موارد هم‌تکرار با خطا مواجه شد.",
      );
    } finally {
      setIsLoadingMatches(false);
    }
  }

  const hasActiveFilters = Boolean(
    filters.suspiciousCaseType.trim() ||
    filters.case1NationalCode.trim() ||
    filters.case2NationalCode.trim() ||
    filters.case1Id.trim() ||
    filters.case2Id.trim() ||
    filters.case1Condition.trim() ||
    filters.case2Condition.trim() ||
    filters.feedback.trim(),
  );

  const tableColumnCount = fraudCaseColumns.length + 1;

  const renderTagsForCase = (fraudCase: FraudCase) => {
    if (!fraudCase.tags || fraudCase.tags.length === 0) {
      return (
        <span className="tag-empty" style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>
          بدون تگ
        </span>
      );
    }
    return (
      <div className="tag-container" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {fraudCase.tags.map((tag) => (
          <span
            key={tag.id}
            className="tag-badge"
            style={{
              backgroundColor: tag.color,
              borderColor: tag.color,
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "20px",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: `0 2px 4px ${tag.color}40`,
              transition: "all 0.2s ease",
              fontWeight: 500,
              border: "1px solid transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTag(fraudCase.id, tag.id);
            }}
            title="کلیک برای حذف تگ"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 4px 8px ${tag.color}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 2px 4px ${tag.color}40`;
            }}
          >
            {tag.name}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ opacity: 0.7, flexShrink: 0 }}
            >
              <path
                d="M3 3L9 9M9 3L3 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ))}
      </div>
    );
  };

  const TagAdder = ({
    fraudCaseId,
    currentTags,
    allTags,
    onAddTag,
  }: {
    fraudCaseId: number;
    currentTags: Array<{ id: string }>;
    allTags: Array<{ id: string; name: string; color: string }>;
    onAddTag: (fraudCaseId: number, tagId: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const availableTags = allTags.filter((tag) => !currentTags.some((t) => t.id === tag.id));

    if (availableTags.length === 0) return null;

    return (
      <div className="tag-adder" style={{ position: "relative" }}>
        <button
          type="button"
          className="tag-adder-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={{
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px dashed #d1d5db",
            fontSize: "12px",
            fontFamily: "inherit",
            cursor: "pointer",
            backgroundColor: "#f9fafb",
            color: "#6b7280",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.borderColor = "#9ca3af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span>
          <span>تگ</span>
        </button>

        {isOpen && (
          <div
            className="tag-adder-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "4px",
              zIndex: 100,
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              minWidth: "160px",
              overflow: "hidden",
            }}
          >
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTag(fraudCaseId, tag.id);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#1f2937",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  textAlign: "right",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tag.color + "15";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: tag.color,
                    flexShrink: 0,
                  }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const openTagModal = (fraudCase: FraudCase) => {
    setTagModalCase(fraudCase);
  };

  const handleRemoveTag = async (fraudCaseId: number, tagId: string) => {
    setIsAddingTag(true);
    setErrorMessage("");
    try {
      await removeTagFromFraudCase(fraudCaseId, tagId, accessToken);
      setFraudCasesByPage((current) => {
        const pageItems = current[currentPage] ?? [];
        const updatedItems = pageItems.map((item) => {
          if (item.id === fraudCaseId) {
            return {
              ...item,
              tags: item.tags?.filter((t) => t.id !== tagId) ?? [],
            };
          }
          return item;
        });
        return { ...current, [currentPage]: updatedItems };
      });
      setTagModalCase((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags?.filter((t) => t.id !== tagId) ?? [],
            }
          : null,
      );
      setMessage("تگ با موفقیت حذف شد.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "حذف تگ با خطا مواجه شد.",
      );
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleAddTagToCase = async (fraudCaseId: number, tagId: string) => {
    setIsAddingTag(true);
    setErrorMessage("");
    try {
      await addTagsToFraudCase(fraudCaseId, [tagId], accessToken);
      const selectedTag = allTags.find((t) => t.id === tagId);
      if (selectedTag) {
        setFraudCasesByPage((current) => {
          const pageItems = current[currentPage] ?? [];
          const updatedItems = pageItems.map((item) => {
            if (item.id === fraudCaseId) {
              return {
                ...item,
                tags: [...(item.tags ?? []), selectedTag],
              };
            }
            return item;
          });
          return { ...current, [currentPage]: updatedItems };
        });
        setTagModalCase((prev) =>
          prev && prev.id === fraudCaseId
            ? { ...prev, tags: [...(prev.tags ?? []), selectedTag] }
            : prev,
        );
        setMessage("تگ با موفقیت اضافه شد.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "افزودن تگ با خطا مواجه شد.",
      );
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagId || !tagModalCase) return;
    setIsAddingTag(true);
    setErrorMessage("");
    try {
      await addTagsToFraudCase(tagModalCase.id, [newTagId], accessToken);
      const selectedTag = allTags.find((t) => t.id === newTagId);
      if (selectedTag) {
        setFraudCasesByPage((current) => {
          const pageItems = current[currentPage] ?? [];
          const updatedItems = pageItems.map((item) => {
            if (item.id === tagModalCase.id) {
              return {
                ...item,
                tags: [...(item.tags ?? []), selectedTag],
              };
            }
            return item;
          });
          return { ...current, [currentPage]: updatedItems };
        });
        setTagModalCase((prev) =>
          prev ? { ...prev, tags: [...(prev.tags ?? []), selectedTag] } : null,
        );
        setMessage("تگ با موفقیت اضافه شد.");
        setNewTagId("");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "افزودن تگ با خطا مواجه شد.",
      );
    } finally {
      setIsAddingTag(false);
    }
  };

  return (
    <section className="profile-section-card fraud-cases-card">
      <div className="fraud-cases-header">
        <div>
          <span>بررسی موارد مشکوک</span>
          <h2>جدول موارد مشکوک</h2>
          {message ? (
            <p className="fraud-cases-header__message">{message}</p>
          ) : null}
          {errorMessage ? (
            <p className="fraud-cases-header__message fraud-cases-header__message--error">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="fraud-cases-header__actions">
          <div className="fraud-cases-header__action-group fraud-cases-header__action-group--export">
            <div className="fraud-cases-export-actions">
              <button
                className="submit-button fraud-cases-export-actions__menu-button"
                type="button"
                aria-expanded={isExportDateMenuOpen}
                aria-controls="fraud-cases-export-date-menu"
                onClick={() => setIsExportDateMenuOpen((current) => !current)}
              >
                فیلتر خروجی
              </button>

              <button
                className="submit-button"
                type="button"
                onClick={handleExportExcel}
              >
                دریافت Excel
              </button>

              {isExportDateMenuOpen ? (
                <div
                  ref={exportDateMenuRef}
                  id="fraud-cases-export-date-menu"
                  className="fraud-cases-export-menu"
                >
                  <div className="fraud-cases-date-filters">
                    <label className="fraud-cases-date-filter">
                      <span>از تاریخ</span>
                      <JalaliDatePicker
                        value={exportFromDate}
                        onChange={setExportFromDate}
                        placeholder="انتخاب تاریخ"
                      />
                    </label>
                    <label className="fraud-cases-date-filter">
                      <span>تا تاریخ</span>
                      <JalaliDatePicker
                        value={exportToDate}
                        onChange={setExportToDate}
                        placeholder="انتخاب تاریخ"
                      />
                    </label>
                    <label className="fraud-cases-date-filter">
                      <span>تاریخ مبنا</span>
                      <select
                        value={exportDateField}
                        onChange={(event) =>
                          setExportDateField(
                            event.target.value as
                              | "createdAt"
                              | "updatedAt"
                              | "registrationDateCase1"
                              | "registrationDateCase2",
                          )
                        }
                      >
                        {fraudCaseExportDateFieldOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {isAdmin ? (
            <div className="fraud-cases-header__action-group fraud-cases-header__action-group--import">
              <div className="fraud-cases-import-controls">
                <label className="fraud-cases-import-select">
                  <span>نوع فایل</span>
                  <select
                    value={importType}
                    onChange={(event) =>
                      setImportType(event.target.value as FraudCaseImportType)
                    }
                  >
                    {fraudCaseImportOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="submit-button submit-button--secondary"
                  type="button"
                  disabled={isImporting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isImporting ? "در حال ارسال..." : "انتخاب و ارسال فایل"}
                </button>
              </div>

              <input
                ref={fileInputRef}
                className="import-form__input import-form__input--hidden"
                type="file"
                accept={importFileAccept}
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  setMessage("");
                  setErrorMessage("");
                  setFile(selectedFile);

                  if (selectedFile) {
                    void handleImportFile(selectedFile);
                  }

                  event.currentTarget.value = "";
                }}
              />

              {file ? (
                <p className="import-file-name">
                  {importFileLabel} انتخاب‌شده: {toEnglishDigits(file.name)}
                </p>
              ) : null}

              {importProgress !== null && (
                <div className="import-progress-wrapper">
                  <div className="import-progress-bar">
                    <div
                      className={`import-progress-fill ${isImporting ? 'import-progress-fill--animated' : ''}`}
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <span className="import-progress-text">
                    {isImporting ? `در حال پردازش... ${importProgress}%` : 'پردازش کامل شد'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="import-file-name">
              ورود فایل فقط برای ادمین فعال است.
            </p>
          )}
        </div>
      </div>

<div className="fraud-cases-filters">
        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.suspiciousCaseType}
            aria-label="نوع مورد مشکوک"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                suspiciousCaseType: event.target.value,
              }))
            }
            placeholder="نوع مورد مشکوک"
          />
          {filterCounts.suspiciousCaseType !== undefined && (
            <span className="filter-count">{filterCounts.suspiciousCaseType}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.case1NationalCode}
            aria-label="کد ملی پرونده اول"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case1NationalCode: event.target.value,
              }))
            }
            placeholder="کد ملی پرونده اول"
          />
          {filterCounts.case1NationalCode !== undefined && (
            <span className="filter-count">{filterCounts.case1NationalCode}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.case2NationalCode}
            aria-label="کد ملی پرونده دوم"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case2NationalCode: event.target.value,
              }))
            }
            placeholder="کد ملی پرونده دوم"
          />
          {filterCounts.case2NationalCode !== undefined && (
            <span className="filter-count">{filterCounts.case2NationalCode}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.case1Id}
            aria-label="کد پرونده اول"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case1Id: event.target.value,
              }))
            }
            placeholder="کد پرونده اول"
          />
          {filterCounts.case1Id !== undefined && (
            <span className="filter-count">{filterCounts.case1Id}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.case2Id}
            aria-label="کد پرونده دوم"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case2Id: event.target.value,
              }))
            }
            placeholder="کد پرونده دوم"
          />
          {filterCounts.case2Id !== undefined && (
            <span className="filter-count">{filterCounts.case2Id}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <input
            type="search"
            value={filters.fraudCaseId}
            aria-label="شناسه مورد مشکوک"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                fraudCaseId: event.target.value,
              }))
            }
            placeholder="شناسه مورد مشکوک"
          />
          {filterCounts.fraudCaseId !== undefined && (
            <span className="filter-count">{filterCounts.fraudCaseId}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <select
            value={filters.case1Condition}
            aria-label="وضعیت پرونده اول"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case1Condition: event.target.value,
              }))
            }
          >
            <option value="">همه وضعیت ها (پرونده اول)</option>
            <option value="عودت">عودت (پرونده اول)</option>
            <option value="ابطال">ابطال (پرونده اول)</option>
            <option value="تاييد حواله">تایید حواله (پرونده اول)</option>
          </select>
          {filterCounts.case1Condition !== undefined && (
            <span className="filter-count">{filterCounts.case1Condition}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <select
            value={filters.case2Condition}
            aria-label="وضعیت پرونده دوم"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                case2Condition: event.target.value,
              }))
            }
          >
            <option value="">همه وضعیت ها (پرونده دوم)</option>
            <option value="عودت">عودت (پرونده دوم)</option>
            <option value="ابطال">ابطال (پرونده دوم)</option>
            <option value="تاييد حواله">تایید حواله (پرونده دوم)</option>
          </select>
          {filterCounts.case2Condition !== undefined && (
            <span className="filter-count">{filterCounts.case2Condition}</span>
          )}
        </label>

        <label className="fraud-cases-filter">
          <select
            value={filters.feedback}
            aria-label="فیلتر فیدبک"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                feedback: event.target.value,
              }))
            }
          >
            <option value="">همه فیدبک‌ها</option>
            <option value="null">بدون فیدبک</option>

            {feedbacksList.map((feedback) => (
              <option key={feedback.id} value={feedback.id}>
                {feedback.title}
              </option>
            ))}
          </select>
{filterCounts.feedback !== undefined && (
            <span className="filter-count">{filterCounts.feedback}</span>
          )}
        </label>
      </div>

      {fraudCasesLoading ? (
        <div className="fraud-cases-state">در حال دریافت موارد مشکوک...</div>
      ) : null}

      <div className="fraud-cases-table-wrap">
        <table className="fraud-cases-table">
          <thead>
            <tr>
              {fraudCaseColumns.map((column) => {
                const isSortable = fraudCaseSortableColumns.has(
                  column.key as FraudSortField,
                );
                const isActive = sortBy === (column.key as FraudSortField);

                return (
                  <th scope="col" key={column.key}>
                    {isSortable ? (
                      <button
                        type="button"
                        aria-label={`مرتب‌سازی بر اساس ${column.label}`}
                        onClick={() =>
                          handleSortChange(column.key as FraudSortField)
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          border: "none",
                          background: "transparent",
                          padding: "0",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          fontWeight: "inherit",
                          color: isActive ? "#04626d" : "inherit",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {column.label}
                        <span aria-hidden="true">
                          {isActive ? (sortOrder === "ASC" ? "▲" : "▼") : "⇅"}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
<tbody>
            {filteredFraudCases.length ? (
              filteredFraudCases.map((fraudCase) => (
                <tr key={fraudCase.id}>
                  {fraudCaseColumns.map((column) => (
                    <td key={column.key}>
                      {renderCellValue(
                        column.key,
                        fraudCase[column.key as keyof FraudCase],
                        fraudCase.id,
                        fraudCase,
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : fraudCasesLoading ? null : (
              <tr>
                <td colSpan={tableColumnCount}>
                  {errorMessage
                    ? "داده‌ای برای نمایش در دسترس نیست."
                    : hasActiveFilters
                    ? "هیچ موردی با فیلترهای فعلی پیدا نشد."
                    : "هنوز مورد مشکوکی برای نمایش ثبت نشده است."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalFraudCasePages !== null && totalFraudCasePages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="submit-button submit-button--secondary"
            style={{ padding: "6px 12px", minWidth: "auto" }}
            type="button"
            disabled={!canGoToPreviousPage || fraudCasesLoading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            صفحه قبلی
          </button>

          <span
            style={{ fontSize: "16px", fontWeight: "bold", color: "#087f8d" }}
          >
            صفحه {toEnglishDigits(String(currentPage))} از{" "}
            {toEnglishDigits(String(totalFraudCasePages))}
          </span>

          {totalFilteredCount !== null && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#11a4b8",
                background: "#e8f8f8",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              کل: {toEnglishDigits(String(totalFilteredCount))} مورد
            </span>
          )}

          <button
            className="submit-button submit-button--secondary"
            style={{ padding: "6px 12px", minWidth: "auto" }}
            type="button"
            disabled={!canGoToNextPage || fraudCasesLoading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            صفحه بعدی
          </button>
        </div>
      )}

      {/* مودال مشاهده یادداشت */}
      {viewNoteModalData.isOpen && (
        <div className="fraud-compare-modal" role="dialog" aria-modal="true">
          <button
            className="fraud-compare-modal__backdrop"
            type="button"
            aria-label="بستن"
            onClick={() => setViewNoteModalData({ isOpen: false, content: "" })}
          />
          <div
            className="fraud-compare-modal__dialog"
            style={{ maxWidth: "500px" }}
          >
            <div className="fraud-compare-modal__header">
              <h3>یادداشت اضافی</h3>
              <button
                className="fraud-compare-modal__close"
                type="button"
                onClick={() =>
                  setViewNoteModalData({ isOpen: false, content: "" })
                }
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {viewNoteModalData.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش یادداشت */}
      {isNoteModalOpen && noteTargetCase ? (
        <div className="fraud-compare-modal" role="dialog" aria-modal="true">
          <button
            className="fraud-compare-modal__backdrop"
            type="button"
            aria-label="بستن پنجره یادداشت"
            onClick={() => setIsNoteModalOpen(false)}
          />
          <div
            className="fraud-compare-modal__dialog"
            style={{ maxWidth: "500px" }}
          >
            <div className="fraud-compare-modal__header">
              <div>
                <span>ثبت یادداشت اضافی</span>
                <h3>پرونده {toEnglishDigits(String(noteTargetCase.id))}</h3>
              </div>
              <button
                className="fraud-compare-modal__close"
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                aria-label="بستن"
              >
                ×
              </button>
            </div>

            <div style={{ padding: "16px 0" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                متن یادداشت
              </label>
              <textarea
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="توضیحات یا یادداشت خود را در مورد این پرونده بنویسید..."
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                className="submit-button"
                type="button"
                onClick={handleSaveNote}
                disabled={isSavingNote}
              >
                {isSavingNote ? "در حال ذخیره..." : "ذخیره یادداشت"}
              </button>
              <button
                className="submit-button submit-button--secondary"
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                disabled={isSavingNote}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* مودال مقایسه تصاویر */}
      {compareCase ? (
        <div className="fraud-compare-modal" role="dialog" aria-modal="true">
          <button
            className="fraud-compare-modal__backdrop"
            type="button"
            aria-label="بستن پنجره مقایسه"
            onClick={() => {
              setCompareCase(null);
              setDuplicateMatches([]);
            }}
          />
          <div className="fraud-compare-modal__dialog fraud-compare-modal__dialog--enhanced">
            <div className="fraud-compare-modal__header">
              <div>
                <span>مقایسه موارد مشکوک</span>
                <h3>پرونده {toEnglishDigits(String(compareCase.id))}</h3>
              </div>
              <button
                className="fraud-compare-modal__close"
                type="button"
                onClick={() => {
                  setCompareCase(null);
                  setDuplicateMatches([]);
                }}
                aria-label="بستن"
              >
                ×
              </button>
            </div>

            <div className="fraud-compare-body">
              {/* Original comparison - Case 1 vs Case 2 */}
              <div className="fraud-compare-section">
                <h4 className="fraud-compare-section__title">
                  مقایسه اصلی: پرونده اول vs پرونده دوم
                </h4>
                <div className="fraud-compare-columns">
                  <div className="fraud-compare-column">
                    <h5>
                      پرونده اول ({toEnglishDigits(String(compareCase.case1Id))}
                      )
                    </h5>
                    {renderEnhancedCompareImageGroup(
                      "case1",
                      parseImageList(compareCase.case1Images),
                      compareCase.duplicateImagesCase1,
                    )}
                  </div>
                  <div className="fraud-compare-column">
                    <h5>
                      پرونده دوم ({toEnglishDigits(String(compareCase.case2Id))}
                      )
                    </h5>
                    {renderEnhancedCompareImageGroup(
                      "case2",
                      parseImageList(compareCase.case2Images),
                      compareCase.duplicateImagesCase2,
                    )}
                  </div>
                </div>
              </div>

              {/* Duplicate matches from other fraud cases */}
              {duplicateMatches.length > 0 && (
                <div className="fraud-compare-section fraud-compare-section--matches">
                  <h4 className="fraud-compare-section__title">
                    موارد هم‌تکرار در سایر پرونده‌ها ({duplicateMatches.length})
                    {isLoadingMatches && <span className="loading-spinner" />}
                  </h4>
                  <div className="fraud-matches-list">
                    {duplicateMatches.map((matchCase) => (
                      <div key={matchCase.id} className="fraud-match-card">
                        <div className="fraud-match-card__header">
                          <div className="fraud-match-card__info">
                            <h5>
                              پرونده هم‌تکرار #
                              {toEnglishDigits(String(matchCase.id))}
                            </h5>
                            <div className="fraud-match-card__meta">
                              <span>نوع: {matchCase.suspiciousCaseType}</span>
                              <span>|</span>
                              <span>
                                مشباهت: {matchCase.similarityPercentage}%
                              </span>
                            </div>
                          </div>
                          <div className="fraud-match-card__tags" style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                            {renderTagsForCase(matchCase)}
                            <select
                              value=""
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value) {
                                  handleAddTagToCase(matchCase.id, e.target.value);
                                }
                                e.target.value = "";
                              }}
                              style={{
                                padding: "2px 6px",
                                borderRadius: "3px",
                                border: "1px solid #ccc",
                                fontSize: "11px",
                                fontFamily: "inherit",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                              }}
                            >
                              <option value="" disabled selected>+ تگ</option>
                              {allTags
                                .filter(
                                  (tag) => !matchCase.tags?.some((t) => t.id === tag.id),
                                )
                                .map((tag) => (
                                  <option key={tag.id} value={tag.id} style={{ backgroundColor: tag.color, color: "#fff" }}>
                                    {tag.name}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              className="fraud-tag-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTagModal(matchCase);
                              }}
                              title="مدیریت تگ‌ها"
                            >
                              🏷️
                            </button>
                          </div>
                        </div>
                        <div className="fraud-match-card__images">
                          <div className="fraud-compare-column">
                            <h6>
                              پرونده اول (
                              {toEnglishDigits(String(matchCase.case1Id))})
                            </h6>
                            {renderEnhancedCompareImageGroup(
                              `match-${matchCase.id}-case1`,
                              parseImageList(matchCase.case1Images),
                              matchCase.duplicateImagesCase1,
                            )}
                          </div>
                          <div className="fraud-compare-column">
                            <h6>
                              پرونده دوم (
                              {toEnglishDigits(String(matchCase.case2Id))})
                            </h6>
                            {renderEnhancedCompareImageGroup(
                              `match-${matchCase.id}-case2`,
                              parseImageList(matchCase.case2Images),
                              matchCase.duplicateImagesCase2,
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Tag Management Modal */}
      {tagModalCase && (
        <div className="fraud-compare-modal" role="dialog" aria-modal="true">
          <button
            className="fraud-compare-modal__backdrop"
            type="button"
            aria-label="بستن پنجره تگ‌ها"
            onClick={() => setTagModalCase(null)}
          />
          <div
            className="fraud-compare-modal__dialog"
            style={{ maxWidth: "600px" }}
          >
            <div className="fraud-compare-modal__header">
              <div>
                <span>مدیریت تگ‌ها</span>
                <h3>پرونده {toEnglishDigits(String(tagModalCase.id))}</h3>
              </div>
              <button
                className="fraud-compare-modal__close"
                type="button"
                onClick={() => setTagModalCase(null)}
                aria-label="بستن"
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Current tags */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>تگ‌های فعلی</h4>
                {tagModalCase.tags && tagModalCase.tags.length > 0 ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {tagModalCase.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="fraud-tag-badge"
                        style={{
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                          cursor: "default",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#666" }}>هیچ تگی اضافه نشده است</p>
                )}
              </div>

              {/* Add tag form */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "12px" }}>افزودن تگ</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select
                    value={newTagId}
                    onChange={(e) => setNewTagId(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">انتخاب تگ</option>
                    {allTags
                      .filter(
                        (tag) =>
                          !tagModalCase.tags?.some((t) => t.id === tag.id),
                      )
                      .map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.name} ({tag.type})
                        </option>
                      ))}
                  </select>
                  <button
                    className="submit-button"
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTagId || isAddingTag}
                  >
                    {isAddingTag ? "در حال افزودن..." : "افزودن تگ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function renderEnhancedCompareImageGroup(
  caseKey: string,
  images: string[],
  duplicateImagesValue: unknown,
) {
  const duplicateImages = parseImageList(duplicateImagesValue);
  const duplicateSet = new Set(
    duplicateImages.flatMap((image) => getComparableImageKeys(image)),
  );

  const imageMatchNumbers = new Map<string, number>();
  let matchCounter = 0;

  if (!images.length) {
    return (
      <div className="fraud-compare-empty">تصویری برای نمایش وجود ندارد.</div>
    );
  }

  return (
    <div className="fraud-compare-images" data-case={caseKey}>
      {images.map((image, index) => {
        const isDuplicate = isDuplicateImage(image, duplicateSet);
        const comparableKeys = getComparableImageKeys(image);
        let matchNumber = imageMatchNumbers.get(comparableKeys[0]);

        if (!matchNumber && isDuplicate) {
          matchCounter += 1;
          matchNumber = matchCounter;
          comparableKeys.forEach((key) =>
            imageMatchNumbers.set(key, matchNumber!),
          );
        }

        return (
          <figure
            className={`fraud-compare-image${isDuplicate ? " fraud-compare-image--duplicate" : ""}`}
            key={`${caseKey}-${image}-${index}`}
            style={{
              position: "relative",
              border:
                isDuplicate && matchNumber
                  ? `3px solid ${getMatchColor(matchNumber!)}`
                  : isDuplicate
                    ? "2px solid #f59e0b"
                    : "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: isDuplicate ? "#fffbeb" : "transparent",
            }}
          >
            {matchNumber && (
              <div
                className="fraud-image-match-badge"
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  zIndex: 10,
                  backgroundColor: getMatchColor(matchNumber),
                  color: "white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {toEnglishDigits(String(matchNumber))}
              </div>
            )}
            <img
              src={resolveStoredImageUrl(image)}
              alt={`${caseKey}-${index + 1}`}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <figcaption style={{ padding: "8px", textAlign: "center" }}>
              <span>تصویر {toEnglishDigits(String(index + 1))}</span>
              {isDuplicate && (
                <strong style={{ marginRight: "8px", color: "#f59e0b" }}>
                  تکراری
                </strong>
              )}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function getMatchColor(matchNumber: number): string {
  const colors = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ];
  return colors[(matchNumber - 1) % colors.length];
}

function formatJalaliDate(value: unknown) {
  const parsedDate = parseGregorianMoment(value);
  if (!parsedDate) {
    return "";
  }
  return toEnglishDigits(parsedDate.format("jYYYY/jMM/jDD"));
}

function parseGregorianMoment(value: unknown) {
  const dateStr = toEnglishDigits(String(value ?? "")).trim();
  if (!dateStr) {
    return null;
  }
  const formats = [
    "YYYY/M/D",
    "YYYY/MM/DD",
    "YYYY-M-D",
    "YYYY-MM-DD",
    "D/M/YYYY",
    "DD/MM/YYYY",
    "D-M-YYYY",
    "DD-MM-YYYY",
  ] as const;

  for (const format of formats) {
    const parsedDate = moment(dateStr, format, true);
    if (parsedDate.isValid()) {
      return parsedDate;
    }
  }
  const isoParsedDate = moment(dateStr, moment.ISO_8601, true);
  return isoParsedDate.isValid() ? isoParsedDate : null;
}

function parseImageList(value: unknown) {
  if (!value) {
    return [] as string[];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") {
    return [String(value).trim()].filter(Boolean);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fall through.
    }
  }
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (trimmed.includes("|")) {
    return trimmed
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [trimmed];
}

function isDuplicateImage(image: string, duplicateSet: Set<string>) {
  const comparableKeys = getComparableImageKeys(image);
  return comparableKeys.some((key) => duplicateSet.has(key));
}

function getComparableImageKeys(value: string) {
  const normalized = normalizeSearchValue(value);
  const baseName = normalized.split("/").pop() ?? normalized;
  return Array.from(new Set([normalized, baseName].filter(Boolean)));
}

function normalizeSearchValue(value: unknown) {
  return toEnglishDigits(String(value ?? ""))
    .toLowerCase()
    .trim();
}
