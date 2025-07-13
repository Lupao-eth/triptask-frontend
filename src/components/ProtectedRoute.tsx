'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, loadTokensFromStorage } from '@/lib/api';
import type { AuthUser } from '@/lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      // ✅ Ensure tokens are loaded (from localStorage to memory)
      loadTokensFromStorage();

      const user: AuthUser | null = await getCurrentUser();
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

  if (loading) {
    return (
      <div className="p-4 text-center text-yellow-700 font-mono">
        🔐 Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
