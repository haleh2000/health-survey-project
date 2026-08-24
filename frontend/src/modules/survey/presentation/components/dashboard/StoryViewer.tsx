import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { ResolvedStoryGroup } from "./recommendationStories";

const SLIDE_MS = 10_000;
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

  useEffect(() => {
    if (!group) return;

    setIndex(0);
    setProgress(0);
    progressRef.current = 0;
    setPaused(false);
  }, [group]);

  const goNext = useCallback(() => {
    if (!group) return;

    if (index >= group.slides.length - 1) {
      onClose();
      return;
    }

    progressRef.current = 0;
    setProgress(0);
    setIndex((current) => current + 1);
  }, [group, index, onClose]);

  const goPrev = useCallback(() => {
    progressRef.current = 0;
    setProgress(0);
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  useEffect(() => {
    if (!group || paused) return;

    let frame = 0;

    const startedAt =
      performance.now() - progressRef.current * SLIDE_MS;

    const tick = (now: number) => {
      const value = Math.min(
        (now - startedAt) / SLIDE_MS,
        1,
      );

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

  useEffect(() => {
    if (!group) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        goNext();
      }

      if (event.key === "ArrowRight") {
        goPrev();
      }

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

  const isFirst = index === 0;
  const isLast = index === group.slides.length - 1;

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

    if (heldRef.current) {
      setPaused(false);
    }
  };

  const handleZone = (direction: "next" | "prev") => {
    if (heldRef.current) return;

    if (direction === "next") {
      goNext();
    } else {
      goPrev();
    }
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
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/90
          backdrop-blur-md
        "
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            scale: 0.94,
            opacity: 0,
            y: 20,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.96,
            opacity: 0,
            y: 10,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 28,
          }}
          drag="y"
          dragConstraints={{
            top: 0,
            bottom: 0,
          }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110) {
              onClose();
            }
          }}
          className="
            relative
            flex
            h-full
            w-full
            flex-col
            overflow-hidden
            bg-[#F3ECE7]
            shadow-[0_30px_100px_rgba(0,0,0,0.45)]
            sm:h-[88vh]
            sm:max-h-[800px]
            sm:w-[430px]
            sm:rounded-[32px]
          "
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
        >
          {/* Background decoration */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 20, -10, 0],
                y: [0, -15, 15, 0],
                scale: [1, 1.08, 0.96, 1],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -right-28
                -top-28
                h-72
                w-72
                rounded-full
                bg-[#8CC8C0]/30
                blur-3xl
              "
            />

            <motion.div
              animate={{
                x: [0, -15, 15, 0],
                y: [0, 20, -10, 0],
                scale: [1, 0.95, 1.06, 1],
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -bottom-32
                -left-28
                h-80
                w-80
                rounded-full
                bg-[#E8B89B]/30
                blur-3xl
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.8),transparent_45%)]
              "
            />
          </div>

          {/* Progress bars */}

          <div className="absolute inset-x-0 top-0 z-40 flex gap-1.5 px-4 pt-3">
            {group.slides.map((item, itemIndex) => (
              <div
                key={item.id}
                className="
                  h-[3px]
                  flex-1
                  overflow-hidden
                  rounded-full
                  bg-black/10
                "
              >
                <motion.div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-[#008F9C]
                    to-[#45B7B0]
                  "
                  initial={false}
                  animate={{
                    width:
                      itemIndex < index
                        ? "100%"
                        : itemIndex === index
                          ? `${progress * 100}%`
                          : "0%",
                  }}
                  transition={{
                    duration: 0.08,
                    ease: "linear",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}

          <div className="relative z-30 flex shrink-0 items-center justify-between px-4 pb-3 pt-7">
            <div className="flex items-center gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  place-items-center
                  rounded-full
                  border
                  border-white/70
                  bg-white/55
                  shadow-sm
                  backdrop-blur-xl
                "
              >
                <group.icon
                  className="h-[19px] w-[19px] text-[#087F87]"
                  strokeWidth={2.2}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[13px] font-black text-[#263B3B]">
                  {group.label}
                </span>

                <span className="mt-0.5 text-[10px] font-medium text-[#718080]">
                  {paused
                    ? "متوقف شده"
                    : `توصیه ${index + 1} از ${group.slides.length}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="
                grid
                h-9
                w-9
                cursor-pointer
                place-items-center
                rounded-full
                border
                border-white/70
                bg-white/55
                text-[#334646]
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-200
                hover:scale-105
                hover:bg-white/80
                active:scale-95
              "
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Touch zones */}

          <button
            type="button"
            onClick={() => handleZone("next")}
            aria-label="استوری بعدی"
            className="
              absolute
              inset-y-0
              left-0
              z-20
              w-1/2
              cursor-default
              focus:outline-none
            "
          />

          <button
            type="button"
            onClick={() => handleZone("prev")}
            aria-label="استوری قبلی"
            className="
              absolute
              inset-y-0
              right-0
              z-20
              w-1/2
              cursor-default
              focus:outline-none
            "
          />

          {/* Main content */}

          <div
            className="
              pointer-events-none
              relative
              z-10
              flex
              min-h-0
              flex-1
              flex-col
              justify-center
              overflow-hidden
              px-6
              pb-20
              pt-2
            "
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{
                  opacity: 0,
                  x: 20,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  pointer-events-none
                  flex
                  flex-col
                "
              >
                {/* Hero image */}

                <div className="relative mx-auto mb-4 w-full max-w-[285px]">
                  <motion.div
                    initial={{
                      scale: 0.92,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.08,
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      absolute
                      -inset-5
                      rounded-[42px]
                      bg-white/35
                      blur-2xl
                    "
                  />

          <div className="relative mx-auto mb-6 flex w-full flex-1 items-center justify-center">
          <motion.img
            src={slide.image}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            initial={{
              scale: 0.94,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto
              block
              h-auto
              max-h-[460px]
              w-auto
              max-w-[100%]
              object-contain
            "
          />
          </div>
                </div>

                {/* Title */}

                <h3
                  className="
                    text-center
                    text-[25px]
                    font-black
                    leading-[1.35]
                    tracking-tight
                    text-[#263B3B]
                  "
                >
                  {slide.title}
                </h3>

                {/* Body */}

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-[340px]
                    text-center
                    text-[13px]
                    font-medium
                    leading-7
                    text-[#647474]
                  "
                >
                  {slide.body}
                </p>

                {/* Highlight */}


              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation */}

          <div
            className="
              relative
              z-30
              flex
              shrink-0
              items-center
              justify-between
              px-5
              pb-6
            "
          >
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              aria-label="استوری قبلی"
              className="
                grid
                h-10
                w-10
                cursor-pointer
                place-items-center
                rounded-full
                border
                border-white/70
                bg-white/55
                text-[#334646]
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-200
                hover:scale-105
                hover:bg-white/80
                active:scale-95
                disabled:pointer-events-none
                disabled:opacity-25
              "
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label={isLast ? "پایان" : "استوری بعدی"}
              className="
                grid
                h-10
                w-10
                cursor-pointer
                place-items-center
                rounded-full
                bg-[#087F87]
                text-white
                shadow-[0_8px_20px_rgba(8,127,135,0.25)]
                transition-all
                duration-200
                hover:scale-105
                hover:bg-[#076E75]
                active:scale-95
              "
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}