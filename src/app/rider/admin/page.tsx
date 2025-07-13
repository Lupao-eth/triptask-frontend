'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { getAccessToken } from '@/lib/api'
import TopBar from '../Topbar' // ✅ Adjust path if needed

export default function AdminPanel() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  // Redirect if not rider
  useEffect(() => {
    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  // Fetch service status
  useEffect(() => {
    const fetchStatus = async () => {
      const token = getAccessToken()
      if (!token) return router.replace('/login')

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/service-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch status')
        const data = await res.json()
        setIsOnline(data.isOnline)
      } catch (err) {
        console.error('❌ Failed to load service status:', err)
      }
    }

    fetchStatus()
  }, [router])

  const toggleStatus = async () => {
    const token = getAccessToken()
    if (!token) return router.replace('/login')

    try {
      setSaving(true)
      const newStatus = !isOnline

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/service-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isOnline: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')
      setIsOnline(newStatus)
    } catch (err) {
      console.error('❌ Failed to update status:', err)
      alert('Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || isOnline === null) {
    return <div className="p-6 font-mono text-black">🔄 Loading Admin Panel...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 font-mono text-black">
      <TopBar />
      <main className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <p className="mb-4">
          Service Status:{' '}
          <strong className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'Online' : 'Offline'}
          </strong>
        </p>

        <button
          onClick={toggleStatus}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Saving...' : isOnline ? 'Turn OFF' : 'Turn ON'}
        </button>
      </main>
    </div>
  )
}
