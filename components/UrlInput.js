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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourportfolio.com"
            disabled={loading}
            className="w-full px-6 py-4 bg-white dark:bg-white/10 backdrop-blur-sm border-2 border-gray-300 dark:border-white/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          />
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            type="button"
            onClick={() => setMode('roast')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              mode === 'roast'
                ? 'border-orange-500 bg-orange-500/20 dark:bg-orange-500/20 text-gray-900 dark:text-white shadow-orange-500/50'
                : 'border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-orange-500/50'
            }`}
          >
            <div className="text-3xl mb-2">😄</div>
            <div className="font-semibold">Roast Mode</div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMode('recruiter')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              mode === 'recruiter'
                ? 'border-blue-500 bg-blue-500/20 dark:bg-blue-500/20 text-gray-900 dark:text-white shadow-blue-500/50'
                : 'border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-blue-500/50'
            }`}
          >
            <div className="text-3xl mb-2">💼</div>
            <div className="font-semibold">Recruiter Mode</div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMode('brutal')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              mode === 'brutal'
                ? 'border-red-500 bg-red-500/20 dark:bg-red-500/20 text-gray-900 dark:text-white shadow-red-500/50'
                : 'border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-red-500/50'
            }`}
          >
            <div className="text-3xl mb-2">💀</div>
            <div className="font-semibold">Brutal Mode</div>
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white font-bold text-lg hover:shadow-xl hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Roasting...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
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
        className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6"
      >
        Your portfolio will be analyzed using AI. Results are saved for sharing.
      </motion.p>
    </motion.div>
  );
}
