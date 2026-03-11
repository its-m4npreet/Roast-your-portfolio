'use client';

import { motion } from 'framer-motion';
import { Copy, Share2, ExternalLink, Award } from 'lucide-react';
import { getScoreColor, getScoreEmoji, copyToClipboard, generateShareUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function RoastResultCard({ result }) {
  const handleCopy = async () => {
    try {
      await copyToClipboard(result.roast);
      toast.success('Roast copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleShare = () => {
    const shareUrl = generateShareUrl(result);
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Portfolio Score</h2>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors inline-flex items-center gap-2"
            >
              {result.url} <ExternalLink size={16} />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-xl border border-gray-300 dark:border-white/20 transition-colors"
              title="Copy roast"
            >
              <Copy className="w-5 h-5 text-gray-900 dark:text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-xl border border-gray-300 dark:border-white/20 transition-colors"
              title="Share result"
            >
              <Share2 className="w-5 h-5 text-gray-900 dark:text-white" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative"
          >
            <div className="w-48 h-48 rounded-full border-4 border-orange-500 bg-white dark:bg-black flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-4xl mt-2">{getScoreEmoji(result.score)}</div>
                </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-4 -right-4"
            >
              <Award className="w-12 h-12 text-yellow-500" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Roast Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🔥 The Roast
        </h3>
        <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
          {result.roast}
        </div>
      </motion.div>

      {/* Suggestions Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          💡 Suggestions
        </h3>
        <div className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
          {result.suggestion}
        </div>
      </motion.div>

      {/* Screenshot Card */}
      {result.screenshot && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/80 dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📸 Screenshot
          </h3>
          <div className="relative w-full h-96 rounded-xl overflow-hidden border border-gray-300 dark:border-white/10">
            <img
              src={`data:image/jpeg;base64,${result.screenshot}`}
              alt="Portfolio screenshot"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
