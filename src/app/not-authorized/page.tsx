'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function NotAuthorized() {
  const router = useRouter();

  const handleBackToLogin = () => {
    // ✅ Clear tokens from storage
    localStorage.removeItem('triptask_token');
    localStorage.removeItem('triptask_refresh_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center border rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-red-500 w-12 h-12" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You are not authorized to view this page. If you believe this is a mistake,
          please return to login and contact support for assistance.
        </p>
        <button
          onClick={handleBackToLogin}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-full transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
