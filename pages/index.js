import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { supabase } from '../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import { moduleData, courseData } from '../lib/moduleData'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Home() {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    checkUserSession()
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(interval)
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
  }

  async function handlePurchase() {
    if (!session) {
      window.location.href = '/login'
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

  const carouselItems = [
    {
      title: "Master AI Tools for Income",
      description: "Learn ChatGPT, MidJourney & 20+ AI tools to build multiple income streams",
      img: "/hero-images/ai-tools.jpg",
      icon: "🤖"
    },
    {
      title: "Real Income Potential",
      description: "$100-5000/month with proven AI strategies and automation",
      img: "/hero-images/income.jpg", 
      icon: "💰"
    },
    {
      title: "Step-by-Step Learning",
      description: "8 comprehensive modules with practical, actionable content",
      img: "/hero-images/learning.jpg",
      icon: "📚"
    }
  ]

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrent((current + 1) % carouselItems.length),
    onSwipedRight: () => setCurrent((current - 1 + carouselItems.length) % carouselItems.length),
    trackMouse: true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10 relative">
      {/* Logo */}
      <div className="absolute top-6 left-8 z-10">
        <Image
          src="/logo.jpeg"
          alt="Collabnest Logo"
          width={90}
          height={90}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-16 pt-16">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-lg">
          Make Money Online<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            with AI
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 mb-8 font-medium max-w-3xl mx-auto">
          Master ChatGPT, MidJourney &amp; 20+ AI tools to build multiple passive income streams
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {userPaid ? (
            <Link href="/courses">
              <a className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                🎓 Continue Learning
              </a>
            </Link>
          ) : (
            <>
              <button
                onClick={handlePurchase}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                🚀 Start Learning - ${courseData.price}
              </button>
              <Link href="/courses">
                <a className="border-2 border-blue-400 hover:bg-blue-400 hover:bg-opacity-20 text-blue-300 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300">
                  📋 View Course Details
                </a>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Interactive Carousel */}
      <div className="max-w-4xl mx-auto mb-16">
        <div {...handlers} className="relative">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 min-h-[300px]">
            <div className="flex-1 text-center md:text-left">
              <div className="text-6xl mb-4">{carouselItems[current].icon}</div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                {carouselItems[current].title}
              </h2>
              <p className="text-xl text-blue-200 leading-relaxed">
                {carouselItems[current].description}
              </p>
            </div>
            <div className="flex-1 relative">
              <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-6xl opacity-20">{carouselItems[current].icon}</div>
              </div>
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center gap-3 mt-6">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  current === idx ? 'bg-blue-400 scale-125' : 'bg-gray-500 hover:bg-gray-400'
                }`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Course Modules Preview */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          What You'll Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {moduleData.slice(0, 4).map((module) => (
            <div
              key={module.id}
              className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-6 text-center hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl mb-4">
                {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : '🛍️'}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
              <p className="text-blue-200 text-sm mb-3">{module.description}</p>
              <div className="text-green-400 text-sm font-semibold">
                💰 {module.earnings}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/courses">
            <a className="text-blue-400 hover:text-blue-300 font-semibold text-lg">
              View All 8 Modules →
            </a>
          </Link>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-8">
          Join Thousands Learning AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/*
            { number: "5000+", label: "Students Enrolled", icon: "👥" },
            { number: "8", label: "Comprehensive Modules", icon: "📚" },
            { number: "20+", label: "AI Tools Covered", icon: "🛠️" }
          */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-[#181e29] rounded-xl p-6">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">5000+</div>
              <div className="text-blue-200">Students Enrolled</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      {!userPaid && (
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-green-900 to-blue-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your AI Journey?
          </h2>
          <p className="text-xl text-green-200 mb-6">
            Get instant access to all 8 modules and start building your income streams today!
          </p>
          <button
            onClick={handlePurchase}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
          >
            🚀 Get Started Now - ${courseData.price}
          </button>
          <p className="text-green-300 text-sm mt-4">
            ✓ Lifetime Access ✓ 30-Day Money Back Guarantee ✓ Instant Download
          </p>
        </div>
      )}
    </div>
  )
}