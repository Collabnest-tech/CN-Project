import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { moduleData } from '../lib/moduleData'
import { useSwipeable } from 'react-swipeable'

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [current, setCurrent] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [referralStatus, setReferralStatus] = useState(null) // valid, invalid, or null

  useEffect(() => {
    // Auto-fill referral code from URL
    const { ref } = router.query
    if (ref && typeof ref === 'string') {
      const upperCaseRef = ref.toUpperCase()
      setReferralCode(upperCaseRef)
      validateReferralCode(upperCaseRef)
    }

    checkSession()

    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [router.query])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      // If user is logged in, check if they have paid
      if (session) {
        await checkPaymentStatus(session.user.id)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (userId) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', userId)
        .single()

      if (!error && user?.has_paid) {
        // User has paid, redirect to course
        router.push('/course')
        return
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  async function validateReferralCode(code) {
    if (!code.trim()) {
      setReferralStatus(null)
      return
    }

    try {
      // Check if referral code exists and belongs to a user who has paid
      const { data, error } = await supabase
        .from('users')
        .select('id, referral_code, has_paid, full_name')
        .eq('referral_code', code.trim().toUpperCase())
        .eq('has_paid', true)
        .single()

      if (error || !data) {
        setReferralStatus('invalid')
      } else {
        setReferralStatus('valid')
      }
    } catch (error) {
      console.error('Error validating referral code:', error)
      setReferralStatus('invalid')
    }
  }

  async function fetchCourseData() {
    try {
      const response = await fetch('/api/get-product-info')
      if (response.ok) {
        const data = await response.json()
        setCourseData(data)
      } else {
        setCourseData({
          name: "AI for Making Money Online",
          price: { amount: 15, formatted: '$15.00', currency: 'USD' }
        })
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
      setCourseData({
        name: "AI for Making Money Online",
        price: { amount: 15, formatted: '$15.00', currency: 'USD' }
      })
    }
  }

  async function handlePurchase() {
    if (!session) {
      alert('Please log in to purchase the course.')
      return
    }

    if (!courseData || !courseData.price) {
      alert('Course pricing not available. Please try again.')
      return
    }

    // Only apply discount if referral code is valid
    let finalPrice = courseData.price.amount
    let validReferralCode = ''
    
    if (referralCode.trim() && referralStatus === 'valid') {
      finalPrice = Math.max(finalPrice - 5, 5) // $5 discount, minimum $5
      validReferralCode = referralCode.trim().toUpperCase()
    }

    const checkoutUrl = `/checkout?priceId=${courseData.price.id}&referral=${validReferralCode}&finalPrice=${finalPrice}`
    window.location.href = checkoutUrl
  }

  // Handle manual referral code input
  async function handleReferralCodeChange(value) {
    const upperCaseValue = value.toUpperCase()
    setReferralCode(upperCaseValue)
    
    // Debounce validation
    clearTimeout(window.referralValidationTimeout)
    window.referralValidationTimeout = setTimeout(() => {
      validateReferralCode(upperCaseValue)
    }, 500)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const originalPrice = courseData?.price?.amount || 15
  const finalPrice = (referralCode.trim() && referralStatus === 'valid') ? Math.max(originalPrice - 5, 5) : originalPrice

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
        
        {/* Referral Alert Banner */}
        {router.query.ref && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            referralStatus === 'valid' 
              ? 'bg-green-900 border-green-400' 
              : referralStatus === 'invalid' 
                ? 'bg-red-900 border-red-400' 
                : 'bg-yellow-900 border-yellow-400'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {referralStatus === 'valid' ? '🎉' : referralStatus === 'invalid' ? '❌' : '⏳'}
              </span>
              <div>
                {referralStatus === 'valid' && (
                  <>
                    <h3 className="text-green-200 font-bold">Great news! You have a $5 discount!</h3>
                    <p className="text-green-300 text-sm">Your referral code "{referralCode}" is valid</p>
                  </>
                )}
                {referralStatus === 'invalid' && (
                  <>
                    <h3 className="text-red-200 font-bold">Invalid referral code</h3>
                    <p className="text-red-300 text-sm">Code "{referralCode}" is not valid or expired</p>
                  </>
                )}
                {referralStatus === null && (
                  <>
                    <h3 className="text-yellow-200 font-bold">Checking referral code...</h3>
                    <p className="text-yellow-300 text-sm">Please wait while we validate "{referralCode}"</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
                  {referralCode.trim() && referralStatus === 'valid' && originalPrice > finalPrice && (
                    <span className="line-through text-gray-400 text-lg lg:text-xl">${originalPrice}</span>
                  )}
                  <span className={`ml-2 ${referralCode.trim() && referralStatus === 'valid' && originalPrice > finalPrice ? 'text-green-400' : 'text-white'}`}>
                    ${finalPrice}
                  </span>
                </div>
                <p className="text-green-200 mb-4 text-sm lg:text-base">
                  {courseData?.price ? 'Secure pricing from Stripe' : 'Loading pricing...'}
                </p>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Referral code for $5 off"
                    value={referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value)}
                    className={`bg-gray-700 text-white px-3 py-2 rounded-lg w-full text-sm lg:text-base border-2 ${
                      referralStatus === 'valid' ? 'border-green-400' : 
                      referralStatus === 'invalid' ? 'border-red-400' : 
                      'border-gray-600'
                    }`}
                  />
                  <div className="text-xs lg:text-sm mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">
                        Total: ${finalPrice} {courseData?.price?.currency || 'USD'}
                      </span>
                      {referralCode.trim() && referralStatus === 'valid' && originalPrice > finalPrice && (
                        <span className="text-green-400 font-bold">(Save $5!)</span>
                      )}
                    </div>
                    {referralStatus === 'invalid' && (
                      <p className="text-red-400 text-xs mt-1">Invalid or expired referral code</p>
                    )}
                    {referralStatus === 'valid' && (
                      <p className="text-green-400 text-xs mt-1">✓ Valid referral code applied</p>
                    )}
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
                    disabled={!courseData}
                    className={`w-full px-6 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all ${
                      courseData 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {courseData ? `Secure Your Spot - $${finalPrice}` : 'Loading...'}
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
          <div className="text-center bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 lg:p-8 mb-8 lg:mb-12">
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
              Begin Your Transformation - ${finalPrice}
            </button>
            <p className="text-green-300 text-xs lg:text-sm mt-3 lg:mt-4">
              ✓ Lifetime Access ✓ Start Immediately ✓ Expert Support ✓ Real Results
            </p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-gray-700">
          <div className="text-center">
            <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Need Support?</h3>
            <p className="text-blue-200 text-sm lg:text-base mb-6">
              Have questions about the course or need assistance? We're here to help!
            </p>
            
            <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 inline-block">
              <div className="flex items-center justify-center gap-3">
                <div className="text-2xl">📱</div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm lg:text-base">WhatsApp Support</p>
                  <a 
                    href="https://wa.me/447737007508" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-bold text-lg transition-colors"
                  >
                    +44 7737 007508
                  </a>
                </div>
              </div>
              <p className="text-blue-200 text-xs lg:text-sm mt-2">
                Available Monday - Friday, 9 AM - 6 PM GMT
              </p>
            </div>
            
            <p className="text-gray-400 text-xs lg:text-sm mt-6">
              © 2025 Collab-Nest. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}