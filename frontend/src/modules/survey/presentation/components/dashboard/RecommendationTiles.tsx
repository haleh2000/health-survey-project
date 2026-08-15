// src/modules/survey/presentation/components/dashboard/RecommendationTiles.tsx

import { motion } from "framer-motion";
import { Dumbbell, Salad, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tile {
  readonly title: string;
  readonly caption: string;
  readonly icon: LucideIcon;
  readonly gradient: string;
}

const TILES: readonly Tile[] = [
  {
    title: "تغذیه",
    caption: "هوشمندانه بخور، سالم زندگی کن",
    icon: Salad,
    gradient: "linear-gradient(135deg, #10b98122, #0a9ba422)",
  },
  {
    title: "ورزش",
    caption: "بیشتر حرکت کن، قوی‌تر شو",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, #0ea5e922, #6366f122)",
  },
  {
    title: "آرامش ذهن",
    caption: "ذهن آرام، زندگی شاد",
    icon: Smile,
    gradient: "linear-gradient(135deg, #f59e0b22, #ec489922)",
  },
];

/** The "Daily Recommendations" strip at the bottom of the reference design. */
export function RecommendationTiles({ baseDelay = 0 }: { baseDelay?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {TILES.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26, delay: baseDelay + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.015 }}
            className="relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-4 shadow-card backdrop-blur-md"
          >
            <div aria-hidden className="absolute inset-0" style={{ background: tile.gradient }} />
            <div className="relative flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.45 }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface shadow-card"
              >
                <Icon className="h-6 w-6 text-day-primary" strokeWidth={2} />
              </motion.div>
              <div className="min-w-0">
                <p className="text-sm font-black text-ink">{tile.title}</p>
                <p className="truncate text-[11px] text-ink-muted">{tile.caption}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
