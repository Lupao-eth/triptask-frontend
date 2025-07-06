'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';

export default function TripServicePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <main className="flex flex-col h-screen bg-white font-mono">
      <TopBar name="Customer" />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className={`text-center transition-opacity duration-700 ease-out ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Trip Service Not Available Yet
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto mb-6">
            We’re working hard to launch this feature. Please check back soon!
          </p>
          <button
            onClick={() => router.push('/customer/dashboard')}
            className="mt-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
