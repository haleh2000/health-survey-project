// src/modules/survey/presentation/components/dashboard/StatusPanel.tsx

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Cigarette,
  Dumbbell,
  Salad,
  Scale,
  Soup,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AssessmentFlags } from "@survey/domain/entities/risk-assessment.entity";

interface StatusItem {
  readonly title: string;
  readonly icon: LucideIcon;
  /** True when any of these flags fire — the habit needs attention. */
  readonly isFlagged: (flags: AssessmentFlags) => boolean;
  readonly goodLabel: string;
  readonly badLabel: string;
}

const STATUS_ITEMS: readonly StatusItem[] = [
  {
    title: "دخانیات",
    icon: Cigarette,
    isFlagged: (f) => f.heavy_smoker || f.hookah_ecig,
    goodLabel: "بدون مصرف پرخطر",
    badLabel: "مصرف پرخطر دارید",
  },
  {
    title: "الگوی تغذیه",
    icon: Salad,
    isFlagged: (f) => f.junk_food || f.low_fiber || f.processed_meat_high,
    goodLabel: "الگوی سالم",
    badLabel: "نیاز به اصلاح دارد",
  },
  {
    title: "نمک و غذای دودی",
    icon: Soup,
    isFlagged: (f) => f.salty_food || f.smoked_food || f.hot_drink,
    goodLabel: "در محدوده ایمن",
    badLabel: "مراقب مصرف باشید",
  },
  {
    title: "فعالیت بدنی",
    icon: Dumbbell,
    isFlagged: (f) => f.low_physical_activity,
    goodLabel: "تحرک کافی",
    badLabel: "تحرک کم است",
  },
  {
    title: "وزن و تناسب",
    icon: Scale,
    isFlagged: (f) => f.obesity,
    goodLabel: "در محدوده سالم",
    badLabel: "خارج از محدوده",
  },
  {
    title: "سوابق بالینی",
    icon: Stethoscope,
    isFlagged: (f) =>
      f.diabetes ||
      f.hypertension ||
      f.heart_disease ||
      f.chronic_pancreatitis ||
      f.infectious_disease ||
      f.brain_stroke_history ||
      f.heart_attack_history,
    goodLabel: "بدون سابقه ثبت‌شده",
    badLabel: "سابقه نیازمند پیگیری",
  },
];

interface Props {
  flags: AssessmentFlags | null;
  baseDelay?: number;
}

/**
 * The "Medical History"-style column of the reference design: each lifestyle
 * area gets a card with a green check or an amber attention badge.
 */
export function StatusPanel({ flags, baseDelay = 0 }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {STATUS_ITEMS.map((item, index) => {
        const empty = flags === null;
        const flagged = flags ? item.isFlagged(flags) : false;
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: baseDelay + index * 0.07 }}
            whileHover={{ x: -3 }}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface/80 p-3.5 shadow-card backdrop-blur-md"
          >
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                empty
                  ? "bg-surface-muted text-ink-subtle"
                  : flagged
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-day-primary"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{item.title}</p>
              <p
                className={`truncate text-[11px] font-medium ${
                  empty ? "text-ink-subtle" : flagged ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {empty ? "پس از ارزیابی مشخص می‌شود" : flagged ? item.badLabel : item.goodLabel}
              </p>
            </div>

            {!empty && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 20, delay: baseDelay + 0.25 + index * 0.07 }}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${
                  flagged ? "bg-amber-500" : "bg-emerald-500"
                }`}
              >
                {flagged ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
