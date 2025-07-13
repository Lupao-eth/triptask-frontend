'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type User = {
  id: number;
  email: string;
  name?: string;
  role: 'rider' | 'customer';
};

type Task = {
  id: number;
  name: string;
  task: string;
  pickup: string;
  dropoff: string;
  datetime: string;
  notes: string;
  status: string;
};

const BookHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>('completed');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('triptask_token');
      if (!token) return (window.location.href = '/login');

      try {
        const userRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          window.location.href = '/login';
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        const taskRes = await fetch(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!taskRes.ok) throw new Error('Failed to fetch tasks');
        const taskData = await taskRes.json();
        setTasks(taskData);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = tasks.filter((task) => task.status === activeTab);

  return (
    <main className="min-h-screen bg-gray-50 pt-16 font-mono">
      <TopBar name={user?.name || 'Customer'} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <button
        className="fixed top-4 left-4 z-50 text-2xl text-black"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        &#9776;
      </button>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto text-black">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Booking History</h1>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-l-md ${
              activeTab === 'completed'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-r-md ${
              activeTab === 'cancelled'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-gray-500">🔄 Loading...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500">No {activeTab} tasks found.</div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-md p-4 space-y-2"
              >
                <div className="text-sm text-gray-600">Booking ID: #{task.id}</div>
                <div
                  className={`font-bold ${
                    task.status === 'completed'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  Status: {task.status}
                </div>
                <div><strong>Name:</strong> {task.name}</div>
                <div><strong>Pickup:</strong> {task.pickup}</div>
                <div><strong>Drop-off:</strong> {task.dropoff}</div>
                <div><strong>Schedule:</strong> {task.datetime}</div>
                <div><strong>Task:</strong> {task.task}</div>
                <div><strong>Notes:</strong> {task.notes || 'None'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BookHistory;
