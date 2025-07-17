'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Loader2, Copy } from 'lucide-react';
import TopBar from '@/app/customer/dashboard/TopBar';
import SideMenu from '@/app/customer/dashboard/SideMenu';
import { useEffect, useState } from 'react';
import TawkLoader from '@/components/TawkLoader';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const SUPPORT_EMAIL = 'triptask0514@gmail.com';

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      show?: () => void;
      hide?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
  }
}

export default function HelpPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [profileName, setProfileName] = useState('User');
  const [copied, setCopied] = useState(false);
  const [tawkReady, setTawkReady] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('triptask_token');
      if (!savedToken) return router.push('/login');

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!res.ok) throw new Error('Invalid token');

        const data = await res.json();
        setProfileName(data?.user?.name || 'User');
        setTokenValid(true);
      } catch {
        router.push('/login');
      }
    };

    validateToken();
  }, [router]);

  useEffect(() => {
    if (tokenValid) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [tokenValid]);

  useEffect(() => {
    const handleTawkLoad = () => {
      if (window.Tawk_API?.hide) {
        window.Tawk_API.hide();
        setTawkReady(true);
        console.log('✅ Tawk widget hidden after load');
      }
    };

    if (typeof window !== 'undefined') {
      if (window.Tawk_API?.onLoad) {
        window.Tawk_API.onLoad = handleTawkLoad;
      } else {
        setTimeout(() => {
          if (window.Tawk_API?.hide) {
            window.Tawk_API.hide();
            setTawkReady(true);
          }
        }, 1000); // fallback if onLoad wasn't set early enough
      }
    }

    return () => {
      if (window.Tawk_API?.hide) {
        window.Tawk_API.hide();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTawk = () => {
    if (tawkReady && window.Tawk_API?.toggle) {
      window.Tawk_API.show?.();
      window.Tawk_API.toggle();
    } else {
      console.warn('❗ Tawk widget not ready yet');
    }
  };

  if (!tokenValid) return null;

  return (
    <div className="flex min-h-screen bg-white text-black" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <TawkLoader />
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="flex flex-col flex-1">
        <TopBar name={profileName} />
        <main className="flex-1 p-4 pt-24 md:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-yellow-200 transition"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold md:text-3xl">Help</h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => router.push('/customer/help/how-to-use')}
                  className="w-full max-w-md relative flex items-center justify-center px-4 py-3 bg-yellow-300 hover:bg-yellow-400 rounded-lg font-semibold shadow text-sm md:text-base"
                >
                  <span className="absolute left-1/2 transform -translate-x-1/2">How to use?</span>
                  <ChevronRight size={20} className="ml-auto" />
                </button>

                <button
                  onClick={() => router.push('/customer/help/add-to-home')}
                  className="w-full max-w-md relative flex items-center justify-center px-4 py-3 bg-yellow-300 hover:bg-yellow-400 rounded-lg font-semibold shadow text-sm md:text-base"
                >
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    How to add to home screen
                  </span>
                  <ChevronRight size={20} className="ml-auto" />
                </button>
              </div>

              {/* 💬 Contact Support */}
              <div className="mt-16 text-center bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Need Help?</h2>
                <p className="mb-4 text-gray-600 text-sm md:text-base">
                  If you have any questions, reach out to our support.
                </p>

                <button
                  onClick={openTawk}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-5 py-3 rounded-lg transition mb-4 w-full max-w-xs text-sm md:text-base"
                >
                  💬 Contact Us
                </button>

                <div className="text-sm text-gray-700 mt-2">
                  or email us at:
                  <div className="mt-2 inline-flex items-center bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm text-xs md:text-sm">
                    <span className="mr-2 truncate max-w-[160px]">{SUPPORT_EMAIL}</span>
                    <button
                      onClick={handleCopy}
                      className="text-blue-600 hover:text-blue-800 transition"
                      aria-label="Copy email"
                    >
                      <Copy size={16} />
                    </button>
                    {copied && <span className="ml-2 text-green-500">Copied!</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
