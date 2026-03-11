import SkeletonLoader from '@/components/SkeletonCard';
import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-orange-900">
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <SkeletonLoader />
      </div>
    </div>
  );
}
