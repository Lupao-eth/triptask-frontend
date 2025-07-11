'use client';

import React, { useEffect } from 'react';
import {
  Home,
  CalendarCheck,
  MessageCircle,
  Clock,
  LogOut,
  MapPin,
  ClipboardList,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

type SideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const goTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-yellow-400 text-black shadow-xl transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40`}
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        <div className="p-5 border-b border-yellow-300 flex justify-between items-center">
          <span className="font-bold text-xl">Menu</span>
          <button onClick={onClose} className="text-3xl font-bold hover:text-yellow-700">
            &times;
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4 text-base">
          <button
            onClick={() => goTo('/customer/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <Home size={20} /> Home
          </button>

          <div className="px-4 pt-4 font-bold text-sm text-gray-800 uppercase tracking-wide">
            Book Now!
          </div>

          <button
            onClick={() => goTo('/customer/trip')}
            className="flex items-center gap-3 pl-12 pr-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <MapPin size={20} /> Trip
          </button>

          <button
            onClick={() => goTo('/customer/task')}
            className="flex items-center gap-3 pl-12 pr-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <ClipboardList size={20} /> Task
          </button>

          <button
            onClick={() => goTo('/customer/bookstatus')}
            className="flex items-center gap-3 px-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <CalendarCheck size={20} /> Book Status
          </button>

          <button
            onClick={() => goTo('/customer/chat')}
            className="flex items-center gap-3 px-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <MessageCircle size={20} /> Chat
          </button>

          <button
            onClick={() => goTo('/customer/book-history')}
            className="flex items-center gap-3 px-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <Clock size={20} /> Book History
          </button>

          <button
            onClick={() => goTo('/customer/help')}
            className="flex items-center gap-3 px-4 py-3 rounded hover:bg-yellow-300 transition"
          >
            <HelpCircle size={20} /> Help
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-yellow-300 rounded transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SideMenu;
