'use client';

import {
  getCurrentUser,
  loadTokensFromStorage,
  logoutUser,
} from '../lib/api';
import { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: string;
  email: string;
  name?: string;
  role: 'rider' | 'customer';
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

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        loadTokensFromStorage();
        const u = await getCurrentUser();

        if (u && (u.role === 'rider' || u.role === 'customer')) {
          const safeUser: User = {
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
          };
          setUser(safeUser);
          console.log('✅ UserContext loaded user:', safeUser);
        } else {
          console.warn('🚫 Invalid or missing user role:', u?.role);
          logout();
        }
      } catch (err) {
        console.error('❌ UserContext: Failed to fetch user', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
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
