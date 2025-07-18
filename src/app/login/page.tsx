'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, setTokens } from '@/lib/api';
import { useUser } from '@/context/UserContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      setMessage('❗ Please fill in all fields.');
      return;
    }

    setLoading(true);
    setMessage('Logging in...');

    try {
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        setMessage(`❌ ${data.message || 'Login failed. Try again.'}`);
        return;
      }

      const { token, refreshToken } = data;

      localStorage.setItem('triptask_token', token);
      localStorage.setItem('triptask_refresh_token', refreshToken || '');
      localStorage.removeItem('triptask_expire_at');

      setTokens({ access: token, refresh: refreshToken });

      const freshUser = await getCurrentUser();
      if (!freshUser) {
        setMessage('❌ Login succeeded, but user not found.');
        return;
      }

      setUser(freshUser);
      setMessage('Login successful! Redirecting...');

      const roleToPath: Record<string, string> = {
        rider: '/rider/dashboard',
        customer: '/customer/dashboard',
        admin: '/admin/dashboard',
      };

      router.push(roleToPath[freshUser.role] || '/');
    } catch (err) {
      console.error('❌ Login error:', err);
      setMessage('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpClick = () => {
    if (typeof window !== 'undefined' && typeof window.Tawk_API?.maximize === 'function') {
      window.Tawk_API.maximize();
      console.log('🟢 Tawk widget opened from Login');
      setHelpMessage('');
    } else {
      console.warn('❗ Tawk widget not ready');
      setHelpMessage('❗ Chat is still loading. Please wait a minute and try again.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50 text-yellow-900 font-mono px-4">
      <div className="w-full max-w-sm border border-yellow-300 p-6 rounded-2xl shadow-md bg-white space-y-6">
        <h1 className="text-2xl font-bold text-center">Login to TripTask</h1>

        {message && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm text-center border border-yellow-300 animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. user@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded text-white transition ${
              loading ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-center">
          Don’t have an account?{' '}
          <Link href="/register" className="underline hover:text-yellow-700">
            Sign up
          </Link>
        </p>

        <div className="text-center pt-2">
          <button
            onClick={handleHelpClick}
            className="text-sm text-blue-500 underline hover:text-blue-700"
          >
            Need help? Contact us
          </button>

          {helpMessage && (
            <div className="text-center text-sm text-red-500 mt-2 animate-pulse">
              {helpMessage}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
