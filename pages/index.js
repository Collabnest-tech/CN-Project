import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Home({ courses }) {
  const [session, setSession]   = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [current, setCurrent]   = useState(0)

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

  const courseId = 1
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

  const carouselItems = [
    {
      title: "ChatGPT for Beginners",
      description: "Start your AI journey with ChatGPT basics.",
      img: "/carousel1.jpg"
    },
    {
      title: "Advanced ChatGPT Techniques",
      description: "Unlock advanced prompts and workflows.",
      img: "/carousel2.jpg"
    },
    {
      title: "MidJourney Mastery",
      description: "Create stunning visuals with AI.",
      img: "/carousel3.jpg"
    }
  ]

  const courseSummary = [
    { name: "ChatGPT for Beginners", unlocked: true },
    { name: "Advanced ChatGPT Techniques", unlocked: true },
    { name: "Introduction to MidJourney", unlocked: false },
    { name: "Automating Tasks with AI", unlocked: false },
    { name: "AI-Driven Marketing", unlocked: false }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10 relative">
      {/* Logo top right */}
      <div className="absolute top-6 right-8 z-10">
        <Image
          src="/logo.jpeg"
          alt="Collab-Nest Logo"
          width={90}
          height={90}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Title */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
          Make Money Online<br />with AI
        </h1>
        <p className="text-lg md:text-xl text-blue-200 mb-2 font-medium">
          Master ChatGPT, MidJourney &amp; more tools
        </p>
      </div>

      {/* Carousel */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative bg-[#181e29] rounded-xl shadow-lg p-6 flex flex-col items-center">
          <Image
            src={carouselItems[current].img}
            alt={carouselItems[current].title}
            width={320}
            height={180}
            className="rounded mb-4 object-cover"
          />
          <h2 className="text-xl font-bold mb-2 text-white">{carouselItems[current].title}</h2>
          <p className="text-blue-100 text-center mb-2">{carouselItems[current].description}</p>
          <div className="flex justify-center gap-2 mt-2">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${current === idx ? 'bg-blue-400' : 'bg-gray-500'}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Course Summary */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {courseSummary.map((course, idx) => (
          <div
            key={course.name}
            className={`rounded-xl shadow-lg p-6 flex flex-col items-center ${
              course.unlocked ? 'bg-[#181e29]' : 'bg-[#232a39] opacity-60'
            }`}
          >
            <h3 className="text-lg font-bold mb-2 text-white">{course.name}</h3>
            <span className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
              course.unlocked ? 'bg-green-600 text-white' : 'bg-gray-700 text-blue-200'
            }`}>
              {course.unlocked ? 'Unlocked' : 'Purchase to Unlock'}
            </span>
          </div>
        ))}
      </div>

      {/* Auth Buttons or Sign Out */}
      <div className="flex justify-center gap-6 mt-8">
        {!session ? (
          <>
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
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow transition"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const { data: courses } = await supabase.from('courses').select('id,title,price_id')
  return { props: { courses }, revalidate: 60 }
}
