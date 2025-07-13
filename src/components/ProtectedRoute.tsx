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
      try {
        console.log('🔄 ProtectedRoute: loading tokens from storage...');
        loadTokensFromStorage();

        console.log('🔍 ProtectedRoute: checking current user...');
        const user: AuthUser | null = await getCurrentUser();

        if (!user) {
          console.warn('⛔ ProtectedRoute: No user found, redirecting to /login...');
          router.replace('/login');
        } else {
          console.log('✅ ProtectedRoute: User authenticated:', user);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ ProtectedRoute error:', err);
        router.replace('/login');
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="p-4 text-center text-yellow-700 font-mono">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
