'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

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

const BookStatus = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('triptask_token');
      if (!token) return router.push('/login');

      try {
        const userRes = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!userRes.ok) return router.push('/login');

        const userData = await userRes.json();
        setUser(userData.user);

        const taskRes = await fetch(`${API_BASE}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const taskData = await taskRes.json();

        const activeTasks = taskData.filter((task: Task) =>
          ['pending', 'accepted', 'on_the_way'].includes(task.status)
        );

        setTasks(activeTasks);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const cancelTask = async (id: number) => {
    const token = localStorage.getItem('triptask_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return alert('❌ Failed to cancel task');
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
      alert('❌ Error cancelling task');
    }
  };

  const updateTask = async () => {
    const token = localStorage.getItem('triptask_token');
    if (!token || !selectedTask) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedTask),
      });

      if (!res.ok) return alert('❌ Failed to update task');
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
      alert('❌ Error updating task');
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-block px-2 py-1 text-xs font-semibold rounded ';
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      on_the_way: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return base + (map[status] || 'bg-gray-100 text-gray-700');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-yellow-100 text-yellow-800 font-mono px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent" />
          <p className="text-lg sm:text-xl tracking-wide">Loading Book Status...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16 font-mono">
      <TopBar name={user?.name || 'Customer'} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto text-black">
        <div className="flex items-center gap-2 mb-6">
  <button
    onClick={() => router.push('/customer/dashboard')}
    className="text-yellow-600 hover:text-yellow-800 text-2xl font-bold px-2"
    aria-label="Go back"
  >
    {'<'}
  </button>
  <h1 className="text-2xl sm:text-3xl font-bold">Book Status</h1>
</div>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No active tasks found.</p>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-4 space-y-2">
                <div className="text-sm text-gray-600">Booking ID: #{task.id}</div>
                <div className={getStatusBadge(task.status)}>
                  {task.status.replace(/_/g, ' ')}
                </div>
                <div><strong>Name:</strong> {task.name}</div>
                <div><strong>Pickup:</strong> {task.pickup}</div>
                <div><strong>Drop-off:</strong> {task.dropoff}</div>
                <div><strong>Schedule:</strong> {task.datetime}</div>

                <div className="pt-2 flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                  >
                    {task.status === 'pending' ? 'Edit/View Details' : 'View Details'}
                  </button>

                  {task.status === 'pending' ? (
                    <button
                      onClick={() => cancelTask(task.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/customer/chat/${task.id}`)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                      Chat with Rider
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for task editing or viewing */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="relative bg-white text-black w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold p-1"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-center mb-4">Booking Details</h2>

            <div className="space-y-2 text-sm">
              <div><strong>Booking ID:</strong> #{selectedTask.id}</div>
              <div><strong>Status:</strong> {selectedTask.status.replace(/_/g, ' ')}</div>

              {selectedTask.status === 'pending' ? (
                <>
                  {['name', 'pickup', 'dropoff', 'datetime', 'notes'].map((field) => (
                    <div key={field}>
                      <label className="block font-semibold mb-1 capitalize">{field}</label>
                      {field === 'notes' ? (
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          rows={2}
                          value={selectedTask[field as keyof Task]}
                          onChange={(e) =>
                            setSelectedTask({ ...selectedTask, [field]: e.target.value })
                          }
                        />
                      ) : (
                        <input
                          type={field === 'datetime' ? 'datetime-local' : 'text'}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          value={selectedTask[field as keyof Task]}
                          onChange={(e) =>
                            setSelectedTask({ ...selectedTask, [field]: e.target.value })
                          }
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <button
                      className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                      onClick={() => setSelectedTask(null)}
                    >
                      Close
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={updateTask}
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div><strong>Task:</strong> {selectedTask.task}</div>
                  <div><strong>Notes:</strong> {selectedTask.notes || 'No notes'}</div>
                  <div className="pt-4 flex justify-end">
                    <button
                      className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                      onClick={() => setSelectedTask(null)}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookStatus;
