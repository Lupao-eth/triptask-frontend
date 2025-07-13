'use client'

import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { logoutUser, getAccessToken } from '@/lib/api'

export default function TopBar() {
  const { user } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        console.warn('⚠️ No access token found during logout.')
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      logoutUser() // Clear from memory + localStorage
      router.push('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="w-full bg-yellow-400 p-4 flex justify-between items-center shadow-md">
      {/* Home Button with Icon */}
      <button
        onClick={() => router.push('/rider/dashboard')}
        className="flex items-center gap-2 text-white font-bold text-lg hover:text-yellow-100 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7m-9 13v-6h4v6m5-6h2a2 2 0 002-2V10a2 2 0 00-.586-1.414l-8-8a2 2 0 00-2.828 0l-8 8A2 2 0 003 10v5a2 2 0 002 2h2"
          />
        </svg>
        <span>Home</span>
      </button>

      {/* User Info + Logout */}
      <div className="flex items-center gap-4">
        <span className="text-white font-semibold">
          {user?.name || user?.email || 'Rider'}
        </span>
        <button
          onClick={handleLogout}
          className="bg-white text-yellow-500 px-4 py-1 rounded font-semibold hover:bg-yellow-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
