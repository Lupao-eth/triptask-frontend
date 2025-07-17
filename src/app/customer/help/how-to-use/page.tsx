'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import TopBar from '@/app/customer/dashboard/TopBar';
import SideMenu from '@/app/customer/dashboard/SideMenu';
import { getAccessToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const slides = [
  { src: '/images/help/home-page.png', title: 'How to book' },
  { src: '/images/help/booknow.png', title: 'Input information' },
  { src: '/images/help/confirm.png', title: 'Booking Confirmation' },
  { src: '/images/help/bookstatus.png', title: 'Check booking status' },
  { src: '/images/help/chat.png', title: 'Communicate with rider' },
  { src: '/images/help/servicefee.png', title: 'Services fee settlement' },
  { src: '/images/help/bookhistory.png', title: 'View booking history' },
];

export default function HowToUsePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ✅ Auth check using Bearer token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAccessToken();
        if (!token) throw new Error('No token');
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        if (data.role !== 'customer') {
          router.push('/not-authorized');
          return;
        }
      } catch {
        router.push('/login');
      } finally {
        setTimeout(() => setIsLoading(false), 400); // Simulate loading
      }
    };
    checkAuth();
  }, [router]);

  const goNext = () => {
    if (slideIndex < slides.length - 1) setSlideIndex((i) => i + 1);
  };

  const goBack = () => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) goNext();
    if (diff < -50) goBack();
  };

  const toggleZoom = () => setZoomed((z) => !z);

  return (
    <div className="flex min-h-screen bg-white text-black" style={{ fontFamily: 'var(--font-geist-mono)' }}>
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
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-yellow-200 transition"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold">How to Use?</h1>
              </div>

              {/* Slide Title */}
              <h2 className="text-center text-xl font-semibold mb-2">
                {slides[slideIndex].title}
              </h2>

              {/* Slideshow */}
              <div
                className="flex flex-col items-center gap-4 transition duration-500"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-full max-w-md relative">
                  <img
                    src={slides[slideIndex].src}
                    alt={`Slide ${slideIndex + 1}`}
                    onClick={() => setPreviewSrc(slides[slideIndex].src)}
                    className="rounded-lg shadow-lg w-full cursor-pointer transition hover:scale-105"
                  />

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={goBack}
                      disabled={slideIndex === 0}
                      className="px-4 py-2 rounded bg-yellow-300 hover:bg-yellow-400 disabled:opacity-40 font-semibold"
                    >
                      <ChevronLeft className="inline mr-1" /> Back
                    </button>
                    <button
                      onClick={goNext}
                      disabled={slideIndex === slides.length - 1}
                      className="px-4 py-2 rounded bg-yellow-300 hover:bg-yellow-400 disabled:opacity-40 font-semibold"
                    >
                      Next <ChevronRight className="inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fullscreen Preview with Zoom */}
              {previewSrc && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex justify-center items-center transition">
                  <button
                    onClick={() => {
                      setPreviewSrc(null);
                      setZoomed(false);
                    }}
                    className="absolute top-4 right-4 text-white text-3xl"
                    aria-label="Close preview"
                  >
                    <X size={32} />
                  </button>
                  <img
                    src={previewSrc}
                    alt="Preview"
                    onClick={toggleZoom}
                    className={`rounded shadow-lg transition-transform duration-300 cursor-zoom-in ${
                      zoomed ? 'scale-150' : 'scale-100'
                    } max-w-full max-h-full`}
                    style={{ objectFit: 'contain' }}
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
