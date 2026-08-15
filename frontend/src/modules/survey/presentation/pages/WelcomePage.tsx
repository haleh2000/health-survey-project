// WelcomePage.tsx
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Sparkles, Timer } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { HealthDashboard } from "@survey/presentation/components/dashboard/HealthDashboard";
import { loadAssessmentHistory } from "@survey/infrastructure/storage/assessment-history.storage";

const TRUST_BADGES = [
  { icon: Timer, label: "رایگان و سریع" },
  { icon: Lock, label: "محرمانه و امن" },
  { icon: Sparkles, label: "پیشنهادهای شخصی‌سازی‌شده" },
] as const;

export default function WelcomePage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const history = useMemo(loadAssessmentHistory, []);
  const latest = history[0] ?? null;
  const hasAssessment = latest !== null;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Hero. */}
        <div className="flex flex-col items-center gap-5 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="text-2xl font-black leading-snug text-ink sm:text-3xl lg:text-4xl"
          >
            {hasAssessment ? (
              <>تصویر سلامت شما، همیشه جلوی چشم</>
            ) : (
              <>
                سفر سلامت خود را{" "}
                <span className="bg-gradient-to-l from-day-primary to-teal-600 bg-clip-text text-transparent">
                  امروز شروع کنید
                </span>
              </>
            )}
          </motion.h1>

          {/* CTA — feedback on the press itself, spring on hover. */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.15 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/survey")}
            className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-l from-day-primary to-teal-600 px-14 py-4 text-lg font-bold text-white shadow-raised sm:w-auto sm:min-w-[320px]"
          >
            {/* A soft light sweep keeps the button breathing without shouting. */}
            {!reduceMotion && (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 w-1/3 bg-white/20 blur-md"
                animate={{ left: ["-40%", "120%"] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {hasAssessment ? "ارزیابی مجدد" : "شروع ارزیابی"}
              <motion.span
                animate={reduceMotion ? undefined : { x: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ←
              </motion.span>
            </span>
          </motion.button>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRUST_BADGES.map((badge, index) => (
              <motion.span
                key={badge.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur-sm"
              >
                <badge.icon className="h-3.5 w-3.5 text-day-primary" />
                {badge.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Personal dashboard — zeroed before the first assessment. */}
        <HealthDashboard record={latest} historyCount={history.length} />
      </div>
    </div>
  );
}
