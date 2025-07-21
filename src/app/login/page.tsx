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
  const [showPassword, setShowPassword] = useState(false);
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

          <div className="relative">
            <label className="block mb-1 font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[55%] -translate-y-1/2 text-yellow-600 hover:text-yellow-800 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye off icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.06 10.06 0 012.362-4.036m2.122-1.97A9.964 9.964 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.965 9.965 0 01-1.357 2.572M15 12a3 3 0 00-3-3m0 0a3 3 0 013 3m0 0a3 3 0 01-3 3m-9-3L3 3m0 0l18 18" />
                </svg>
              ) : (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
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
