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

  // 🔐 Token check on mount or path change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!pathname.startsWith('/login')) {
        loadTokensFromStorage();
        const token = getAccessToken();

        if (!token) {
          logoutUser();
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
