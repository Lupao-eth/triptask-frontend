'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loadTokensFromStorage, logoutUser } from '../lib/api';

export type User = {
  id: string;
  email: string;
  name?: string;
  role: 'rider' | 'customer'; // ✅ Only support these roles
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Logout helper to clear tokens and user state
  const logout = () => {
    logoutUser(); // clears tokens from storage and memory
    setUser(null);
  };

  useEffect(() => {
    try {
      loadTokensFromStorage(); // Load tokens from storage once on app init
    } catch (err) {
      console.warn('⚠️ loadTokensFromStorage threw error:', err);
    }

    getCurrentUser()
      .then((u) => {
        console.log('📦 Context received user:', u);

        if (u && (u.role === 'rider' || u.role === 'customer')) {
          setUser(u as User);
        } else {
          console.warn('🚫 Invalid role:', u?.role);
          setUser(null);
        }
      })
      .catch((err) => {
        console.error('❌ getCurrentUser failed in UserContext:', err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-yellow-100 text-yellow-800 font-mono">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-600 border-t-transparent" />
          <div className="text-lg tracking-wide">Loading session...</div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
