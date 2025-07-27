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
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 sm:px-6 lg:px-8 py-6 relative">
      {/* Responsive Logo */}
      <div className="flex justify-center mb-6 lg:mb-8">
        <Image
          src="/logo.jpeg"
          alt="Collab-Nest Logo"
          width={80}
          height={80}
          className="rounded-full shadow-lg sm:w-20 sm:h-20 lg:w-24 lg:h-24"
        />
      </div>

      {/* Container with responsive max-width */}
      <div className="max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        
        {/* Alert Section - Responsive Grid */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-gradient-to-r from-amber-900 to-red-900 rounded-xl p-6 lg:p-8 border-l-4 border-yellow-400">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">📊 Market Alert</h2>
              <p className="text-sm lg:text-base text-amber-200 mb-3">
                The AI revolution is accelerating faster than experts predicted. Early adopters who started 6 months ago are already earning 5-figure monthly incomes.
              </p>
              <p className="text-lg lg:text-xl font-bold text-yellow-300">
                The question isn't if AI will change everything - it's whether you'll be prepared when it does.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">Who We Are & Why This Matters</h2>
              <p className="text-sm lg:text-base text-blue-200 mb-3">
                We're not just another online course company. Our team includes a <strong>Software Developer from Durham University</strong> and a <strong>Senior Project Manager</strong> who have witnessed firsthand how AI is reshaping entire industries.
              </p>
              <p className="text-sm lg:text-base text-blue-300">
                Our mission goes beyond education - we're building pathways out of financial uncertainty through practical AI skills that are in massive demand right now.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-8 lg:mb-12">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 lg:mb-6 text-white leading-tight">
              While Most People Wonder<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                "What If?"
              </span>
            </h1>
            <p className="text-base lg:text-lg text-blue-200 mb-6 lg:mb-8 font-medium leading-relaxed">
              Smart individuals are already building automated income streams with AI tools. 
              The gap between those who act and those who wait is widening every day.
            </p>
            
            {/* Social Proof */}
            <div className="bg-[#181e29] rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-green-400">5,247</div>
                  <div className="text-xs lg:text-sm text-gray-300">Students Learning</div>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-blue-400">$847K</div>
                  <div className="text-xs lg:text-sm text-gray-300">Student Earnings</div>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-purple-400">94%</div>
                  <div className="text-xs lg:text-sm text-gray-300">See Results</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="lg:ml-8">
            <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 lg:p-8 mb-6">
              <div className="text-center">
                <p className="text-green-200 mb-3 text-sm lg:text-base">Investment in Your Future:</p>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-3">
                  <span className="line-through text-gray-400 text-lg lg:text-xl">${courseData.price}</span>
                  <span className="text-green-400 ml-2">${courseData.discountPrice}</span>
                </div>
                <p className="text-green-200 mb-4 text-sm lg:text-base">Early access pricing (limited time)</p>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Referral code for $5 off"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg w-full text-sm lg:text-base"
                  />
                  <div className="text-blue-300 text-xs lg:text-sm mt-1">
                    {referralCode.trim() ? `Total: $${courseData.discountPrice}` : `Total: $${courseData.price}`}
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="space-y-3">
              {userPaid ? (
                <Link href="/courses">
                  <a className="block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all text-center">
                    Continue Your Journey
                  </a>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all"
                  >
                    Secure Your Spot - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
                  </button>
                  <Link href="/courses">
                    <a className="block border-2 border-blue-400 hover:bg-blue-400 hover:bg-opacity-20 text-blue-300 hover:text-white px-6 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all text-center">
                      Explore What's Inside
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Carousel - Responsive */}
        <div className="mb-8 lg:mb-12">
          <div {...handlers} className="relative">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl shadow-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="text-center lg:text-left">
                  <div className="text-4xl lg:text-5xl mb-2 lg:mb-4">{carouselItems[current].icon}</div>
                  <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-3 lg:mb-4 text-white leading-tight">
                    {carouselItems[current].title}
                  </h2>
                  <p className="text-sm lg:text-base text-blue-200 leading-relaxed">
                    {carouselItems[current].description}
                  </p>
                </div>
                
                {/* Responsive Image */}
                <div className="order-first lg:order-last">
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
                      <div className="text-4xl lg:text-6xl opacity-20">{carouselItems[current].icon}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-4 lg:mt-6">
              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                    current === idx ? 'bg-blue-400 scale-125' : 'bg-gray-500'
                  }`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Module Showcase - Responsive Grid */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-center text-white mb-3 lg:mb-4">
            What Successful Students Are Learning
          </h2>
          <p className="text-center text-blue-200 mb-6 lg:mb-8 text-sm lg:text-base">
            These aren't just lessons - they're the exact strategies our students use to build income streams
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {moduleData.slice(0, 4).map((module) => (
              <div
                key={module.id}
                className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-4 lg:p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 mb-4">
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
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-2xl lg:text-3xl hidden">
                      {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : '🛍️'}
                    </div>
                  </div>
                  <h3 className="text-base lg:text-lg font-bold text-white mb-2">{module.title}</h3>
                  <p className="text-blue-200 text-xs lg:text-sm mb-3 line-clamp-3">{module.description}</p>
                  <div className="text-green-400 text-xs lg:text-sm font-semibold">
                    {module.earnings}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6 lg:mt-8">
            <Link href="/courses">
              <a className="text-blue-400 hover:text-blue-300 font-semibold text-sm lg:text-base">
                See All 8 Income-Generating Modules →
              </a>
            </Link>
          </div>
        </div>

        {/* Final CTA */}
        {!userPaid && (
          <div className="text-center bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-3 lg:mb-4">
              Your Future Self Is Waiting
            </h2>
            <p className="text-sm lg:text-base text-blue-200 mb-4 lg:mb-6 max-w-2xl mx-auto">
              Every skill you don't learn, every opportunity you don't explore, every day you postpone - 
              someone else is moving ahead. But it's never too late to start.
            </p>
            <button
              onClick={handlePurchase}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all"
            >
              Begin Your Transformation - ${referralCode.trim() ? courseData.discountPrice : courseData.price}
            </button>
            <p className="text-green-300 text-xs lg:text-sm mt-3 lg:mt-4">
              ✓ Lifetime Access ✓ Start Immediately ✓ Expert Support ✓ Real Results
            </p>
          </div>
        )}
      </div>
    </div>
  )
}