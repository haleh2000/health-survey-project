// WelcomePage.tsx
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import daydarLogo from '@ds/assets/logo/daydar-logo.png';
import time from '@ds/assets/time.png';
import safe from '@ds/assets/safe.png';
import daydarReport from '@ds/assets/daydar-report.png';
import drdd from '@ds/assets/drdd.png';

const CARD_ACCENT = {
  color: 'from-[#0099A8]/20 to-teal-500/20',
  iconColor: 'text-[#0099A8]',
};

const CARD_SHADOW =
  'shadow-[0_10px_30px_rgba(0,153,168,0.15)] hover:shadow-[0_20px_45px_rgba(0,153,168,0.35)]';

export default function WelcomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const features = [
    { icon: time, title: 'رایگان و سریع', delay: 0.2, ...CARD_ACCENT },
    { icon: safe, title: 'محرمانه و امن', delay: 0.4, ...CARD_ACCENT },
    {
      icon: daydarReport,
      title: 'پیشنهادات هوشمند شخصی‌سازی‌شده',
      delay: 0.6,
      ...CARD_ACCENT,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative z-10 w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/50">
      
          <div className="w-1/3 flex items-center justify-center shrink-0 ">
          <img
            src={drdd}
            alt=""
            className="w-24 h-24 md:w-32 md:h-32 object-contain"
          />
        </div>

        <motion.div className="flex justify-center mb-6 sm:mb-8" />

        {/* Hero Section */}
        <motion.div ref={heroRef} className="text-center mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 sm:mb-8"
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
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-4xl mx-auto items-stretch">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="group relative h-full"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div
                className={`relative h-full flex flex-col bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-500 text-center ${CARD_SHADOW}`}
              >
                <motion.div
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{ rotate: 0, scale: 1 }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-40 md:h-40 mx-auto object-contain"
                  />
                </motion.div>
                <div className="flex-1 flex items-center justify-center">
                  <h3
                    className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 text-center"
                    style={{ lineHeight: '2.2' }}
                  >
                    {feature.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
