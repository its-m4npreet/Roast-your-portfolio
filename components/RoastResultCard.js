'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, ExternalLink } from 'lucide-react';
import { getScoreColor, getScoreEmoji, copyToClipboard, generateShareLinks } from '@/utils/helpers';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function RoastResultCard({ result }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  const score = Number(result.score) || 0;
  const clampedScore = Math.max(0, Math.min(100, score));
  const shareLinks = generateShareLinks(result);
  const screenshotSrc = result?.screenshot
    ? result.screenshot.startsWith('data:')
      ? result.screenshot
      : `data:image/jpeg;base64,${result.screenshot}`
    : null;

  const scoreLabel =
    clampedScore >= 85
      ? 'Elite'
      : clampedScore >= 70
      ? 'Strong'
      : clampedScore >= 50
      ? 'Improving'
      : 'Needs Work';

  const modeLabel = {
    roast: 'Roast Mode',
    recruiter: 'Recruiter Mode',
    brutal: 'Brutal Mode',
  };

  const createdAt = result.createdAt
    ? new Date(result.createdAt).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const highlightKeywords = [
    'portfolio',
    'projects',
    'design',
    'ui',
    'ux',
    'experience',
    'performance',
    'readability',
    'navigation',
    'content',
    'skills',
    'impact',
    'strong',
    'weak',
    'improve',
    'clear',
  ];

  const extractPoints = (text = '', limit = 4) =>
    Array.from(
      new Set(
        text
      .split(/\n|(?<=[.!?])\s+/)
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line) => line.length > 25)
      )
    ).slice(0, limit);

  const dedupeSuggestionText = (text = '') => {
    const seen = new Set();

    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => {
        const key = line.toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join('\n');
  };

  const renderHighlightedText = (text = '') => {
    const pattern = new RegExp(`(${highlightKeywords.join('|')})`, 'gi');

    return text.split('\n').map((line, lineIndex) => (
      <p key={`${lineIndex}-${line.slice(0, 12)}`} className="mb-3 last:mb-0">
        {line.split(pattern).map((part, index) => {
          const isMatch = highlightKeywords.includes(part.toLowerCase());
          return isMatch ? (
            <span
              key={`${lineIndex}-${index}`}
              className="text-orange-600 dark:text-orange-300 font-semibold"
            >
              {part}
            </span>
          ) : (
            <span key={`${lineIndex}-${index}`}>{part}</span>
          );
        })}
      </p>
    ));
  };

  const normalizedSuggestion = dedupeSuggestionText(result.suggestion || '');
  const keyPoints = extractPoints(normalizedSuggestion || result.roast);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await copyToClipboard(result.roast);
      toast.success('Roast copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const openShareLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleCopyShareLink = async () => {
    try {
      await copyToClipboard(shareLinks.link);
      toast.success('Share link copied!');
      setShowShareMenu(false);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Portfolio Score</h2>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-light tracking-widest text-gray-500 dark:text-white/30 hover:text-orange-500 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-2"
            >
              {result.url} <ExternalLink size={12} />
            </a>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[10px] px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 font-semibold tracking-widest uppercase">
                {modeLabel[result.mode] || 'Roast Mode'}
              </span>
              {createdAt && (
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/45 bg-gray-100/70 dark:bg-transparent font-medium tracking-wide">
                  {createdAt}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ opacity: 0.8 }}
              whileTap={{ opacity: 0.9 }}
              onClick={handleCopy}
              className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/10 transition-colors"
              title="Copy roast"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-white/50" />
            </motion.button>
            <div className="relative" ref={shareMenuRef}>
              <motion.button
                whileHover={{ opacity: 0.8 }}
                whileTap={{ opacity: 0.9 }}
                onClick={() => setShowShareMenu((prev) => !prev)}
                className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/10 transition-colors"
                title="Share result"
              >
                <Share2 className="w-4 h-4 text-gray-600 dark:text-white/50" />
              </motion.button>

              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-52 rounded-2xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f0f0f] shadow-xl p-2 z-20"
                >
                  <button
                    onClick={handleCopyShareLink}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    🔗 Copy Link
                  </button>
                  <button
                    onClick={() => openShareLink(shareLinks.x)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    𝕏 Share on X
                  </button>
                  <button
                    onClick={() => openShareLink(shareLinks.linkedin)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    💼 Share on LinkedIn
                  </button>
                  <button
                    onClick={() => openShareLink(shareLinks.facebook)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    📘 Share on Facebook
                  </button>
                  <button
                    onClick={() => openShareLink(shareLinks.whatsapp)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    💬 Share on WhatsApp
                  </button>
                  <button
                    onClick={() => openShareLink(shareLinks.reddit)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    👽 Share on Reddit
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black/30 p-5 text-center"
          >
            <div className={`text-6xl leading-none font-black ${getScoreColor(clampedScore)}`}>
              {clampedScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-white/45 mt-2 tracking-widest uppercase">out of 100</div>
            <div className="mt-4 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] text-orange-300 font-semibold tracking-widest uppercase">
              {scoreLabel}
            </div>
            <div className="mt-3 text-2xl">{getScoreEmoji(clampedScore)}</div>
          </motion.div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs tracking-widest uppercase">
              <span className="text-gray-500 dark:text-white/45">Score Progress</span>
              <span className="text-gray-700 dark:text-white/70 font-semibold">{clampedScore}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
                style={{ width: `${clampedScore}%` }}
              />
            </div>
            <div className="grid grid-cols-4 text-[10px] tracking-wider uppercase text-gray-500 dark:text-white/35">
              <span>Needs work</span>
              <span className="text-center">Fair</span>
              <span className="text-center">Strong</span>
              <span className="text-right">Elite</span>
            </div>
            <div className="text-[11px] tracking-wide text-gray-600 dark:text-white/40">
              This score combines content quality, design clarity, and recruiter readiness.
            </div>
          </div>
        </div>

      </motion.div>

      {/* Roast Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8"
      >
        <h3 className="text-lg font-black tracking-widest uppercase text-gray-800 dark:text-white/80 mb-6 flex items-center gap-2">
          🔥 The Roast
        </h3>
        <div className="text-gray-700 dark:text-white/60 text-base leading-relaxed whitespace-pre-wrap font-light tracking-wide">
          {renderHighlightedText(result.roast)}
        </div>
      </motion.div>

      {/* Suggestions Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8"
      >
        <h3 className="text-lg font-black tracking-widest uppercase text-gray-800 dark:text-white/80 mb-6 flex items-center gap-2">
          💡 Suggestions
        </h3>
        {keyPoints.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
            <p className="text-[11px] mb-3 text-orange-300 font-semibold tracking-widest uppercase">
              Key Points
            </p>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={`${index}-${point.slice(0, 10)}`} className="text-sm text-gray-700 dark:text-white/70 leading-relaxed flex gap-2">
                  <span className="text-orange-500 dark:text-orange-300 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="text-gray-700 dark:text-white/60 text-base leading-relaxed whitespace-pre-wrap font-light tracking-wide">
          {renderHighlightedText(normalizedSuggestion || result.suggestion)}
        </div>
      </motion.div>

      {/* Screenshot Card */}
      {screenshotSrc && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8"
        >
          <h3 className="text-lg font-black tracking-widest uppercase text-gray-800 dark:text-white/80 mb-6 flex items-center gap-2">
            📸 Screenshot
          </h3>
          <div className="relative w-full h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <Image
              src={screenshotSrc}
              alt="Portfolio screenshot"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-top"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
