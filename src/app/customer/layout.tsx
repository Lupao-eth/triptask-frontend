'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { getCurrentUser } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
let socket: Socket;

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [loadingBack, setLoadingBack] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Hydration guard
  useEffect(() => {
    const timeout = setTimeout(() => setHydrated(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  // ✅ Load token with 7-hour expiry check
  useEffect(() => {
    const storedToken = localStorage.getItem('triptask_token');
    const expireAt = localStorage.getItem('triptask_expire_at');

    const now = Date.now();
    const isExpired = expireAt && parseInt(expireAt) < now;

    if (isExpired) {
      console.warn('⚠️ Token expired. Logging out...');
      localStorage.removeItem('triptask_token');
      localStorage.removeItem('triptask_refresh_token');
      localStorage.removeItem('triptask_expire_at');
      router.replace('/login');
      return;
    }

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      console.log('🔓 Token loaded:', storedToken);
      setToken(storedToken);
    } else {
      console.warn('❌ No token found, redirecting to login...');
      router.replace('/login');
    }
  }, [router]);

  // ✅ Validate user when token is set
  useEffect(() => {
    const validateUser = async () => {
      if (!token) return;

      try {
        const user = await getCurrentUser();
        console.log('✅ Authenticated user:', user);
        setIsLoadingUser(false);
      } catch (err) {
        console.error('❌ Invalid token or auth failed:', err);
        router.replace('/login');
      }
    };

    validateUser();
  }, [token, router]);

  // ✅ Handle socket and status
  useEffect(() => {
    if (!token) return;

    const fetchInitialStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/service-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setServiceOnline(data.isOnline);
        setShowOverlay(true);
        if (data.isOnline) {
          overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 2000);
        }
      } catch (err) {
        console.error('❌ Failed to fetch initial status:', err);
        setServiceOnline(false);
        setShowOverlay(true);
      }
    };

    fetchInitialStatus();

    socket = io(API_BASE, {
      auth: { token },
      withCredentials: false,
    });

    socket.on('connect', () => {
      console.log('🟢 Connected to Socket.IO');
    });

    socket.on('service-status', ({ isOnline }: { isOnline: boolean }) => {
      console.log('📡 Real-time service status update:', isOnline);
      setServiceOnline(isOnline);
      setShowOverlay(true);
      if (isOnline) {
        overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 2000);
      }
    });

    socket.on('disconnect', () => {
      console.warn('🔌 Disconnected from Socket.IO');
    });

    return () => {
      socket.disconnect();
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, [token]);

  const handleRetryClick = async () => {
    if (!token) return;
    setLoadingRetry(true);
    try {
      const res = await fetch(`${API_BASE}/service-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServiceOnline(data.isOnline);
      setShowOverlay(true);
      if (data.isOnline) {
        overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 2000);
      }
      if (socket?.disconnected) socket.connect();
    } catch (err) {
      console.error('❌ Retry failed:', err);
    } finally {
      setTimeout(() => setLoadingRetry(false), 1000);
    }
  };

  const handleBackToLoginClick = () => {
    setLoadingBack(true);
    setTimeout(() => router.push('/login'), 800);
  };

  if (!hydrated || isLoadingUser) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-mono">
      <div className="flex flex-col items-center">
        <svg
          className="animate-spin h-12 w-12 text-yellow-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <p className="text-lg text-gray-600 animate-pulse">Authenticating your session...</p>
      </div>
    </div>
  );
}


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
                  onClick={handleRetryClick}
                  disabled={loadingRetry}
                  className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loadingRetry ? 'Retrying...' : 'Retry'}
                </button>
                <button
                  onClick={handleBackToLoginClick}
                  disabled={loadingBack}
                  className="px-5 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 transition disabled:opacity-50"
                >
                  {loadingBack ? 'Loading...' : 'Back to Login'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 🔽 Animations */}
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
