// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setSession(session)
    })
  }, [])

  if (!session) return null  // or a loading spinner

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          Welcome to CollabNest!
        </h1>

        <video
          src="/intro-video.mp4"
          poster="/intro-poster.png"
          controls
          className="w-full h-64 rounded mb-6 bg-black"
        />

        <h2 className="text-2xl font-semibold mb-2">About Us</h2>
        <p className="text-gray-700 mb-6">
          CollabNest is your AI‐powered learning platform. We’ll teach you how to leverage ChatGPT, MidJourney, and 18 other tools to make money online—through freelancing, e‑commerce, content creation, and more.
        </p>

        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          View Courses
        </button>
      </div>
    </div>
  )
}