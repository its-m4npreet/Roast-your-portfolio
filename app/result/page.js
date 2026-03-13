'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RoastResultCard from '@/components/RoastResultCard';
import SkeletonLoader from '@/components/SkeletonCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No result ID provided');
      setLoading(false);
      return;
    }

    async function fetchResult() {
      try {
        const response = await fetch(`/api/roast?id=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch result');
        }

        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-white/50 text-sm tracking-wide font-light mb-8">{error || 'Result not found'}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-white/30 hover:text-gray-900 dark:hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </motion.div>

        <RoastResultCard result={result} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
          >
            Roast Another Portfolio
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <SkeletonLoader />
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
