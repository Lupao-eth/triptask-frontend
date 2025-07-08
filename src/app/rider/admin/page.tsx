'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import TopBar from '../Topbar' // ✅ Adjust the import path if needed

export default function AdminPanel() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/service-status`)
      .then(res => res.json())
      .then(data => setIsOnline(data.isOnline))
  }, [])

  const toggleStatus = async () => {
    setSaving(true)
    const newStatus = !isOnline
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/service-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isOnline: newStatus }),
    })

    if (res.ok) setIsOnline(newStatus)
    setSaving(false)
  }

  if (loading || isOnline === null) {
    return <div className="p-6 font-mono text-black">🔄 Loading Admin Panel...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 font-mono text-black">
      <TopBar /> {/* ✅ Added here */}
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
