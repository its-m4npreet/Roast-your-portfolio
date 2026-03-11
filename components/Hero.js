'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5"></div>
      </div>

      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Roastfolio
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get your portfolio{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold">roasted</span> by AI
          </motion.p>

          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
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
