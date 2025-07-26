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
    window.location.href = `/checkout?price=${price}&referral=${referralCode}`
  }

  const carouselItems = [
    {
      title: "While Others Hesitate, Fortunes Are Being Made",
      description: "Every day you wait, someone else is building their AI-powered income stream. The early adopters are already pulling ahead.",
      img: "/images/fortune-makers.jpg",
      icon: "🏆"
    },
    {
      title: "The Opportunity That Only Comes Once",
      description: "Just like the internet boom of the 90s, AI is creating a new class of entrepreneurs. The window is still open, but not for long.",
      img: "/images/opportunity-window.jpg",
      icon: "⏰"
    },
    {
      title: "Success Stories Are Being Written Right Now",
      description: "People with no technical background are earning thousands monthly. They started where you are today - curious and ready to learn.",
      img: "/images/success-stories.jpg",
      icon: "📈"
    },
    {
      title: "The Skills That Separate the Successful",
      description: "While most people struggle with traditional methods, our students master AI tools that multiply their productivity and income potential.",
      img: "/images/skill-advantage.jpg",
      icon: "🧠"
    }
  ]

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrent((current + 1) % carouselItems.length),
    onSwipedRight: () => setCurrent((current - 1 + carouselItems.length) % carouselItems.length),
    trackMouse: true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6 relative">
      {/* Mobile-Optimized Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.jpeg"
          alt="Collab-Nest Logo"
          width={80}
          height={80}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Mobile-First Alert Section */}
      <div className="max-w-sm mx-auto text-center mb-8">
        <div className="bg-gradient-to-r from-amber-900 to-red-900 rounded-xl p-6 mb-6 border-l-4 border-yellow-400">
          <h2 className="text-xl font-bold text-white mb-3">📊 Market Alert</h2>
          <p className="text-sm text-amber-200 mb-3">
            The AI revolution is accelerating faster than experts predicted. Early adopters who started 6 months ago are already earning 5-figure monthly incomes.
          </p>
          <p className="text-lg font-bold text-yellow-300">
            The question isn't if AI will change everything - it's whether you'll be prepared when it does.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Who We Are & Why This Matters</h2>
          <p className="text-sm text-blue-200 mb-3">
            We're not just another online course company. Our team includes a <strong>Software Developer from Durham University</strong> and a <strong>Senior Project Manager</strong> who have witnessed firsthand how AI is reshaping entire industries.
          </p>
          <p className="text-sm text-blue-300">
            Our mission goes beyond education - we're building pathways out of financial uncertainty through practical AI skills that are in massive demand right now.
          </p>
        </div>
      </div>

      {/* Mobile Hero Section */}
      <div className="max-w-sm mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-4 text-white">
          While Most People Wonder<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            "What If?"
          </span>
        </h1>
        <p className="text-base text-blue-200 mb-6 font-medium">
          Smart individuals are already building automated income streams with AI tools. 
          The gap between those who act and those who wait is widening every day.
        </p>
        
        {/* Mobile Social Proof */}
        <div className="bg-[#181e29] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-green-400">5,247</div>
              <div className="text-xs text-gray-300">Students Learning</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">$847K</div>
              <div className="text-xs text-gray-300">Student Earnings</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">94%</div>
              <div className="text-xs text-gray-300">See Results</div>
            </div>
          </div>
        </div>
        
        {/* Mobile Pricing */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 mb-6">
          <div className="text-center">
            <p className="text-green-200 mb-3 text-sm">Investment in Your Future:</p>
            <div className="text-3xl font-bold text-white mb-3">
              <span className="line-through text-gray-400 text-lg">${courseData.price}</span>
              <span className="text-green-400 ml-2">${courseData.discountPrice}</span>
            </div>
            <p className="text-green-200 mb-4 text-sm">Early access pricing (limited time)</p>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Referral code for $5 off"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg w-full text-sm"
              />
              <div className="text-blue-300 text-xs mt-1">
                {referralCode.trim() ? `Total: $${courseData.discountPrice}` : `Total: $${courseData.price}`}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile CTA Buttons */}
        <div className="space-y-3 mb-8">
          {userPaid ? (
            <Link href="/courses">
              <a className="block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold text-base transition-all">
                Continue Your Journey
              </a>
            </Link>
          ) : (
            <>
              <button
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold text-base transition-all"
              >
                Secure Your Spot - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
              </button>
              <Link href="/courses">
                <a className="block border-2 border-blue-400 hover:bg-blue-400 hover:bg-opacity-20 text-blue-300 hover:text-white px-6 py-3 rounded-xl font-bold text-base transition-all text-center">
                  Explore What's Inside
                </a>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Carousel - 3:2 Images from /images/ folder */}
      <div className="max-w-sm mx-auto mb-8">
        <div {...handlers} className="relative">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{carouselItems[current].icon}</div>
              <h2 className="text-xl font-bold mb-3 text-white">
                {carouselItems[current].title}
              </h2>
              <p className="text-sm text-blue-200 leading-relaxed mb-4">
                {carouselItems[current].description}
              </p>
            </div>
            
            {/* 3:2 Aspect Ratio Image */}
            <div className="relative w-full" style={{ aspectRatio: '3/2' }}>
              <Image
                src={carouselItems[current].img}
                alt={carouselItems[current].title}
                fill
                className="rounded-xl shadow-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center hidden">
                <div className="text-4xl opacity-20">{carouselItems[current].icon}</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  current === idx ? 'bg-blue-400 scale-125' : 'bg-gray-500'
                }`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Module Showcase - using module thumbnails */}
      <div className="max-w-sm mx-auto mb-8">
        <h2 className="text-2xl font-bold text-center text-white mb-3">
          What Successful Students Are Learning
        </h2>
        <p className="text-center text-blue-200 mb-6 text-sm">
          These aren't just lessons - they're the exact strategies our students use to build income streams
        </p>
        
        <div className="space-y-4">
          {moduleData.slice(0, 4).map((module) => (
            <div
              key={module.id}
              className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={module.thumbnail}
                    alt={module.title}
                    fill
                    className="rounded-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-2xl hidden">
                    {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : '🛍️'}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">{module.title}</h3>
                  <p className="text-blue-200 text-xs mb-2 line-clamp-2">{module.description}</p>
                  <div className="text-green-400 text-xs font-semibold">
                    {module.earnings}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Link href="/courses">
            <a className="text-blue-400 hover:text-blue-300 font-semibold text-sm">
              See All 8 Income-Generating Modules →
            </a>
          </Link>
        </div>
      </div>

      {/* Mobile Final CTA */}
      {!userPaid && (
        <div className="max-w-sm mx-auto text-center bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">
            Your Future Self Is Waiting
          </h2>
          <p className="text-sm text-blue-200 mb-4">
            Every skill you don't learn, every opportunity you don't explore, every day you postpone - 
            someone else is moving ahead. But it's never too late to start.
          </p>
          <button
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-all"
          >
            Begin Your Transformation - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
          </button>
          <p className="text-green-300 text-xs mt-3">
            ✓ Lifetime Access ✓ Start Immediately ✓ Expert Support ✓ Real Results
          </p>
        </div>
      )}
    </div>
  )
}