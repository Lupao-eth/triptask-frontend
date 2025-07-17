'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import TopBar from '@/app/customer/dashboard/TopBar';
import SideMenu from '@/app/customer/dashboard/SideMenu';
import { getAccessToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function AddToHomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Verify token and user role
  useEffect(() => {
    const verifyUser = async () => {
      const token = getAccessToken();
      if (!token) return router.push('/login');

      try {
        const res = await fetch(`${API_BASE}/auth/token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();

        const decoded = JSON.parse(atob(data.token.split('.')[1]));
        if (decoded.role !== 'customer') {
          return router.push('/not-authorized');
        }
      } catch {
        router.push('/login');
      } finally {
        setTimeout(() => setIsLoading(false), 400);
      }
    };

    verifyUser();
  }, [router]);

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
              {/* Title and back */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-yellow-200 transition"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold">Add to Home Screen</h1>
              </div>

              {/* Android instructions */}
              <p className="mb-2 font-semibold">For Android (Chrome):</p>
              <ul className="list-disc ml-6 mb-4 text-sm">
                <li>Open the TripTask website in Chrome</li>
                <li>Tap the 3-dot menu in the top-right</li>
                <li>Select <strong>Add to Home screen</strong></li>
              </ul>
              <img
                src="/images/help/Android.png"
                alt="Android Add to Home"
                className="w-full max-w-sm rounded-lg shadow cursor-pointer mb-6"
                onClick={() => setPreviewSrc('/images/help/Android.png')}
              />

              {/* iOS instructions */}
              <p className="mb-2 font-semibold">For iOS (Safari):</p>
              <ul className="list-disc ml-6 text-sm">
                <li>Open the TripTask website in Safari</li>
                <li>Tap the Share button</li>
                <li>Select <strong>Add to Home Screen</strong></li>
              </ul>
              <img
                src="/images/help/iphone.png"
                alt="iPhone Add to Home"
                className="w-full max-w-sm rounded-lg shadow cursor-pointer mt-4"
                onClick={() => setPreviewSrc('/images/help/iphone.png')}
              />

              {/* Fullscreen Preview */}
              {previewSrc && (
                <div className="fixed inset-0 z-50 bg-black/20 flex justify-center items-center backdrop-blur-sm">
                  <button
                    onClick={() => setPreviewSrc(null)}
                    className="absolute top-4 right-4 text-white text-3xl"
                    aria-label="Close preview"
                  >
                    <X size={32} />
                  </button>
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-w-full max-h-full rounded shadow-lg"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
