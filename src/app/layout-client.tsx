'use client';

import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/context/UserContext';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
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
