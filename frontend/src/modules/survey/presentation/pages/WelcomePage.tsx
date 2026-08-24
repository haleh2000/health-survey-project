// WelcomePage.tsx
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import time from '@ds/assets/time.png';
import safe from '@ds/assets/safe.png';
import daydarReport from '@ds/assets/daydar-report.png';
import drdd from '@ds/assets/drdd.png';

const CARD_ACCENT = {
  color: 'from-[#0099A8]/20 to-teal-500/20',
  iconColor: 'text-[#0099A8]',
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const features = [
    { icon: time, title: 'رایگان و سریع', delay: 0.2, ...CARD_ACCENT },
    { icon: safe, title: 'محرمانه و امن', delay: 0.4, ...CARD_ACCENT },
    {
      icon: daydarReport,
      title: 'پیشنهادات هوشمند شخصی‌سازی‌شده ',
      delay: 0.6,
      ...CARD_ACCENT,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
           <div className="relative z-10 w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/50">

        {/* Mascot — corner placement on tablet/desktop only */}
        <img
          src={drdd}
          alt=""
          aria-hidden="true"
          className="hidden sm:block pointer-events-none select-none absolute left-4 top-4 w-[300px] h-[300px] md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
        />

        {/* Hero Section */}
        <motion.div ref={heroRef} className="text-center mb-8 sm:mb-10">

          {/* Mascot — mobile only, centered above the title */}
          <motion.img
            src={drdd}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="sm:hidden pointer-events-none select-none mx-auto mb-4 w-38 h-32 object-contain"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-5 sm:mb-6"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                سفر سلامت خود را
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="block bg-gradient-to-l from-[#0099A8] to-teal-600 bg-clip-text text-transparent mt-3"
              >
                امروز شروع کنید
              </motion.span>
            </h1>

          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              onClick={() => navigate('/survey')}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 153, 168, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer relative w-full sm:w-auto sm:min-w-[280px] md:min-w-[340px] px-12 py-3 sm:px-16 sm:py-4 md:px-20 md:py-5 bg-gradient-to-l from-[#0099A8] to-teal-600 text-white rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: 0, opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                شروع ارزیابی
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ←
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 border-2 border-white/50 rounded-xl sm:rounded-2xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features — compact horizontal rows on mobile, centered columns on desktop */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="flex flex-row sm:flex-col items-center gap-3 sm:gap-3 rounded-xl sm:rounded-2xl bg-white/70 border border-gray-100 p-3 sm:p-6 text-right sm:text-center"
            >
              <img
                src={feature.icon}
                alt=""
                aria-hidden="true"
                className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 object-contain"
              />
               <div className="min-w-0">
             <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-loose sm:leading-relaxed md:leading-loose">
                {feature.title}
              </h3>
              </div>

            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
