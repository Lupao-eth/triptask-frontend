'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const slides = [
  { src: '/images/help/home-page.png', title: 'How to book' },
  { src: '/images/help/booknow.png', title: 'Input information' },
  { src: '/images/help/confirm.png', title: 'Booking Confirmation' },
  { src: '/images/help/bookstatus.png', title: 'Check booking status' },
  { src: '/images/help/chat.png', title: 'Communicate with rider' },
  { src: '/images/help/servicefee.png', title: 'Services fee settlement' },
  { src: '/images/help/bookhistory.png', title: 'View booking history' },
  { src: '/images/help/Android.png', title: 'Add to Home Screen (Android)' },
  { src: '/images/help/iphone.png', title: 'Add to Home Screen (iPhone)' },
];

export default function TutorialModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);

  // 🧹 Removed useEffect that did token/role checking

  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 100);
    return () => clearTimeout(timer);
  }, [index]);

  const goNext = () => {
    if (index < slides.length - 1) setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) goBack();
    if (deltaX < -50) goNext();
    touchStartX.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.001)));
  };

  const resetZoom = () => setZoom(1);

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4 transition-opacity duration-300">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-2xl max-w-md w-full p-6 pt-12 text-center shadow-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-100 transition-all duration-300 scale-100"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">How to use?</h2>
          <p className="text-sm text-gray-600 mb-4">{slides[index].title}</p>

          <div className="relative flex items-center justify-center">
            <img
              src={slides[index].src}
              alt={slides[index].title}
              onClick={() => setPreviewOpen(true)}
              className={clsx(
                'cursor-zoom-in rounded-lg shadow-lg max-h-[300px] object-contain mx-auto transition-opacity duration-300',
                fade ? 'opacity-100' : 'opacity-0'
              )}
            />

            <button
              onClick={goBack}
              disabled={index === 0}
              className="absolute left-[-36px] top-1/2 transform -translate-y-1/2 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-40 p-2 rounded-full shadow transition"
            >
              <ChevronLeft size={20} className="text-black" />
            </button>

            <button
              onClick={goNext}
              disabled={index === slides.length - 1}
              className="absolute right-[-36px] top-1/2 transform -translate-y-1/2 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-40 p-2 rounded-full shadow transition"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          </div>

          <button
            onClick={() => window.open('/customer/help', '_blank')}
            className="mt-6 w-full bg-gray-800 hover:bg-black text-white py-2 rounded-lg font-semibold transition"
          >
            Go to Help
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg font-semibold transition"
          >
            Don&apos;t show again
          </button>
        </div>
      </div>

      {/* Fullscreen Preview */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center px-4">
          <div
            className="relative w-full h-full max-w-5xl flex items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onClick={resetZoom}
          >
            <button
              onClick={() => {
                setPreviewOpen(false);
                resetZoom();
              }}
              className="absolute top-6 right-6 text-white hover:text-yellow-300 transition z-10"
              aria-label="Close Fullscreen"
            >
              <X size={32} />
            </button>

            <img
              src={slides[index].src}
              alt={slides[index].title}
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out',
              }}
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
