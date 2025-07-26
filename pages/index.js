import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { moduleData, courseData } from '../lib/moduleData'
import { useSwipeable } from 'react-swipeable'

export default function Home() {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [current, setCurrent] = useState(0)
  const [referralCode, setReferralCode] = useState('')

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
      alert('Please log in to purchase the course.')
      return
    }
    
    const price = referralCode.trim() ? courseData.discountPrice : courseData.price
    // Redirect to checkout with price
    window.location.href = `/checkout?price=${price}&referral=${referralCode}`
  }

  const carouselItems = [
    {
      title: "Don't Miss the AI Revolution",
      description: "You missed Crypto, NFTs, and Forex. Don't miss the AI wave that's creating millionaires",
      img: "/carousel/ai-revolution.jpg",
      icon: "🚀"
    },
    {
      title: "From Poverty to Prosperity",
      description: "Our mission: Elevate people out of poverty through AI-powered income streams",
      img: "/carousel/prosperity.jpg",
      icon: "💰"
    },
    {
      title: "Expert Team, Proven Results",
      description: "Led by Durham University Software Developer & Senior Project Manager",
      img: "/carousel/team.jpg",
      icon: "👥"
    },
    {
      title: "Not Just a Course - A Lifeline",
      description: "This isn't education, it's transformation. Your pathway to financial freedom",
      img: "/carousel/transformation.jpg",
      icon: "✨"
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
          alt="Collab-Nest Logo"
          width={90}
          height={90}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Mission Statement */}
      <div className="max-w-4xl mx-auto text-center mb-16 pt-16">
        <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">⚠️ URGENT: Don't Miss Out Again</h2>
          <p className="text-xl text-orange-200 mb-4">
            You missed the Crypto boom. You missed NFTs. You missed Forex profits.
          </p>
          <p className="text-2xl font-bold text-yellow-300">
            DON'T MISS THE AI REVOLUTION! 🤖
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission: Your Freedom</h2>
          <p className="text-xl text-blue-200 mb-4">
            Led by a <strong>Durham University Software Developer</strong> and <strong>Senior Project Manager</strong>,
            we're on a mission to elevate people out of poverty through AI-powered income generation.
          </p>
          <p className="text-lg text-blue-300">
            This isn't just a course - it's your lifeline to financial independence.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-lg">
          Make Money Online<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            with AI
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 mb-8 font-medium max-w-3xl mx-auto">
          Master ChatGPT, MidJourney & 20+ AI tools to build multiple passive income streams
        </p>
        
        {/* Pricing Section */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-8 mb-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">
              <span className="line-through text-gray-400 text-3xl">${courseData.price}</span>
              <span className="text-green-400 ml-4">${courseData.discountPrice}</span>
            </div>
            <p className="text-green-200 mb-4">Special launch price with referral code</p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter referral code for $5 off"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg mr-2"
              />
              <span className="text-blue-300 text-sm">
                {referralCode.trim() ? `Final Price: $${courseData.discountPrice}` : `Price: $${courseData.price}`}
              </span>
            </div>
          </div>
        </div>
        
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
                🚀 Start Learning - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
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

      {/* Social Proof - Single Counter */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-8">
          Join Thousands Learning AI
        </h2>
        <div className="bg-[#181e29] rounded-xl p-8">
          <div className="text-6xl mb-4">👥</div>
          <div className="text-4xl font-bold text-blue-400 mb-2">5,000+</div>
          <div className="text-xl text-blue-200">Students Enrolled</div>
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
            🚀 Get Started Now - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
          </button>
          <p className="text-green-300 text-sm mt-4">
            ✓ Lifetime Access ✓ Instant Download ✓ Expert Support
          </p>
        </div>
      )}
    </div>
  )
}