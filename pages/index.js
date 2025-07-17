// pages/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import CourseCard from '../components/CourseCard'
import Quiz from '../components/Quiz'

export default function Home({ courses }) {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (!session) {
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

  // Featured Module 1
  const featuredModuleId = 2  // replace with your actual Module 1 ID
  const locked = !userPaid

  const FeaturedModule = () => (
    <section className="my-12 max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">
        Module 1: Introduction to Making Money Online with AI
      </h2>
      <video
        className="w-full h-64 mb-4 bg-gray-200 rounded"
        controls
        poster="/module1-poster.png"
      >
        <source src="/module1.mp4" type="video/mp4" />
        Your browser doesn’t support the video tag.
      </video>
      <div className="flex space-x-4 mb-8">
        <Link href={locked ? '/checkout' : `/courses/${featuredModuleId}`}>
          <a
            className={`px-6 py-3 rounded text-white font-medium ${
              locked
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {locked ? 'Purchase Module 1' : 'Go to Module 1'}
          </a>
        </Link>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-purple-700 mb-2">
          📝 Module 1 Quiz
        </h3>
        {locked ? (
          <p className="text-gray-500">Unlock to take the quiz.</p>
        ) : (
          <Quiz moduleId={featuredModuleId} />
        )}
      </div>
    </section>
  )

  return (
    <div className="container mx-auto p-4">
      <FeaturedModule />

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
        <p className="text-center text-gray-500">No courses available.</p>
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
