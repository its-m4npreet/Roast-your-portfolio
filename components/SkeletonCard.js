/**
 * Skeleton loading components using Tailwind CSS
 */

import { ImageIcon } from 'lucide-react';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-2/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  // Deterministic widths based on index to avoid Math.random() during render
  const widths = [90, 75, 85, 80, 70];
  
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded"
          style={{ width: `${widths[i % widths.length]}%` }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonScore() {
  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center animate-pulse">
      <div className="rounded-2xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black/30 p-5 text-center">
        <div className="h-14 w-24 mx-auto bg-gray-300 dark:bg-gray-700/50 rounded"></div>
        <div className="h-3 w-20 mx-auto mt-3 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
        <div className="h-6 w-24 mx-auto mt-4 bg-gray-300 dark:bg-gray-700/50 rounded-full"></div>
        <div className="h-6 w-8 mx-auto mt-3 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
          <div className="h-3 w-10 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="h-2 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
        </div>
        <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700/50 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700/50 animate-pulse flex items-center justify-center">
      <ImageIcon className="w-16 h-16 text-gray-500 dark:text-gray-600" />
    </div>
  );
}

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Score Skeleton */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <SkeletonScore />
      </div>

      {/* Roast Skeleton */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8">
        <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-1/4 mb-4 animate-pulse"></div>
        <SkeletonText lines={5} />
      </div>

      {/* Suggestions Skeleton */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8">
        <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-1/4 mb-4 animate-pulse"></div>
        <SkeletonText lines={4} />
      </div>

      {/* Screenshot Skeleton */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8">
        <div className="h-8 bg-gray-300 dark:bg-gray-700/50 rounded w-1/4 mb-4 animate-pulse"></div>
        <SkeletonImage />
      </div>
    </div>
  );
}
