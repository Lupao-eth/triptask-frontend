'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      try {
        const user = await getCurrentUser();

        if (user?.role === 'rider') {
          router.replace('/rider/dashboard');
        } else if (user?.role === 'customer') {
          router.replace('/customer/dashboard');
        } else {
          // No user → send to login
          router.replace('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login'); // Also go to login on error
      }
    }

    redirectUser();
  }, [router]);

  return (
    <div className="p-4 text-center">
      🔐 Checking session...
    </div>
  );
}
