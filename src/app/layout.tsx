// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { UserProvider } from '@/context/UserContext'; // ✅ Add this

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider> {/* ✅ WRAPPING HERE */}
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
