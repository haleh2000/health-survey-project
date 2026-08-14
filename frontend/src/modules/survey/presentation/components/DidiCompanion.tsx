// src/modules/survey/components/DidiCompanion.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import dd1 from '@ds/assets/dd1.png';

interface DidiCompanionProps {
  currentStep: number;
  totalSteps: number;
  isTransitioning?: boolean;
}

const getDidiMessage = (step: number, total: number): string => {
  const progress = (step / total) * 100;

  if (step === 1) return "سلام! 👋 بیا با هم شروع کنیم";
  if (progress < 30) return "داری عالی پیش میری! 💪";
  if (progress < 60) return "نصف راه رو رد کردیم 🎯";
  if (progress < 90) return "تقریباً رسیدیم! 🚀";
  if (step === total) return "تبریک! کارت تمومه 🎉";

  return "خوب داری کار میکنی! 😊";
};

export function DidiCompanion({ currentStep, totalSteps, isTransitioning }: DidiCompanionProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const message = getDidiMessage(currentStep, totalSteps);

  useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => {
      if (!isHovered) setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentStep, isHovered]);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed bottom-8 right-8 z-50"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isTransitioning ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, repeat: isTransitioning ? Infinity : 0 }}
        className="relative"
      >
        <img
          src={dd1}
          alt="دی‌دی"
          className="w-28 h-28 drop-shadow-lg"
        />

        <AnimatePresence>
          {showTooltip && (
            <motion.div
              key="tooltip"
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute bottom-full right-0 mb-4 min-w-[200px]"
            >
              <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl
                            p-4 shadow-lg border border-white/20">
                <p className="text-sm text-gray-700 font-medium text-right">
                  {message}
                </p>

                <div className="absolute -bottom-2 right-6 w-4 h-4
                              bg-white/80 backdrop-blur-lg
                              rotate-45 border-r border-b border-white/20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
