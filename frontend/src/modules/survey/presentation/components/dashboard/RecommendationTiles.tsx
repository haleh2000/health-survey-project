// src/modules/survey/presentation/components/dashboard/RecommendationTiles.tsx

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { toPersianDigits } from "@core/text/digits";
import { readOrCreateRecommendationSeed } from "@survey/infrastructure/storage/recommendation-seed.storage";

import { resolveStoryGroups, type ResolvedStoryGroup } from "./recommendationStories";
import { StoryViewer } from "./StoryViewer";

const SCRIM = "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.50) 100%)";

interface RecommendationTilesProps {
  readonly baseDelay?: number;
  /** شناسه ارزیابی یا کاربر؛ سری پیشنهادها را پایدار می‌کند. */
  readonly seed?: string;
}

export function RecommendationTiles({ baseDelay = 0, seed }: RecommendationTilesProps) {
  const [activeGroup, setActiveGroup] = useState<ResolvedStoryGroup | null>(null);

  const groups = useMemo(
    () => resolveStoryGroups(seed ?? readOrCreateRecommendationSeed()),
    [seed],
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {groups.map((group, index) => (
          <motion.button
            key={group.key}
            type="button"
            onClick={() => setActiveGroup(group)}
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
                {toPersianDigits(group.slides.length)} نکته
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
