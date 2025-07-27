import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

export default function PaymentSuccess() {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    checkUserSession()
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  async function checkUserSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session) {
        // Poll for payment status update (sometimes webhook takes a moment)
        let attempts = 0
        const maxAttempts = 10
        
        const checkPaymentStatus = async () => {
          const { data, error } = await supabase
            .from('users')
            .select('has_paid')
            .eq('id', session.user.id)
            .single()
          
          if (!error && data && data.has_paid) {
            setUserPaid(true)
            setLoading(false)
            return true
          }
          
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(checkPaymentStatus, 2000) // Check every 2 seconds
          } else {
            setLoading(false) // Stop loading after max attempts
          }
          return false
        }
        
        await checkPaymentStatus()
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user session:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Processing your payment...</p>
          <p className="text-blue-200 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Expired</h1>
          <p className="text-blue-200 mb-4">Please log in to view your purchase status</p>
          <Link href="/login">
            <a className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Log In
            </a>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-sm sm:max-w-lg md:max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="Collab-Nest Logo"
            width={80}
            height={80}
            className="rounded-full shadow-lg mx-auto mb-6"
          />
        </div>

        {userPaid ? (
          /* Success State */
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎉 Payment Successful!
            </h1>
            
            <p className="text-lg sm:text-xl text-green-400 mb-6">
              Welcome to the AI Money-Making Revolution!
            </p>

            {/* What's Next */}
            <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 sm:p-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">What happens next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <p className="text-blue-200">Your account has been upgraded with full course access</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <p className="text-blue-200">All 8 AI modules are now unlocked and ready to watch</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <p className="text-blue-200">You have lifetime access to all course materials</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <p className="text-blue-200">Your referral code is active - start earning $5 per referral!</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#181e29] rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Your Course Access</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">8</div>
                  <div className="text-sm text-gray-300">Modules Unlocked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">6+</div>
                  <div className="text-sm text-gray-300">Hours of Content</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/courses">
                <a className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
                  Start Learning Now 🚀
                </a>
              </Link>
              
              <Link href="/profile-referrals">
                <a className="block w-full border-2 border-blue-400 hover:bg-blue-400 hover:bg-opacity-20 text-blue-300 hover:text-white px-8 py-3 rounded-xl font-bold transition-all">
                  Share & Earn Referrals 💰
                </a>
              </Link>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-8 p-4 bg-blue-900 bg-opacity-50 rounded-lg">
              <p className="text-blue-200 text-sm">
                Redirecting to homepage in <span className="font-bold text-white">{countdown}</span> seconds...
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-blue-400 hover:text-blue-300 text-sm underline mt-1"
              >
                Go now
              </button>
            </div>
          </div>
        ) : (
          /* Payment Processing/Failed State */
          <div className="text-center">
            <div className="mx-auto mb-6 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Payment Processing...
            </h1>
            
            <p className="text-yellow-400 mb-6">
              We're still processing your payment. This may take a few minutes.
            </p>

            <div className="bg-yellow-900 bg-opacity-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-3">What to do?</h3>
              <div className="space-y-2 text-left text-yellow-200">
                <p>• Wait a few more minutes for processing to complete</p>
                <p>• Check your email for a payment confirmation</p>
                <p>• If issues persist, contact our support team</p>
                <p>• You can also try refreshing this page</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                Refresh Page
              </button>
              
              <Link href="/">
                <a className="block w-full border-2 border-gray-400 hover:bg-gray-400 hover:bg-opacity-20 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-bold transition-all">
                  Return to Homepage
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}