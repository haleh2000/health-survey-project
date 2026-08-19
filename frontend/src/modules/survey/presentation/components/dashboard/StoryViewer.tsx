// src/modules/survey/presentation/components/dashboard/StoryViewer.tsx

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ResolvedStoryGroup } from "./recommendationStories";

import type { StoryGroup } from "./recommendationStories";

const SLIDE_MS = 6_000;
const HOLD_MS = 220;

interface StoryViewerProps {
  readonly group: ResolvedStoryGroup | null;
  readonly onClose: () => void;
}

export function StoryViewer({ group, onClose }: StoryViewerProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const progressRef = useRef(0);
  const holdRef = useRef<number | null>(null);
  const heldRef = useRef(false);

  // با هر بار باز شدن گروه جدید، از اسلاید اول شروع کن
  useEffect(() => {
    if (!group) return;
    setIndex(0);
    setProgress(0);
    progressRef.current = 0;
    setPaused(false);
  }, [group]);

  const goNext = useCallback(() => {
    progressRef.current = 0;
    setProgress(0);
    setIndex((current) => {
      if (!group) return current;
      if (current >= group.slides.length - 1) {
        onClose();
        return current;
      }
      return current + 1;
    });
  }, [group, onClose]);

  const goPrev = useCallback(() => {
    progressRef.current = 0;
    setProgress(0);
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  // تایمر پیشرفت
  useEffect(() => {
    if (!group || paused) return;
    let frame = 0;
    const startedAt = performance.now() - progressRef.current * SLIDE_MS;

    const tick = (now: number) => {
      const value = Math.min((now - startedAt) / SLIDE_MS, 1);
      progressRef.current = value;
      setProgress(value);
      if (value >= 1) {
        goNext();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [group, paused, index, goNext]);

  // کیبورد + قفل اسکرول
  useEffect(() => {
    if (!group) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goNext();
      if (event.key === "ArrowRight") goPrev();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [group, goNext, goPrev, onClose]);

  if (!group) return null;

  const slide = group.slides[index];
  if (!slide) return null;

  const SlideIcon = slide.icon;

  const startHold = () => {
    heldRef.current = false;
    holdRef.current = window.setTimeout(() => {
      heldRef.current = true;
      setPaused(true);
    }, HOLD_MS);
  };

const endHold = () => {
  if (holdRef.current !== null) {
    clearTimeout(holdRef.current);
    holdRef.current = null;
  }
  if (heldRef.current) setPaused(false); // فقط اگر مکث از نگه‌داشتن بوده
};


  const handleZone = (direction: "next" | "prev") => {
    if (heldRef.current) return; // نگه‌داشتن، ناوبری نیست
    if (direction === "next") goNext();
    else goPrev();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={`توصیه‌های ${group.label}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110) onClose();
          }}
          className="relative h-full w-full overflow-hidden bg-black
                     sm:h-[86vh] sm:max-h-[760px] sm:w-[420px] sm:rounded-3xl"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
        >
          {/* تصویر اسلاید */}
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id}
              src={slide.image}
              alt=""
              aria-hidden
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* نوار پیشرفت */}
          <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3">
            {group.slides.map((item, itemIndex) => (
              <div key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width:
                      itemIndex < index
                        ? "100%"
                        : itemIndex === index
                          ? `${progress * 100}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* هدر */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-7">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
                <group.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
              <span className="text-sm font-bold text-white drop-shadow">{group.label}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white
                         backdrop-blur-sm transition hover:bg-white/25
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* نواحی لمسی: راست = قبلی، چپ = بعدی (RTL) */}
           <button
            type="button"
            onClick={() => handleZone("next")}
            aria-label="اسلاید بعدی"
            className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-default focus:outline-none"
            />

            <button
            type="button"
            onClick={() => handleZone("prev")}
            aria-label="اسلاید قبلی"
            className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-default focus:outline-none"
            />

          {/* دکمه‌های دسکتاپ */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-2 sm:flex">
            <button
              type="button"
              onClick={goNext}
              aria-label="بعدی"
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              aria-label="قبلی"
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* متن */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-6 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <SlideIcon className="h-6 w-6 text-white" strokeWidth={2} />
                </span>
                <h3 className="text-xl font-black leading-tight text-white drop-shadow">
                  {slide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{slide.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
