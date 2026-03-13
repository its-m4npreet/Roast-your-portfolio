'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 transition-colors"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
           
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Roastfolio
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-semibold tracking-widest uppercase text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/90 transition-colors"
            >
              Home
            </Link>
            <ThemeToggle />
            <motion.a
              href="https://github.com/its-m4npreet/Roast-your-portfolio"
              className="text-xs font-semibold tracking-widest uppercase text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/90 transition-colors px-3 py-[7] rounded-lg border border-gray-300 dark:border-white/15 bg-white/70 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ opacity: 0.8 }}
              whileTap={{ opacity: 0.9 }}
            >
              GitHub
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
