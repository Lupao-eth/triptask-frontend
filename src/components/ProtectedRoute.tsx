'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      console.log('🔐 ProtectedRoute user:', user);

      if (!user) {
        console.warn('⛔ No user found, redirecting to /login...');
        router.replace('/login');
      } else {
        console.log('✅ User authenticated:', user);
        setLoading(false); // Allow children to render
      }
    }

    checkAuth();
  }, [router]);

  if (loading) return <div className="p-4 text-center">🔐 Checking auth...</div>;

  return <>{children}</>;
}
