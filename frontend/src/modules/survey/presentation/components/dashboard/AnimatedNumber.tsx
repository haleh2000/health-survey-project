// src/modules/survey/presentation/components/dashboard/AnimatedNumber.tsx

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

import { toPersianDigits } from "@core/text/digits";

interface Props {
  value: number;
  fractionDigits?: number;
  suffix?: string;
  className?: string;
  /** Seconds to wait before the count-up starts (used for staggering). */
  delay?: number;
}

/**
 * Counts from the currently displayed value to `value` with a critically
 * damped spring, rendering Persian digits. Because it animates the motion
 * value (not a keyframe), a mid-flight retarget continues from the on-screen
 * number instead of jumping.
 */
export function AnimatedNumber({ value, fractionDigits = 0, suffix = "", className, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(count, (v) => toPersianDigits(v.toFixed(fractionDigits)) + suffix);

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      type: "spring",
      stiffness: 60,
      damping: 20,
      delay,
    });
    return () => controls.stop();
  }, [value, count, delay, reduceMotion]);

  return <motion.span className={className}>{text}</motion.span>;
}
