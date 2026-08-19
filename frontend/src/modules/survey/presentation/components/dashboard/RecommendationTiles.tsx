// src/modules/survey/presentation/components/dashboard/RecommendationTiles.tsx
// کارت‌های «پیشنهادهای روزانه» — فقط دسته‌هایی که برای گروه ریسک کاربر
// محتوا دارند نمایش داده می‌شوند و تعداد روی هر کارت، تعدادِ واقعیِ
// استوری‌های همان گروه است.

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { toPersianDigits } from "@core/text/digits";
import type { RiskTier } from "@survey/domain/entities/risk-assessment.entity";

import {
  resolveStoryGroupRandom,
  storyGroupsFor,
  type ResolvedStoryGroup,
  type StoryGroupKey,
} from "./recommendationStories";
import { StoryViewer } from "./StoryViewer";

const SCRIM = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.50) 100%)";

interface RecommendationTilesProps {
  readonly baseDelay?: number;
  /** گروه ریسک کاربر — محتوای استوری‌ها بر همین اساس انتخاب می‌شود. */
  readonly tier?: RiskTier | null;
}

export function RecommendationTiles({ baseDelay = 0, tier = null }: RecommendationTilesProps) {
  const [activeGroup, setActiveGroup] = useState<ResolvedStoryGroup | null>(null);

  /** دسته‌های دارای محتوا برای این گروه ریسک */
  const groups = useMemo(() => storyGroupsFor(tier), [tier]);

  /** هر بار کلیک، همان محتوای گروه با ترتیبی تازه و تصادفی ساخته می‌شود */
  const openGroup = (key: StoryGroupKey) => {
    setActiveGroup(resolveStoryGroupRandom(key, tier));
  };

  return (
    <>
      {/* تعداد ستون‌ها با تعداد دسته‌های موجود هماهنگ می‌شود (گروه پرریسک ورزش ندارد) */}
      <div
        className={`grid grid-cols-1 gap-3 sm:gap-4 ${
          groups.length >= 3 ? "sm:grid-cols-3" : groups.length === 2 ? "sm:grid-cols-2" : ""
        }`}
      >
        {groups.map((group, index) => (
            <motion.button
              key={group.key}
              type="button"
              onClick={() => openGroup(group.key)}
              aria-label={`مشاهده توصیه‌های ${group.label}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26, delay: baseDelay + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="group relative flex min-h-[200px] cursor-pointer flex-col justify-end
                         overflow-hidden rounded-2xl border border-line p-4 text-right shadow-card
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-day-primary lg:min-h-[240px]"
            >
              <img
                src={group.cover}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform
                           duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />

              <div className="relative flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white drop-shadow-sm">{group.label}</p>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  {toPersianDigits(group.count)} استوری
                </span>
              </div>
            </motion.button>
        ))}
      </div>

      <StoryViewer
        key={activeGroup ? `${activeGroup.key}-${activeGroup.variantId}` : "idle"}
        group={activeGroup}
        onClose={() => setActiveGroup(null)}
      />
    </>
  );
}
