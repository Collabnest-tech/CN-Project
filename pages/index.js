import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import CourseCard from '../components/CourseCard'
import Quiz from '../components/Quiz'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Home({ courses }) {
  const [session, setSession]   = useState(null)
  const [userPaid, setUserPaid] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase.from('users').select('has_paid').eq('id', session.user.id).single()
          .then(({ data, error }) => error ? console.error(error) : setUserPaid(data.has_paid))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) {
        supabase.from('users').select('has_paid').eq('id', session.user.id).single()
          .then(({ data, error }) => error ? console.error(error) : setUserPaid(data.has_paid))
      } else setUserPaid(false)
    })
    return () => subscription?.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
              Make Money Online<br />with AI
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-2 font-medium">
              Master ChatGPT, MidJourney &amp; 6 more tools
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#181e29] rounded-xl shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2 text-white">About Us</h2>
              <p className="text-blue-100 text-center">
                We&apos;re help you build online income by leveraging artificial intelligence.
              </p>
            </div>
            <div className="bg-[#181e29] rounded-xl shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2 text-white">What You&apos;ll Learn</h2>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {/* Example icons, replace with your own */}
                <span className="bg-[#232a39] rounded-full px-3 py-2 text-blue-300 font-semibold text-sm">ChatGPT</span>
                <span className="bg-[#232a39] rounded-full px-3 py-2 text-blue-300 font-semibold text-sm">MidJourney</span>
                <span className="bg-[#232a39] rounded-full px-3 py-2 text-blue-300 font-semibold text-sm">Automation</span>
                <span className="bg-[#232a39] rounded-full px-3 py-2 text-blue-300 font-semibold text-sm">Content</span>
                <span className="bg-[#232a39] rounded-full px-3 py-2 text-blue-300 font-semibold text-sm">Marketing</span>
              </div>
            </div>
            <div className="bg-[#181e29] rounded-xl shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-2 text-white">Outcomes</h2>
              <ul className="text-blue-100 text-center space-y-1">
                <li>Earn freelancing</li>
                <li>Content creation</li>
                <li>Online business</li>
              </ul>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex justify-center gap-6 mt-8">
            <Link href="/signup">
              <a className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition">
                Sign Up
              </a>
            </Link>
            <Link href="/login">
              <a className="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-blue-200 font-bold rounded-xl shadow transition">
                Log In
              </a>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const courseId = 1
  const featuredModuleId = 2
  const course = courses.find(c => c.id === courseId)
  const locked = !userPaid

  async function handlePurchase() {
    if (!course) { console.error('Course not found'); return }
    const stripe = await stripePromise
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: course.price_id, userId: session.user.id })
    })
    if (!res.ok) { console.error(await res.text()); return }
    const { sessionId } = await res.json()
    stripe.redirectToCheckout({ sessionId })
  }

  return (
    <div className="container mx-auto p-4">
      <section className="my-12 max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Module 1: Introduction to Making Money Online with AI</h2>
        <video className="w-full h-64 mb-4 bg-gray-200 rounded" controls poster="/module1-poster.png">
          <source src="/module1.mp4" type="video/mp4" />
          Your browser doesn’t support the video tag.
        </video>
        <div className="flex space-x-4 mb-8">
          {locked ? (
            <button onClick={handlePurchase} className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700">
              Purchase Module 1
            </button>
          ) : (
            <Link href={`/courses/${featuredModuleId}`}><a className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">Go to Module 1</a></Link>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-purple-700 mb-2">📝 Module 1 Quiz</h3>
          {locked ? <p className="text-gray-500">Unlock to take the quiz.</p> : <Quiz moduleId={featuredModuleId} />}
        </div>
      </section>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Available Courses</h1>
        <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Sign Out</button>
      </header>
      {courses.length === 0 ? <p className="text-center text-gray-500">No courses available.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(c => <CourseCard key={c.id} course={c} hasPaid={userPaid} />)}
        </div>
      )}
    </div>
  )
}

export async function getStaticProps() {
  const { data: courses } = await supabase.from('courses').select('id,title,price_id')
  return { props: { courses }, revalidate: 60 }
}
