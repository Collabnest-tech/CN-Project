import Link from 'next/link'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '../lib/supabase'
import ModuleCard from '../components/ModuleCard'
import { courseData } from '../lib/moduleData'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Courses() {
  const [userPaid, setUserPaid] = useState(false)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    
    if (session) {
      const { data, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()
      
      if (!error && data) {
        setUserPaid(data.has_paid)
      }
    }
    setLoading(false)
  }

  async function handleStripeCheckout() {
    if (!session) {
      alert('Please log in to purchase the course.')
      return
    }

    const stripe = await stripePromise
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        userId: session.user.id
      })
    })
    
    if (!res.ok) {
      alert('Failed to start checkout.')
      return
    }
    
    const { sessionId } = await res.json()
    stripe.redirectToCheckout({ sessionId })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Course Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {courseData.title}
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            {courseData.description}
          </p>
          
          {/* Course Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-blue-200">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📚</span>
              <span>{courseData.totalModules} Modules</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">⏱️</span>
              <span>{courseData.totalDuration} Total</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              <span>{courseData.level}</span>
            </div>
          </div>
        </div>

        {/* Purchase Section */}
        {!userPaid && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Unlock All Modules
            </h2>
            <p className="text-blue-200 mb-6">
              Get lifetime access to all 8 modules and start building your AI-powered income streams today!
            </p>
            <div className="text-4xl font-bold text-green-400 mb-6">
              ${courseData.price}
              <span className="text-lg text-blue-200 ml-2">one-time payment</span>
            </div>
            <button
              onClick={handleStripeCheckout}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Start Learning Now
            </button>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {courseData.modules.map((module) => (
            <ModuleCard
              key={module.id}
              moduleNumber={module.id}
              locked={!userPaid}
              userPaid={userPaid}
            />
          ))}
        </div>

        {/* Learning Path */}
        <div className="bg-[#181e29] rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Your Learning Journey
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {['Watch', 'Practice', 'Quiz', 'Certificate'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {idx + 1}
                  </div>
                  <span className="text-blue-200 text-sm mt-2">{step}</span>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block text-blue-400 mx-4 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


