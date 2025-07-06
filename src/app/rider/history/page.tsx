'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import TopBar from '../Topbar'

type Task = {
  id: string
  name: string
  task: string
  pickup: string
  dropoff: string
  datetime: string
  notes?: string
  status: string
  created_at?: string
  user_id?: string
  assigned_rider_id?: string
  uuid_id?: string
}

export default function RiderHistoryPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>('completed')
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tasks/history`, {
          credentials: 'include',
        })
        const data = await res.json()
        setTasks(data || [])
      } catch (err) {
        console.error('❌ Failed to fetch history:', err)
      }
    }

    fetchTasks()
  }, [])

  const formatDate = (value: string) => {
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const handleToggleDetails = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const filteredTasks = tasks.filter((t) => t.status === activeTab)

  if (loading) return <div className="p-6 text-center text-black font-mono">Loading...</div>
  if (!user || user.role !== 'rider') return null

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-black">
      <TopBar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">Booking History</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded ${
              activeTab === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Booking Cards */}
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500">No {activeTab} bookings found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-300 bg-white rounded-xl shadow p-4"
              >
                <p><strong>Booking ID:</strong> {task.id}</p>
                <p><strong>Name:</strong> {task.name}</p>
                <p><strong>Task:</strong> {task.task}</p>
                <p><strong>Pickup:</strong> {task.pickup}</p>
                <p><strong>Dropoff:</strong> {task.dropoff}</p>
                <p><strong>Date & Time:</strong> {formatDate(task.datetime)}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={
                    task.status === 'completed'
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }>
                    {task.status}
                  </span>
                </p>

                {expandedTaskIds.has(task.id) && (
                  <>
                    <p><strong>Notes:</strong> {task.notes || 'None'}</p>
                    <p><strong>Created At:</strong> {formatDate(task.created_at || '')}</p>
                    <p><strong>User ID:</strong> {task.user_id}</p>
                    <p><strong>UUID ID:</strong> {task.uuid_id}</p>
                    <p><strong>Assigned Rider ID:</strong> {task.assigned_rider_id}</p>
                  </>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => handleToggleDetails(task.id)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    {expandedTaskIds.has(task.id) ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
