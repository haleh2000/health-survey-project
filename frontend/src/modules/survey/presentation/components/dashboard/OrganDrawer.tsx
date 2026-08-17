import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { RiskTier } from "@survey/domain/entities/risk-assessment.entity";

import { ORGAN_META, type OrganKey } from "./organ-meta";
import { OrganIcon } from "../../../../../design-system/illustrations/OrganIcon";


interface OrganContent {
  description: string;
  tips: string[];
  warningSign: string;
}

const ORGAN_CONTENT: Record<OrganKey, OrganContent> = {
  lung: {
    description: "ریه‌ها مسئول تبادل اکسیژن و دی‌اکسیدکربن هستند. دخانیات بزرگ‌ترین عامل آسیب ریوی است.",
    tips: [
      "سیگار نکشید — ترک سیگار در هر سنی مفید است",
      "در مکان‌های آلوده از ماسک N95 استفاده کنید",
      "تهویه مناسب خانه را تأمین کنید",
      "واکسن آنفولانزا و پنوموکوک را دریافت کنید",
    ],
    warningSign: "سرفه مزمن بیش از ۳ هفته، خلط خونی",
  },
  gastric: {
    description: "دستگاه گوارش نقش محوری در جذب مواد مغذی و ایمنی دارد. استرس، رژیم غذایی نامناسب و هلیکوباکتر پیلوری از عوامل اصلی آسیب هستند.",
    tips: [
      "وعده‌های غذایی منظم و بدون عجله بخورید",
      "مصرف غذاهای فرآوری‌شده و پرنمک را کاهش دهید",
      "فیبر کافی از میوه و سبزیجات دریافت کنید",
      "آنتی‌بیوتیک‌ها را فقط با تجویز پزشک بخورید",
    ],
    warningSign: "درد مداوم شکم، خون در مدفوع، کاهش وزن بی‌دلیل",
  },
  colon: {
    description: "روده بزرگ بخش پایانی دستگاه گوارش است. تغذیه کم‌فیبر، کم‌تحرکی و سابقه خانوادگی از عوامل اصلی ریسک سرطان روده بزرگ هستند.",
    tips: [
      "مصرف فیبر (غلات کامل، سبزیجات، حبوبات) را افزایش دهید",
      "مصرف گوشت قرمز و فرآوری‌شده را محدود کنید",
      "فعالیت بدنی منظم داشته باشید",
      "غربالگری کولونوسکوپی را از سن توصیه‌شده شروع کنید",
    ],
    warningSign: "خون در مدفوع، تغییر عادت روده، کاهش وزن بی‌دلیل",
  },
  pancreas: {
    description: "پانکراس در تنظیم قند خون و هضم چربی‌ها نقش دارد. دخانیات، مصرف الکل و اضافه‌وزن از عوامل اصلی ریسک آسیب پانکراس هستند.",
    tips: [
      "سیگار و الکل را ترک کنید",
      "وزن سالم و دور کمر مناسب را حفظ کنید",
      "مصرف چربی‌های اشباع را کاهش دهید",
      "قند خون را به‌طور منظم چک کنید",
    ],
    warningSign: "درد شدید بالای شکم که به پشت می‌زند، زردی پوست",
  },
  stroke: {
    description: "سکته مغزی زمانی رخ می‌دهد که خون‌رسانی به بخشی از مغز قطع شود. فشار خون بالا، دیابت و کم‌تحرکی مهم‌ترین عوامل ریسک هستند.",
    tips: [
      "فشار خون بالای ۱۴۰/۹۰ را جدی بگیرید و کنترل کنید",
      "۷-۹ ساعت خواب با کیفیت داشته باشید",
      "مدیریت استرس با مدیتیشن یا تمرین‌های تنفسی",
      "فعالیت بدنی منظم و ترک سیگار را در اولویت قرار دهید",
    ],
    warningSign: "ضعف یا بی‌حسی ناگهانی یک‌طرفه بدن، گفتار نامفهوم، سردرد شدید ناگهانی",
  },
  cardiac: {
    description: "قلب مهم‌ترین عضو دستگاه گردش خون است. فشار خون بالا، کلسترول زیاد و سبک زندگی کم‌تحرک از عوامل اصلی ریسک بیماری‌های قلبی هستند.",
    tips: [
      "حداقل ۱۵۰ دقیقه فعالیت هوازی در هفته داشته باشید",
      "مصرف نمک را به زیر ۵ گرم در روز کاهش دهید",
      "چربی‌های اشباع را با روغن‌های گیاهی جایگزین کنید",
      "فشار خون خود را هر ۶ ماه یک‌بار اندازه بگیرید",
    ],
    warningSign: "درد یا فشار در قفسه سینه، تنگی نفس ناگهانی",
  },
  metabolic: {
    description: "سندرم متابولیک ترکیبی از قند خون بالا، فشار خون بالا، چربی خون نامناسب و چاقی شکمی است که ریسک دیابت و بیماری قلبی را افزایش می‌دهد.",
    tips: [
      "دور کمر و وزن خود را در محدوده سالم نگه دارید",
      "مصرف قند و کربوهیدرات تصفیه‌شده را کاهش دهید",
      "فعالیت بدنی منظم داشته باشید",
      "قند خون، چربی خون و فشار خون را سالانه چک کنید",
    ],
    warningSign: "تشنگی و ادرار مکرر غیرعادی، خستگی مداوم",
  },
  liver: {
    description: "کبد بیش از ۵۰۰ عملکرد حیاتی دارد؛ از سم‌زدایی تا ساخت پروتئین. چربی کبد اغلب بدون علامت پیشرفت می‌کند.",
    tips: [
      "مصرف الکل را قطع یا به حداقل برسانید",
      "قند و کربوهیدرات تصفیه‌شده را کم کنید",
      "وزن ایده‌آل خود را حفظ کنید",
      "آزمایش عملکرد کبد را سالانه انجام دهید",
    ],
    warningSign: "زردی پوست یا سفیدی چشم، درد زیر دنده راست",
  },
};

const TIER_CONFIG: Record<RiskTier, { label: string; hex: string; bg: string; border: string }> = {
  [RiskTier.Low]:      { label: "ریسک پایین",   hex: "#0d9488", bg: "bg-teal-50 dark:bg-teal-950/40",   border: "border-teal-200 dark:border-teal-800" },
  [RiskTier.Moderate]: { label: "ریسک متوسط",   hex: "#ca8a04", bg: "bg-yellow-50 dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-800" },
  [RiskTier.Elevated]: { label: "ریسک بالا",    hex: "#ea580c", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800" },
  [RiskTier.Critical]: { label: "ریسک بحرانی",  hex: "#dc2626", bg: "bg-red-50 dark:bg-red-950/40",     border: "border-red-200 dark:border-red-800" },
};

interface OrganDrawerProps {
  organKey: OrganKey | null;
  riskTier?: RiskTier;
  riskScore?: number;
  onClose: () => void;
}

export function OrganDrawer({ organKey, riskTier, riskScore, onClose }: OrganDrawerProps) {
  const meta = ORGAN_META.find((m) => m.key === organKey);
  const content = organKey ? ORGAN_CONTENT[organKey] : null;
  const tierConfig = riskTier ? TIER_CONFIG[riskTier] : null;

  useEffect(() => {
    if (!organKey) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [organKey, onClose]);

  useEffect(() => {
    document.body.style.overflow = organKey ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [organKey]);

  return (
    <AnimatePresence>
      {organKey && meta && content && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal
            aria-label={`جزئیات ${meta.label}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col overflow-hidden bg-surface shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: `${tierConfig?.hex ?? "#0d9488"}1a` }}
              >
                <OrganIcon organ={meta.key} size={20} color={tierConfig?.hex} />

              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-ink">{meta.label}</h2>
                {tierConfig && (
                  <span className="text-xs font-semibold" style={{ color: tierConfig.hex }}>
                    {tierConfig.label}
                    {riskScore !== undefined && (
                      <span className="mr-1 text-ink-muted font-normal">
                        — نمره {riskScore.toFixed(1)}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-fill hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-day-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {tierConfig ? (
                <div className={`rounded-xl border p-4 ${tierConfig.bg} ${tierConfig.border}`}>
                  <p className="text-sm leading-relaxed text-ink-subtle">{content.description}</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-ink-subtle">{content.description}</p>
              )}

              <div>
                <h3 className="mb-3 text-sm font-bold text-ink">توصیه‌های سلامت</h3>
                <ul className="space-y-2">
                  {content.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: tierConfig?.hex ?? "#0d9488" }}
                        aria-hidden
                      />
                      <span className="text-sm leading-relaxed text-ink-subtle">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <h3 className="mb-1.5 text-sm font-bold text-red-700 dark:text-red-400">علائم هشداردهنده</h3>
                <p className="text-sm leading-relaxed text-red-600 dark:text-red-400/80">{content.warningSign}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-line px-5 py-4">
              <p className="text-center text-xs text-ink-muted">این اطلاعات جایگزین مشاوره پزشکی نیست</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
