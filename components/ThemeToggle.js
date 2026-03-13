'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg border border-gray-300 dark:border-white/15 bg-white/70 dark:bg-white/5 animate-pulse" />
    );
  }

  return (
    <motion.button
      whileHover={{ opacity: 0.8 }}
      whileTap={{ opacity: 0.9 }}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-gray-300 dark:border-white/15 bg-white/70 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </motion.button>
  );
}
