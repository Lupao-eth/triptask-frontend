'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';

type Task = { id: number; name: string; status: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE as string;

export default function ChatListPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    fetch(`${API_BASE}/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then((all: Task[]) =>
        setTasks(all.filter(t => ['accepted', 'on_the_way'].includes(t.status)))
      );
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pt-16 font-mono">
      <TopBar name={user?.name || ''} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <button className="fixed top-4 left-4" onClick={() => setMenuOpen(x => !x)}>☰</button>

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-1 text-black">Active Bookings</h1>
        <p className="text-center text-gray-500 mb-8">Select a booking to chat with a rider</p>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-400">No active bookings.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
              >
                <div className="text-lg font-semibold text-black">Booking #{task.id}</div>
                <button
                  onClick={() => router.push(`/customer/chat/${task.id}`)}
                  className="mt-4 bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600 transition"
                >
                  Chat with Rider
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
