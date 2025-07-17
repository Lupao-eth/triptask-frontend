'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage, getAccessToken, logoutUser } from '@/lib/api';

// Extend the Window interface to add our custom property
declare global {
  interface Window {
    __blobLoggerPatched?: boolean;
  }
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  // 🔍 Global Blob creation logger with full trace
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__blobLoggerPatched) {
      window.__blobLoggerPatched = true;

      const originalCreateObjectURL = URL.createObjectURL;

      URL.createObjectURL = function (blob: Blob | MediaSource) {
        const url = originalCreateObjectURL.call(URL, blob);

        console.groupCollapsed('🧨 Blob created');
        console.log('📎 Blob URL:', url);

        // ✅ Type guard to safely access `type` if it's a Blob
        if (blob instanceof Blob) {
          console.log('📄 Blob Type:', blob.type || 'unknown');
        } else {
          console.log('📄 MediaSource blob (no type)');
        }

        console.trace('👣 Stack Trace');
        console.groupEnd();

        return url;
      };
    }
  }, []);

  // 🔐 Token check on mount or path change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!pathname.startsWith('/login')) {
        loadTokensFromStorage();
        const token = getAccessToken();

        if (!token) {
          logoutUser(); // ⛔ No token or expired — logout only if not logging in
        }
      }

      setHydrated(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!hydrated) return null;

  return (
    <body className="antialiased bg-white text-black">
      <UserProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-geist-mono)',
            },
          }}
        />
      </UserProvider>
    </body>
  );
}
