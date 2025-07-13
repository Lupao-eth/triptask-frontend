'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { getAccessToken, loadTokensFromStorage, logoutUser } from '@/lib/api'
import TopBar from '../Topbar'
import Link from 'next/link'

export default function RiderDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    loadTokensFromStorage()

    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    const token = getAccessToken()
    if (!token) return router.push('/login')

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      logoutUser()
      router.push('/login')
    }
  }

  if (loading) return <div className="p-6 text-center font-mono text-black">🔄 Loading...</div>
  if (!user || user.role !== 'rider') return null

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-black">
      <TopBar />
      <main className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2">Rider Dashboard</h1>
        <p className="text-gray-700 mb-6">Welcome, {user.name || user.email}</p>

        <div className="grid gap-4">
          <Link
            href="/rider/available"
            className="block bg-white border rounded-xl p-4 shadow hover:bg-yellow-100 font-medium"
          >
            Available Bookings
          </Link>
          <Link
            href="/rider/active-bookings"
            className="block bg-white border rounded-xl p-4 shadow hover:bg-yellow-100 font-medium"
          >
            Active Bookings
          </Link>
          <Link
            href="/rider/active-bookings"
            className="block bg-white border rounded-xl p-4 shadow hover:bg-yellow-100 font-medium"
          >
            Chat
          </Link>
          <Link
            href="/rider/history"
            className="block bg-white border rounded-xl p-4 shadow hover:bg-yellow-100 font-medium"
          >
            Book History
          </Link>
          <Link
            href="/rider/admin"
            className="block bg-white border rounded-xl p-4 shadow hover:bg-yellow-100 font-medium"
          >
            Admin
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 font-semibold"
        >
          Logout
        </button>
      </main>
    </div>
  )
}
