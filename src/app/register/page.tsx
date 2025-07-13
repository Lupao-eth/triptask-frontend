'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      setMessage('❗ All fields are required.');
      return;
    }

    if (password !== confirm) {
      setMessage("❗ Passwords don't match.");
      return;
    }

    setMessage('✍️ Creating account...');
    setLoading(true);

    try {
      // Step 1: Register
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setMessage(`❌ ${registerData.message || 'Registration failed.'}`);
        return;
      }

      setMessage('✅ Account created! Logging in...');

      // Step 2: Auto-login after successful registration
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.token) {
        setMessage('✅ Account created, but login failed. Please login manually.');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      // Step 3: Save token to localStorage
      localStorage.setItem('triptask_token', loginData.token);

      // Step 4: Decode role and redirect
      const decoded = JSON.parse(atob(loginData.token.split('.')[1]));
      if (decoded.role === 'customer') {
        router.push('/customer/dashboard');
      } else if (decoded.role === 'rider') {
        router.push('/rider/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      setMessage('❗ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-orange-50 text-orange-900 font-mono px-4">
      <div className="w-full max-w-sm border border-orange-300 p-6 rounded-2xl shadow-md bg-white space-y-6 transition-opacity duration-700">
        <h1 className="text-2xl font-bold text-center">Sign Up to TripTask</h1>

        {message && (
          <div className="bg-orange-100 text-orange-800 p-2 rounded text-sm text-center border border-orange-300 animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              placeholder="e.g. David"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="e.g. david@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded text-white transition ${
              loading
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-orange-700">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
