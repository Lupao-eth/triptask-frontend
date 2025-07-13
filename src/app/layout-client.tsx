'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage } from '@/lib/api';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    loadTokensFromStorage(); // ✅ Loads access/refresh tokens into memory on hydration
  }, []);

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
