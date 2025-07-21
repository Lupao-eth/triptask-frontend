'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

// Allowed characters: letters with accents and spaces
const validNameRegex = /^[\p{L} ]+$/u;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateName = (input: string) => {
    if (!input) {
      setNameError('');
      return true;
    }

    if (!validNameRegex.test(input)) {
      if (/\d/.test(input)) {
        setNameError('❗ Name cannot contain numbers.');
      } else {
        setNameError('❗ Name must not contain symbols or special characters.');
      }
      return false;
    }

    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validateName(value)) {
      setName(value);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      setMessage('❗ All fields are required.');
      return;
    }

    if (!validateName(name)) {
      setMessage('❗ Invalid name format.');
      return;
    }

    if (password !== confirm) {
      setMessage("❗ Passwords don't match.");
      return;
    }

    setMessage('✍️ Creating account...');
    setLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setMessage(`❌ ${registerData.message || 'Registration failed.'}`);
        return;
      }

      setMessage('✅ Account created! Logging in...');

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.token) {
        setMessage('✅ Account created, but login failed. Please login manually.');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      localStorage.setItem('triptask_token', loginData.token);

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
              placeholder="e.g. José, María"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {nameError && (
              <p className="text-red-600 text-sm mt-1">{nameError}</p>
            )}
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

          {/* Password Field */}
          <div className="relative">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[58%] text-yellow-600 hover:text-yellow-800"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.964 9.964 0 012.816-6.936m1.562-1.562A9.964 9.964 0 0112 1c5.523 0 10 4.477 10 10 0 2.21-.714 4.244-1.914 5.897m-1.62 1.648l-14-14" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[58%] text-yellow-600 hover:text-yellow-800"
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.964 9.964 0 012.816-6.936m1.562-1.562A9.964 9.964 0 0112 1c5.523 0 10 4.477 10 10 0 2.21-.714 4.244-1.914 5.897m-1.62 1.648l-14-14" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded text-white transition ${
              loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
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
