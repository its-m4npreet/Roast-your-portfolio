'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative min-h-[78vh] sm:min-h-[92vh] md:min-h-[100vh] flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-20 pb-10 sm:pb-0">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5"></div>
      </div>

      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='flex flex-col items-center justify-center my-auto'
        >
          <motion.div
            className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs font-semibold tracking-widest uppercase"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Live & Roasting
          </motion.div>

          <motion.h1
            className="text-[clamp(3rem,15vw,7.5rem)] font-black mb-6 tracking-tight leading-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              Roast
            </span>
            <span className="text-gray-900 dark:text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              folio
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-2xl md:text-3xl font-semibold mb-4 text-gray-700 dark:text-gray-300 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get your portfolio{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent font-extrabold">roasted</span>
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-gradient-to-r from-orange-400 to-red-500 opacity-60"></span>
            </span>
            {' '}by AI
          </motion.p>

          <motion.p
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 max-w-xl mx-auto leading-relaxed tracking-wide font-light px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Paste your portfolio URL and receive funny but useful feedback.
            Choose from Roast Mode, Recruiter Mode, or Brutal Mode. 🔥
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
