'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from './TopBar';

type User = {
  id: string;
  email: string;
  name?: string;
  role: 'rider' | 'customer';
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigatingTask, setNavigatingTask] = useState(false);
  const [navigatingTrip, setNavigatingTrip] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();

        if (data.user.role !== 'customer') {
          router.push('/not-authorized');
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error('❗ Failed to fetch user:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleGoToTask = () => {
    setNavigatingTask(true);
    router.push('/customer/task');
  };

  const handleGoToTrip = () => {
    setNavigatingTrip(true);
    router.push('/customer/trip');
  };

  if (loading) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-yellow-100 text-yellow-800 font-mono px-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent" />
        <p className="text-lg sm:text-xl tracking-wide">Loading customer dashboard...</p>
      </div>
    </div>
  );
}

if (!user) return null;


  return (
    <main
      className="min-h-screen bg-gray-50 pt-20"
      style={{ fontFamily: 'var(--font-geist-mono)' }}
    >
      <TopBar name={user.name || 'Customer'} />

      <div className="flex flex-col items-center justify-center px-4 text-center mt-10 space-y-6">
        <h1 className="text-3xl font-bold tracking-wide text-black">TRIPTASK</h1>
        <p className="text-sm text-gray-600">CHOOSE YOUR SERVICE</p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={handleGoToTrip}
            className="w-full py-4 bg-yellow-300 text-yellow-900 font-semibold rounded-lg shadow hover:brightness-95 transition text-lg"
          >
            TRIP
            <p className="text-xs font-normal mt-1">
              {navigatingTrip ? 'Redirecting...' : 'This service is not available yet'}
            </p>
          </button>

          <button
            onClick={handleGoToTask}
            className="w-full py-4 bg-orange-500 text-white font-semibold rounded-lg shadow hover:bg-orange-600 transition text-lg"
          >
            TASK
            <p className="text-xs font-normal mt-1">
              {navigatingTask ? 'Redirecting...' : "YOU WANT IT, WE'LL FETCH IT"}
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
