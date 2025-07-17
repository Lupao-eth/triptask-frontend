'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  loadTokensFromStorage,
  setTokens,
} from '@/lib/api';
import { useUser } from '@/context/UserContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser(); // ✅ from context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      setMessage('❗ Please fill in all fields.');
      return;
    }

    setLoading(true);
    setMessage('🔐 Logging in...');

    try {
      console.log('🔐 LoginPage: sending login request for', email);
      const res = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('🔐 LoginPage: login response', data);

      if (!res.ok || !data.token) {
        setMessage(`❌ ${data.message || 'Login failed. Try again.'}`);
        setLoading(false);
        return;
      }

      // Save in-memory tokens
      setTokens({
        access: data.token,
        refresh: data.refreshToken,
      });

      // Save to storage
      if (rememberMe) {
        localStorage.setItem('triptask_token', data.token);
        localStorage.setItem('triptask_refresh_token', data.refreshToken || '');
        sessionStorage.removeItem('triptask_token');
        sessionStorage.removeItem('triptask_refresh_token');
        console.log('🔐 LoginPage: tokens saved to localStorage and sessionStorage cleared');
      } else {
        sessionStorage.setItem('triptask_token', data.token);
        sessionStorage.setItem('triptask_refresh_token', data.refreshToken || '');
        localStorage.removeItem('triptask_token');
        localStorage.removeItem('triptask_refresh_token');
        console.log('🔐 LoginPage: tokens saved to sessionStorage and localStorage cleared');
      }

      // Load tokens into memory again and fetch user
      loadTokensFromStorage();
      const freshUser = await getCurrentUser();

      if (freshUser) {
        console.log('✅ LoginPage: loaded user after login →', freshUser);
        setUser(freshUser); // ✅ set in context
      } else {
        console.warn('⚠️ LoginPage: no user found after login');
        setMessage('❌ Login succeeded, but user not found.');
        return;
      }

      setMessage('✅ Login successful! Redirecting...');

      // Redirect based on role
      const role = freshUser.role;
      if (role === 'rider') {
        router.push('/rider/dashboard');
      } else if (role === 'customer') {
        router.push('/customer/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('❌ LoginPage error:', err);
      setMessage('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-yellow-500 border-yellow-300 rounded focus:ring-yellow-400"
              disabled={loading}
            />
            <label htmlFor="remember" className="text-sm select-none">
              Remember Me
            </label>
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
      </div>
    </main>
  );
}
