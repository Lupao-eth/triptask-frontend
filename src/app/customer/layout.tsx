'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

let socket: Socket;

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const router = useRouter();

  useEffect(() => {
    socket = io(API_BASE, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🟢 Connected to Socket.IO');
    });

    socket.on('serviceStatusUpdate', ({ isOnline }: { isOnline: boolean }) => {
      console.log('📡 Received service status update:', isOnline);
      setServiceOnline(isOnline);
      setShowOverlay(true);
      if (isOnline) {
        setTimeout(() => setShowOverlay(false), 2000);
      }
    });

    socket.on('disconnect', () => {
      console.warn('🔌 Disconnected from Socket.IO');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRetry = () => {
    setShowOverlay(true);
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div>
      {children}

      {showOverlay && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center px-6 animate-zoom-float">
          <h2 className="text-3xl font-bold text-yellow-500 mb-4 animate-pulse">TRIPTASK</h2>

          {serviceOnline === null ? (
            <p className="text-base text-gray-600 animate-fade-in">Checking service status...</p>
          ) : serviceOnline ? (
            <p className="text-lg font-semibold text-green-600 animate-bounce-in">Service is Online</p>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-600 animate-bounce-in">Service is Offline</p>
              <p className="text-sm text-gray-500 mt-2 animate-fade-in">Please try again later.</p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleRetry}
                  className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Retry
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="px-5 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }

        .animate-zoom-float {
          animation: zoomFloat 0.5s ease-out both;
        }

        .animate-bounce-in {
          animation: bounceIn 0.4s ease-out both;
        }

        .animate-pulse {
          animation: pulse 1.5s infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          60% {
            transform: translateY(-10px);
            opacity: 1;
          }
          80% {
            transform: translateY(5px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes zoomFloat {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
