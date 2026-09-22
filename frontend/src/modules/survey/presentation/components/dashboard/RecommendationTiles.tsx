// src/modules/survey/presentation/components/dashboard/RecommendationTiles.tsx

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import type { RiskTier } from "@survey/domain/entities/risk-assessment.entity";

import {
  resolveStoryGroupRandom,
  storyGroupsFor,
  type ResolvedStoryGroup,
  type StoryGroupKey,
} from "./recommendationStories";
import { StoryViewer } from "./StoryViewer";

const SCRIM = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)";

// گرادیانت مخروطی چرخشی شامل رنگ برند (#019ba7)، طیف‌های مکمل و نور براق
const ROTATING_CONIC_GRADIENT =
  "conic-gradient(from 0deg, #019ba7, #00c2cb, #ffffff, #38ebf8bd, #019ba7)";
const SEEN_RING = "#d1d5db"; // طوسی برای استوری‌های دیده‌شده

interface RecommendationTilesProps {
  readonly baseDelay?: number;
  readonly tier?: RiskTier | null;
}

export function RecommendationTiles({ baseDelay = 0, tier = null }: RecommendationTilesProps) {
  const [activeGroup, setActiveGroup] = useState<ResolvedStoryGroup | null>(null);
  const [viewedKeys, setViewedKeys] = useState<Set<StoryGroupKey>>(new Set());

  const groups = useMemo(() => storyGroupsFor(tier), [tier]);

  const openGroup = (key: StoryGroupKey) => {
    setActiveGroup(resolveStoryGroupRandom(key, tier));
    setViewedKeys((prev) => new Set(prev).add(key));
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {groups.map((group, index) => {
          const seen = viewedKeys.has(group.key);
          return (
            <motion.button
              key={group.key}
              type="button"
              onClick={() => openGroup(group.key)}
              aria-label={`مشاهده توصیه‌های ${group.label}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 26,
                delay: baseDelay + index * 0.1,
              }}
              whileHover={{ y: -4, scale: 1.018 }}
              whileTap={{ scale: 0.982 }}
              /* کادر بیرونی دکمه استوری با ضخامت ۳ پیکسل */
              className="group relative flex min-h-[200px] cursor-pointer flex-col overflow-hidden
                         rounded-[22px] p-[3px] text-right shadow-card
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-[#019ba7] lg:min-h-[240px]"
              style={{
                backgroundColor: seen ? SEEN_RING : "#019ba7",
              }}
            >
              {/* افکت چرخش آرام، پیوسته و بدون وقفه دور کادر */}
              {!seen && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[150%] m-auto aspect-square z-0"
                  style={{
                    background: ROTATING_CONIC_GRADIENT,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2, // چرخش آرام و چشم‌نواز (نه کندِ خسته‌کننده، نه تند)
                    ease: "linear",
                  }}
                />
              )}

              {/* لایه فاصله (Gap) با پس‌زمینه سالید جهت محافظت از عکس */}
              <div className="relative z-10 flex h-full w-full flex-1 flex-col justify-end overflow-hidden
                              rounded-[19px] bg-white p-[2.5px] dark:bg-slate-900">
                {/* کادر داخلی و عکس استوری */}
                <div className="relative h-full w-full overflow-hidden rounded-[16.5px]">
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

                  <div className="relative flex h-full flex-col justify-end p-4">
                    <p className="text-sm font-black text-white drop-shadow-md">{group.label}</p>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <StoryViewer
        key={activeGroup ? `${activeGroup.key}-${activeGroup.variantId}` : "idle"}
        group={activeGroup}
        onClose={() => setActiveGroup(null)}
      />
    </>
  );
}
