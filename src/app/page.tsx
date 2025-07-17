'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, loadTokensFromStorage } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTokensFromStorage(); // ✅ Ensure storage is available first
      setHydrated(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    async function redirectUser() {
      try {
        const user = await getCurrentUser();

        if (user?.role === 'rider') {
          router.replace('/rider/dashboard');
        } else if (user?.role === 'customer') {
          router.replace('/customer/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login');
      }
    }

    redirectUser();
  }, [hydrated, router]);

  return (
    <div className="p-4 text-center text-yellow-800 font-mono">
      Checking session...
    </div>
  );
}
