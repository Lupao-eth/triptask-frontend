'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('❗ Please fill in all fields.');
      return;
    }

    setLoading(true);
    setMessage('Logging in...');

    try {
      const user = await loginUser(email, password, rememberMe);
      console.log('🔐 Login response:', user);

      if (user) {
        // ✅ Check if session is really established
        const check = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (check.ok) {
          setMessage('✅ Login & session established! Redirecting...');

          const redirectTo =
            user.role === 'rider'
              ? '/rider/dashboard'
              : '/customer/dashboard';

          setTimeout(() => {
            window.location.href = redirectTo;
          }, 300);
        } else {
          setMessage('⚠️ Login succeeded but session not established.');
          console.warn('⚠️ Session cookie not working. Check cross-site cookie settings.');
        }
      } else {
        setMessage('❌ Login failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage('❌ Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50 text-yellow-900 font-mono px-4">
      <div className="w-full max-w-sm border border-yellow-300 p-6 rounded-2xl shadow-md bg-white space-y-6 transition-opacity duration-700">
        <h1 className="text-2xl font-bold text-center">Login to TripTask</h1>

        {message && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm text-center border border-yellow-300 animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="e.g. user@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-yellow-500 border-yellow-300 rounded focus:ring-yellow-400"
            />
            <label htmlFor="remember" className="text-sm">
              Remember Me
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 font-semibold rounded transition text-white ${
              loading
                ? 'bg-yellow-300 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
            disabled={loading}
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
      </div>
    </main>
  );
}
