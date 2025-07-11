'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import TopBar from '@/app/customer/dashboard/TopBar';
import SideMenu from '@/app/customer/dashboard/SideMenu';
import { useEffect, useState } from 'react';

export default function HelpPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay (e.g., fetching or animation)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400); // Adjust duration if needed
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex min-h-screen bg-white text-black"
      style={{ fontFamily: 'var(--font-geist-mono)' }}
    >
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="flex flex-col flex-1">
        <TopBar name="User" />
        <main className="flex-1 p-6 pt-24">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-yellow-200 transition"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold">Help</h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* How to Use */}
                <button
                  onClick={() => router.push('/customer/help/how-to-use')}
                  className="w-full max-w-md relative flex items-center justify-center px-6 py-4 bg-yellow-300 hover:bg-yellow-400 rounded-lg font-bold shadow transition"
                >
                  <span className="absolute left-1/2 transform -translate-x-1/2">
                    How to use?
                  </span>
                  <ChevronRight size={20} className="ml-auto" />
                </button>

                {/* How to Add to Home Screen */}
                <button
                  onClick={() => router.push('/customer/help/add-to-home')}
                  className="w-full max-w-md relative flex items-center justify-center px-6 py-4 bg-yellow-300 hover:bg-yellow-400 rounded-lg font-bold shadow transition"
                >
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    How to add to home screen
                  </span>
                  <ChevronRight size={20} className="ml-auto" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
