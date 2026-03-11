import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import UrlInput from '@/components/UrlInput';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <div className="relative z-20 py-12 px-4">
        <UrlInput />
      </div>
    </div>
  );
}

