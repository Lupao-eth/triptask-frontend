// src/context/UserContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/api'

type User = {
  id: string
  email: string
  name?: string
  role: 'rider' | 'customer'
}

const UserContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((u) => {
      console.log('📦 Context received user:', u) // 👈 ADD THIS
      setUser(u)
      setLoading(false)
    })
  }, [])

 if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-yellow-100 text-yellow-800 font-mono">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-600 border-t-transparent" />
        <div className="text-lg tracking-wide">Loading session...</div>
      </div>
    </div>
  );
}



  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
