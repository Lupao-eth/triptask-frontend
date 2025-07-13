'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { getAccessToken } from '@/lib/api'
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
}

export default function AvailableBookingsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchTasks = async () => {
      const token = getAccessToken()
      if (!token) return router.replace('/login')

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tasks/available`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (err) {
        console.error('❌ Failed to fetch available tasks:', err)
      } finally {
        setLoadingTasks(false)
      }
    }

    fetchTasks()
  }, [router])

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

  const handleAcceptTask = async (taskId: string) => {
    const token = getAccessToken()
    if (!token) return router.replace('/login')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      })

      if (!res.ok) throw new Error('Failed to accept task')

      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      console.error('❌ Accept task error:', err)
      alert('Failed to accept task.')
    }
  }

  if (loading) return <div className="p-6 text-center text-black font-mono">Loading...</div>
  if (!user || user.role !== 'rider') return null

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-black">
      <TopBar />
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Available Bookings</h1>

        {loadingTasks ? (
          <div className="text-center text-gray-500">Fetching tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500">No available tasks.</div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="w-full border border-gray-300 bg-white rounded-xl shadow p-4"
              >
                <p><strong>Booking ID:</strong> {task.id}</p>
                <p><strong>Name:</strong> {task.name}</p>
                <p><strong>Task:</strong> {task.task}</p>
                <p><strong>Pickup:</strong> {task.pickup}</p>
                <p><strong>Dropoff:</strong> {task.dropoff}</p>
                <p><strong>Date & Time:</strong> {formatDate(task.datetime)}</p>

                {expandedTaskIds.has(task.id) && (
                  <>
                    <p><strong>Notes:</strong> {task.notes || 'None'}</p>
                    <p><strong>Created At:</strong> {formatDate(task.created_at || '')}</p>
                  </>
                )}

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleToggleDetails(task.id)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    {expandedTaskIds.has(task.id) ? 'Hide Details' : 'View Details'}
                  </button>

                  <button
                    onClick={() => handleAcceptTask(task.id)}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Accept Booking
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
