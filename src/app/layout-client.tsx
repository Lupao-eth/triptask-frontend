'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // ✅ Optional delay to let localStorage/sessionStorage sync properly
    const timeout = setTimeout(() => {
      setHydrated(true);
    }, 10); // Delay in milliseconds (adjust as needed)

    return () => clearTimeout(timeout);
  }, []);

  if (!hydrated) {
    return null; // ⏳ Prevent premature render until hydration is ready
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
