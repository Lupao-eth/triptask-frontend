'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage } from '@/lib/tokenStore'; // 👈 make sure it's imported

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTokensFromStorage(); // ✅ load tokens only after we're sure storage is ready
      setHydrated(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  if (!hydrated) {
    return null;
  }

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
