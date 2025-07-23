// pages/courses/[id].js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Quiz from '../../components/Quiz'

export default function CourseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      setSession(session)
      // check payment
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()
      if (userError || !userData) {
        setError('User not found.')
        setLoading(false)
        return
      }
      setHasPaid(userData.has_paid)
      // fetch course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*, modules(*)')
        .eq('id', id)
        .single()
      if (courseError || !courseData) {
        setError('Course not found.')
      } else {
        setCourse(courseData)
      }
      setLoading(false)
    })
  }, [id, router])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!session) return null

  if (!hasPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">Course Locked</h2>
          <p className="mb-6">You must purchase this course to access the content.</p>
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

  // If paid, show modules and quiz
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">{course.title}</h1>
      {course.modules?.length > 0 ? course.modules.map((mod) => (
        <div key={mod.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{mod.title}</h2>
          {mod.video_url && (
            <video
              src={mod.video_url}
              controls
              className="w-full h-64 mb-4 rounded bg-black"
            />
          )}
          <Quiz moduleId={mod.id} />
        </div>
      )) : <p>No modules found for this course.</p>}
    </div>
  )
}
