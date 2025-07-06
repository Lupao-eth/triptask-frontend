'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import TopBar from '../dashboard/TopBar';
import SideMenu from '../dashboard/SideMenu';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

type User = {
  id: number;
  email: string;
  name?: string;
  role: 'rider' | 'customer';
};

const TaskPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scheduleOption, setScheduleOption] = useState<'ASAP' | 'CUSTOM'>('ASAP');
  const [form, setForm] = useState({
    name: '',
    task: '',
    pickup: '',
    dropoff: '',
    datetime: '',
    notes: '',
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (!res.ok) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      if (data.user.role !== 'customer') {
        window.location.href = '/not-authorized';
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { name, task, pickup, dropoff, datetime } = form;

    if (!name || !task || !pickup || !dropoff || (scheduleOption === 'CUSTOM' && !datetime)) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setShowModal(true);
  };

  const confirmBooking = async () => {
    setShowModal(false);

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          datetime: scheduleOption === 'ASAP' ? 'ASAP' : form.datetime,
          status: 'pending',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`❌ ${error.message || 'Something went wrong'}`);
        return;
      }

      toast.success('✅ Task booked successfully!');
      setForm({ name: '', task: '', pickup: '', dropoff: '', datetime: '', notes: '' });
      setScheduleOption('ASAP');
      router.push('/customer/bookstatus');
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error('❌ Failed to submit task. Please try again.');
    }
  };

  if (loading || !user) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-yellow-100 text-yellow-800 font-mono px-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent" />
        <p className="text-lg sm:text-xl tracking-wide">Loading Task Page...</p>
      </div>
    </div>
  );
}


  return (
    <main className="min-h-screen bg-gray-50 pt-16" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <TopBar name={user.name || 'Customer'} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <button
        className="fixed top-4 left-4 z-50 text-2xl text-black"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        &#9776;
      </button>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto text-black">
        <div className="flex items-center justify-center relative mb-8">
          <button
            onClick={() => router.back()}
            className="absolute left-0 p-1 text-gray-700 hover:text-black"
            aria-label="Go back"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Task Booking</h1>
        </div>

        <form className="space-y-6 text-sm sm:text-base" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="What should we call you"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">What do you need?</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Kindly provide a description of the task"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Pick-Up Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Provide Pick-Up Exact Address"
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Drop-Off Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Provide Drop-Off Exact Address"
              value={form.dropoff}
              onChange={(e) => setForm({ ...form, dropoff: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Schedule and Timing</label>
            <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="schedule"
                  value="ASAP"
                  checked={scheduleOption === 'ASAP'}
                  onChange={() => setScheduleOption('ASAP')}
                />
                <span>ASAP</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="schedule"
                  value="CUSTOM"
                  checked={scheduleOption === 'CUSTOM'}
                  onChange={() => setScheduleOption('CUSTOM')}
                />
                <span>Select Date & Time</span>
              </label>
            </div>
            {scheduleOption === 'CUSTOM' && (
              <input
                type="datetime-local"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded"
                value={form.datetime}
                onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Notes to Rider (optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={2}
              placeholder="Special Notes to Rider"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <p className="text-xs text-gray-600 mt-1">
              Be informed that this service includes service fee.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-2/3 text-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded transition"
            >
              Book Now
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-black">
            <h2 className="text-xl font-semibold mb-4 text-center">Confirm Booking</h2>
            <p className="mb-4 text-sm text-center">
              Are you sure you want to book this task?<br /><br />
              Please note that once this booking is accepted, it cannot be canceled. This booking
              also incurs service fees, which will depend on your agreement with the rider. However,
              you may still cancel the booking if you don’t reach an agreement on the service fees
              during your initial discussion.
            </p>
            <div className="flex justify-center gap-4 flex-col sm:flex-row">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                onClick={confirmBooking}
              >
                Yes, Confirm
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded w-full sm:w-auto"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TaskPage;
