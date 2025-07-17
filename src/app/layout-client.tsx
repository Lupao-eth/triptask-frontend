'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage, getAccessToken, logoutUser } from '@/lib/api';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 🔍 Intercept all blob creations globally
    if (typeof window !== 'undefined') {
      const originalCreateObjectURL = URL.createObjectURL;

      URL.createObjectURL = function (blob) {
        const url = originalCreateObjectURL.call(URL, blob);
        console.log('🧨 Blob created:', url);
        console.trace('👣 Blob created here');
        return url;
      };
    }
  }, []);

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
