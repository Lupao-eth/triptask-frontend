'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import TopBar from '../Topbar'

type Task = {
  id: string
  user_id: string
  name: string
  task: string
  pickup: string
  dropoff: string
  datetime: string
  notes?: string
  status: string
  created_at?: string
  assigned_rider_id?: string
  uuid_id?: string
}

export default function ActiveBookingsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())
  const [loadingTasks, setLoadingTasks] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'rider')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tasks/active`, {
          credentials: 'include',
        })
        const data = await res.json()

        if (!res.ok) {
          console.error('❌ API error:', data.message || 'Unknown error')
          return
        }

        setTasks(data.tasks || [])
      } catch (err) {
        console.error('❌ Failed to fetch active tasks:', err)
      } finally {
        setLoadingTasks(false)
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

  const updateStatus = async (taskId: string, newStatus: 'on_the_way' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('❌ Failed to update status:', data.message)
        return
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: data.task.status } : task
        )
      )
    } catch (err) {
      console.error('❌ Error updating task status:', err)
    }
  }

  if (loading) return <div className="p-6 text-center text-black font-mono">Loading...</div>
  if (!user || user.role !== 'rider') return null

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-black">
      <TopBar />
      <main className="p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Active Bookings</h1>

        {loadingTasks ? (
          <div className="text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500">No active bookings.</div>
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
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={
                    task.status === 'accepted' ? 'text-yellow-600' :
                    task.status === 'on_the_way' ? 'text-blue-600' :
                    task.status === 'completed' ? 'text-green-600' :
                    'text-gray-600'
                  }>
                    {task.status}
                  </span>
                </p>

                {expandedTaskIds.has(task.id) && (
                  <>
                    <p><strong>Notes:</strong> {task.notes || 'None'}</p>
                    <p><strong>Created At:</strong> {formatDate(task.created_at || '')}</p>
                    <p><strong>User ID:</strong> {task.user_id}</p>
                    <p><strong>Assigned Rider ID:</strong> {task.assigned_rider_id || 'None'}</p>
                    <p><strong>UUID ID:</strong> {task.uuid_id || 'None'}</p>
                  </>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleToggleDetails(task.id)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    {expandedTaskIds.has(task.id) ? 'Hide Details' : 'View Details'}
                  </button>

                  <button
                    onClick={() => router.push(`/rider/chat/${task.id}`)}
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                  >
                    Chat with Customer
                  </button>

                  {task.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => updateStatus(task.id, 'on_the_way')}
                        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                      >
                        Mark On the Way
                      </button>
                      <button
                        onClick={() => updateStatus(task.id, 'cancelled')}
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        Cancel Task
                      </button>
                    </>
                  )}

                  {task.status === 'on_the_way' && (
                    <>
                      <button
                        onClick={() => updateStatus(task.id, 'completed')}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Complete Task
                      </button>
                      <button
                        onClick={() => updateStatus(task.id, 'cancelled')}
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        Cancel Task
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
