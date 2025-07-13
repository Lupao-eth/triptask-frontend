'use client';

import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage } from '@/lib/api';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    loadTokensFromStorage();
  }, []);

  return (
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
    >
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
