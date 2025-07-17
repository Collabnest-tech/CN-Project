// pages/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import CourseCard from '../components/CourseCard'

export default function Home({ courses }) {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)

  useEffect(() => {
    // Fetch session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        // fetch has_paid flag for this user
        supabase
          .from('users')
          .select('has_paid')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUserPaid(data?.has_paid ?? false)
          })
      }
    })

    // Listen to login/logout events
    const { subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          supabase
            .from('users')
            .select('has_paid')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              setUserPaid(data?.has_paid ?? false)
            })
        } else {
          setUserPaid(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    // Not signed in
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">
          Welcome to CollabNest Courses
        </h1>
        <div className="space-x-4">
          <Link href="/signup">
            <a className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700">
              Sign Up
            </a>
          </Link>
          <Link href="/login">
            <a className="px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Log In
            </a>
          </Link>
        </div>
      </div>
    )
  }

  // Signed in: show course list
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">
          Available Courses
        </h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Sign Out
        </button>
      </header>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500">
          No courses available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              hasPaid={userPaid}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Fetch courses at build time
export async function getStaticProps() {
  const { data: courses } = await supabase
    .from('courses')
    .select('id,title,price_id')
  return {
    props: { courses },
    revalidate: 60, // regenerate every minute
  }
}