'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext'; // make sure path is correct

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.warn('⛔ ProtectedRoute: No user found, redirecting to /login...');
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="p-4 text-center text-yellow-700 font-mono">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
