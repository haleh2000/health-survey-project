// WelcomePage.tsx
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import daydarLogo from '@ds/assets/logo/daydar-logo.png';
import dd1 from '@ds/assets/dd1.png';
import dd2 from '@ds/assets/dd2.png';
import dd3 from '@ds/assets/dd3.png';

export default function WelcomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const features = [
    {
      icon: dd1,
      title: 'فقط در ۵ دقیقه',
      description: 'ارزیابی سریع و دقیق',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500',
      delay: 0.2,
    },
    {
      icon: dd2,
      title: 'شخصی‌سازی هوشمند',
      description: 'برنامه‌ای متناسب با نیاز شما',
      color: 'from-[#0099A8]/20 to-teal-500/20',
      iconColor: 'text-[#0099A8]',
      delay: 0.4,
    },
    {
      icon: dd3,
      title: 'پیگیری مستمر',
      description: 'رشد و پیشرفت خود را ببینید',
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-500',
      delay: 0.6,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 sm:top-20 right-50 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-[#0099A8]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 sm:bottom-40 left-10 sm:left-20 w-64 h-64 sm:w-96 sm:h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div> */}

      <div className="relative z-10 w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/50">
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute hidden sm:block sm:top-1/3 sm:right-[80%] w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#0099A8]/20 rounded-lg"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute hidden sm:block bottom-1/2 sm:right-[5%] sm:right-[10%] w-10 h-10 sm:w-12 sm:h-12 border-2 border-teal-400/20 rounded-full"
          />
        </div>

        <motion.div
         
          className="flex justify-center mb-6 sm:mb-8"
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={daydarLogo}
            alt="دیدار"
            className="h-12 sm:h-16 md:h-20 w-auto drop-shadow-sm"
          />
        </motion.div>

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
                className="block bg-gradient-to-l from-[#0099A8] to-teal-600 bg-clip-text text-transparent"
              >
                امروز شروع کنید
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
            >
              ارزیابی رایگان و هوشمند سلامت با توصیه‌های شخصی‌سازی‌شده
            </motion.p>
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
              className="group cursor-pointer relative px-8 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 bg-gradient-to-l from-[#0099A8] to-teal-600 text-white rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
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

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm md:text-base text-gray-500 px-4"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-500"
              >
                ✓
              </motion.span>
              <span>محرمانه و امن</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-blue-500"
              >
                ✓
              </motion.span>
              <span>بدون نیاز به ثبت‌نام</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="text-[#0099A8]"
              >
                ✓
              </motion.span>
              <span>رایگان</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{
                y: -8,
                transition: { type: 'spring', stiffness: 300 },
              }}
              className="group relative"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-3 sm:mb-4"
                >
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto object-contain"
                  />
                </motion.div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
