'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';
import { loadTokensFromStorage } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function TripServicePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const tokens = loadTokensFromStorage();
      const token = tokens?.accessToken;

      if (!token) {
        console.warn('❌ No valid token found or token expired');
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user info');

        const data = await res.json();
        const user = data.user;

        if (user.role !== 'customer') {
          return router.replace('/login');
        }

        setUserName(user.name);
      } catch (err) {
        console.error('❌ Auth error:', err);
        return router.replace('/login');
      } finally {
        setTimeout(() => {
          setFadeIn(true);
          setLoading(false);
        }, 400); // slight delay for smoother transition
      }
    };

    checkAuth();
  }, [router]);

  // ✅ Loading screen with spinner
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white text-black z-50 transition-opacity duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-mono">Authenticating...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-white font-mono transition-opacity duration-700 ease-in-out">
      <TopBar name={userName || 'Customer'} />
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
