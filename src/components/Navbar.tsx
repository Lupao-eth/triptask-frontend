'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from '../lib/api';

type User = {
  id: number;
  email: string;
  role: 'rider' | 'customer';
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((authUser) => {
      if (
        authUser &&
        (authUser.role === 'rider' || authUser.role === 'customer')
      ) {
        setUser({
          id: parseInt(authUser.id, 10), // Convert string ID to number
          email: authUser.email,
          role: authUser.role,
        });
      } else {
        setUser(null); // unsupported role like "admin" or unauthenticated
      }
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 px-6 py-3 shadow">
      <div className="font-bold text-lg">TripTask</div>
      {user && (
        <div className="flex gap-4 items-center">
          <span>
            {user.email} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
