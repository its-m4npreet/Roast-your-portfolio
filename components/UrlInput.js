'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { isValidUrl } from '@/utils/helpers';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('roast');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Analyzing your portfolio...');

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze portfolio');
      }

      toast.success('Analysis complete!', { id: loadingToast });
      
      // Redirect to result page
      router.push(`/result?id=${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Something went wrong', { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-center">
        {/* URL Input */}
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourportfolio.com"
            disabled={loading}
            className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-orange-500/60 focus:border-orange-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base tracking-wide font-light"
          />
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            type="button"
            onClick={() => setMode('roast')}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ opacity: 0.9 }}
            disabled={loading}
            className={`p-3 sm:p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm ${
              mode === 'roast'
                ? 'border-orange-500 bg-orange-100 dark:bg-orange-500/20 text-orange-900 dark:text-orange-100 shadow-sm'
                : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-white/40 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white/70'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-2">😄</div>
            <div className="text-xs font-semibold tracking-widest uppercase">Roast Mode</div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMode('recruiter')}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ opacity: 0.9 }}
            disabled={loading}
            className={`p-3 sm:p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm ${
              mode === 'recruiter'
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-100 shadow-sm'
                : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-white/40 hover:border-blue-500/30 hover:text-gray-900 dark:hover:text-white/70'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-2">💼</div>
            <div className="text-xs font-semibold tracking-widest uppercase">Recruiter Mode</div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMode('brutal')}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ opacity: 0.9 }}
            disabled={loading}
            className={`p-3 sm:p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm ${
              mode === 'brutal'
                ? 'border-red-500 bg-red-100 dark:bg-red-500/20 text-red-900 dark:text-red-100 shadow-sm'
                : 'border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-white/40 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white/70'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-2">💀</div>
            <div className="text-xs font-semibold tracking-widest uppercase">Brutal Mode</div>
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ opacity: loading ? 1 : 0.8 }}
          whileTap={{ opacity: loading ? 1 : 0.9 }}
          className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-black text-[11px] sm:text-sm tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              Roasting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              Get Roasted
            </>
          )}
        </motion.button>
      </form>

      {/* Info Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-500 dark:text-white/25 text-xs tracking-widest uppercase mt-6 font-light"
      >
        Your portfolio will be analyzed using AI. Results are saved for sharing.
      </motion.p>
    </motion.div>
  );
}
