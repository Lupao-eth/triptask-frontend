'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { UserProvider } from '@/context/UserContext';
import { loadTokensFromStorage } from '@/lib/api'; // ✅ Add this

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TripTask',
  description: 'Your booking assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    loadTokensFromStorage(); // ✅ Load token into memory immediately
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{ duration: 3000 }}
          />
        </UserProvider>
      </body>
    </html>
  );
}
