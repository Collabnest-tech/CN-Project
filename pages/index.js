import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import CourseCard from '../components/CourseCard'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        // Fetch courses if logged in
        const { data: courseData } = await supabase.from('courses').select('*')
        setCourses(courseData || [])
      }
    })
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Welcome to CollabNest Courses</h1>
        <div className="space-x-4">
          <Link href="/signup"><a className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700">Sign Up</a></Link>
          <Link href="/login"><a className="px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Log In</a></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">Available Courses</h1>
      {courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(c => <CourseCard key={c.id} course={c} hasPaid={true} />)}
        </div>
      )}
    </div>
  )
}
