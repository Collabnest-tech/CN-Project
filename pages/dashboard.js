// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setSession(session)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">Welcome to your Dashboard!</h1>
        <p className="text-gray-700">You are logged in as <span className="font-semibold">{session.user.email}</span>.</p>
      </div>
    </div>
  )
}