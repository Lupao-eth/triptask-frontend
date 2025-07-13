'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, loadTokensFromStorage } from '../lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      try {
        // ✅ Load tokens into memory first (important for Safari/localStorage-based auth)
        loadTokensFromStorage();

        const user = await getCurrentUser();

        if (user?.role === 'rider') {
          router.replace('/rider/dashboard');
        } else if (user?.role === 'customer') {
          router.replace('/customer/dashboard');
        } else {
          router.replace('/login'); // No user or unknown role
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login');
      }
    }

    redirectUser();
  }, [router]);

  return (
    <div className="p-4 text-center text-yellow-800 font-mono">
      Checking session...
    </div>
  );
}
