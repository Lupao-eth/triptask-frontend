'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from './TopBar';
import TutorialModal from './TutorialModal';
import TermsModal from './TermsModal';
import { getAccessToken } from '@/lib/api';

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
  const [showTerms, setShowTerms] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [navigatingTask, setNavigatingTask] = useState(false);
  const [navigatingTrip, setNavigatingTrip] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAccessToken(); // ✅ Get token from memory/storage

      console.log('🔍 useEffect triggered');
      console.log('🧪 Token from getAccessToken:', token);

      if (!token) {
        console.warn('❌ No token found. Redirecting to /login...');
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('📡 /auth/me response status:', res.status);

        if (!res.ok) {
          throw new Error(`Unauthorized (HTTP ${res.status})`);
        }

        const data = await res.json();
        console.log('✅ User data from /auth/me:', data);

        if (data.user.role !== 'customer') {
          console.warn('⛔ User role is not customer. Redirecting to /not-authorized...');
          router.push('/not-authorized');
          return;
        }

        setUser(data.user);
        setLoading(false);

        const seenTerms = localStorage.getItem('seenTerms');
        const seenTutorial = localStorage.getItem('seenTutorial');

        if (!seenTerms) {
          console.log('📄 Showing terms modal');
          setShowTerms(true);
        } else if (!seenTutorial) {
          console.log('🎥 Showing tutorial modal');
          setShowTutorial(true);
        }
      } catch (err) {
        console.error('❗ Error during fetchUser:', err);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleAgreeToTerms = () => {
    console.log('✅ User agreed to terms');
    localStorage.setItem('seenTerms', 'true');
    setShowTerms(false);

    const seenTutorial = localStorage.getItem('seenTutorial');
    if (!seenTutorial) {
      console.log('🎥 Showing tutorial modal after agreeing to terms');
      setShowTutorial(true);
    }
  };

  const handleGoToTask = () => {
    console.log('➡️ Navigating to /customer/task');
    setNavigatingTask(true);
    router.push('/customer/task');
  };

  const handleGoToTrip = () => {
    console.log('➡️ Navigating to /customer/trip');
    setNavigatingTrip(true);
    router.push('/customer/trip');
  };

  if (loading) {
    console.log('⏳ Still loading...');
    return (
      <div className="flex items-center justify-center h-screen w-full bg-yellow-100 text-yellow-800 font-mono px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent" />
          <p className="text-lg sm:text-xl tracking-wide">Loading customer dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('👻 No user found after loading');
    return null;
  }

  return (
    <main
      className="min-h-screen bg-gray-50 pt-20 relative"
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

      {showTerms && <TermsModal onAgree={handleAgreeToTerms} />}

      {showTutorial && (
        <TutorialModal
          onClose={() => {
            console.log('✅ Tutorial finished');
            localStorage.setItem('seenTutorial', 'true');
            setShowTutorial(false);
          }}
        />
      )}
    </main>
  );
}
