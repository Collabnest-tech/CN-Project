// pages/checkout.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Head from 'next/head'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const CheckoutForm = ({ priceId, referral, courseDetails, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    country: 'GB'
  })

  useEffect(() => {
    // Get user session and pre-fill email
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setCustomerInfo(prev => ({
          ...prev,
          email: session.user.email
        }))
      }
    }
    getUserSession()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!stripe || !elements) {
      setError('Stripe not loaded')
      setLoading(false)
      return
    }

    // ✅ Validate required fields
    if (!customerInfo.name.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (!customerInfo.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    try {
      // ✅ Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Please log in to complete your purchase')
        setLoading(false)
        return
      }

      // Create payment intent with auth token
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // ✅ Add auth token
        },
        body: JSON.stringify({
          priceId: priceId,
          customerInfo: {
            email: customerInfo.email,
            name: customerInfo.name,
            country: customerInfo.country
          },
          referralCode: referral || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Network response was not ok')
      }

      const { client_secret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      if (!client_secret) {
        throw new Error('No client secret received')
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      onSuccess()
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({
              ...prev,
              name: e.target.value
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={customerInfo.email}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">
            This is your account email and cannot be changed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={customerInfo.country}
            onChange={(e) => setCustomerInfo(prev => ({
              ...prev,
              country: e.target.value
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="UAE">United Arab Emirates</option>
            <option value="PK">Pakistan</option>
            <option value="IT">Italy</option>
            <option value="ES">Spain</option>
            <option value="NL">Netherlands</option>
            <option value="BE">Belgium</option>
            <option value="SE">Sweden</option>
            <option value="NO">Norway</option>
            <option value="DK">Denmark</option>
            <option value="FI">Finland</option>
          </select>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information *
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Your payment information is secure and encrypted
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Processing Payment...
          </div>
        ) : (
          `Complete Payment - ${courseDetails ? `${courseDetails.currency.toUpperCase()} ${(courseDetails.unit_amount / 100).toFixed(2)}` : 'Loading...'}`
        )}
      </button>

      {/* ✅ Enhanced Payment Support Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">📞</span>
          <h4 className="text-blue-800 font-semibold">Payment Issues?</h4>
        </div>
        <p className="text-blue-700 text-sm mb-2">
          Having trouble with your payment? Contact us directly for immediate assistance:
        </p>
        <a 
          href="https://wa.me/447547131573" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-bold transition-colors"
        >
          <span className="text-lg">💬</span>
          +44 7547 131573
        </a>
        
        {/* ✅ JazzCash/EasyPaisa Notice */}
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg">🇵🇰</span>
            <span className="text-orange-800 font-semibold text-sm">Pakistani Customers</span>
          </div>
          <p className="text-orange-700 text-xs">
            For <strong>JazzCash</strong> & <strong>EasyPaisa</strong> payments, contact the same number above
          </p>
        </div>
        
        <p className="text-blue-600 text-xs mt-2">
          WhatsApp • Fast response • Available now
        </p>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Your payment is secured by Stripe's industry-leading encryption</p>
        <p className="mt-1">We never store your card information</p>
      </div>
    </form>
  )
}

export default function Checkout() {
  const router = useRouter()
  const { referral } = router.query
  const [courseDetails, setCourseDetails] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [referralValid, setReferralValid] = useState(null)
  const [selectedPriceId, setSelectedPriceId] = useState(null)
  const [referralInput, setReferralInput] = useState(referral || '')
  const [referralChecking, setReferralChecking] = useState(false)

  useEffect(() => {
    // Initialize with default price first
    setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
    fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)

    // Then validate referral if provided
    if (referral) {
      setReferralInput(referral)
      validateReferralCode(referral)
    }
  }, [referral])

  const fetchCourseDetails = async (priceId) => {
    try {
      const response = await fetch('/api/get-course-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourseDetails(data)
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
    }
  }

  const validateReferralCode = async (code) => {
    if (!code.trim()) {
      setReferralValid(null)
      setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
      fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
      return
    }

    setReferralChecking(true)
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, referral_code, has_paid, full_name')
        .eq('referral_code', code.trim().toUpperCase())
        .eq('has_paid', true)
        .single()

      if (!error && data) {
        setReferralValid(true)
        setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DISCOUNT_PRICE_ID)
        fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DISCOUNT_PRICE_ID)
        console.log('✅ Valid referral code applied:', code)
      } else {
        setReferralValid(false)
        setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
        fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
        console.log('❌ Invalid referral code:', code)
      }
    } catch (error) {
      console.error('Error validating referral code:', error)
      setReferralValid(false)
      setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
      fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
    } finally {
      setReferralChecking(false)
    }
  }

  // ✅ Fix the apply referral function to update URL
  const handleApplyReferral = () => {
    const trimmedCode = referralInput.trim().toUpperCase()
    
    if (trimmedCode) {
      // Update URL with referral code
      router.push(`/checkout?referral=${trimmedCode}`, undefined, { shallow: true })
      // Validate the referral code
      validateReferralCode(trimmedCode)
    } else {
      // Remove referral from URL if empty
      router.push('/checkout', undefined, { shallow: true })
      validateReferralCode('')
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    router.push('/courses')
  }

  // ... loading state

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between items-center">
            <span>AI Marketing Mastery Course</span>
            <span className="font-semibold">
              {courseDetails ? `${courseDetails.currency.toUpperCase()} ${(courseDetails.unit_amount / 100).toFixed(2)}` : 'Loading...'}
            </span>
          </div>
          {referralValid && (
            <div className="mt-2 text-green-600 text-sm">
              ✅ Referral discount applied - You saved $5!
            </div>
          )}
        </div>

        {/* ✅ Referral Code Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border">
          <h3 className="text-lg font-semibold mb-4">Have a Referral Code?</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={10}
            />
            <button
              onClick={handleApplyReferral}
              disabled={referralChecking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {referralChecking ? 'Checking...' : 'Apply'}
            </button>
          </div>
          
          {/* Referral Status */}
          {referralValid === true && (
            <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-800 text-sm">
                🎉 Valid referral code applied! You saved $5!
              </p>
            </div>
          )}
          {referralValid === false && (
            <div className="mt-3 p-3 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-red-800 text-sm">
                ❌ Invalid referral code. Please check and try again.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            Enter a valid referral code to save $5 on your purchase!
          </p>
        </div>

        {/* Checkout Form */}
        {selectedPriceId && (
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              priceId={selectedPriceId}
              referral={referralValid ? referralInput : ''} // ✅ Only pass if valid
              courseDetails={courseDetails}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}

