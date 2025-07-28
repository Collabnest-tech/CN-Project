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
  const [session, setSession] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    country: 'GB'
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }
    setSession(session)
    setCustomerInfo(prev => ({
      ...prev,
      email: session.user.email || '',
      name: session.user.user_metadata?.full_name || ''
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!stripe || !elements) {
      setError('Stripe not loaded')
      setLoading(false)
      return
    }

    try {
      // Create payment intent with referral code metadata
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          customerInfo: {
            email: customerInfo.email,
            name: customerInfo.name,
            country: customerInfo.country
          },
          referralCode: referral || '', // ✅ This comes from URL or manual input
        }),
      })

      const { client_secret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
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
            <option value="DE">Germany</option>
            <option value="FR">France</option>
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
    validateReferralAndSetPrice()
  }, [referral])

  const validateReferralAndSetPrice = async () => {
    let isValidReferral = false
    
    // Validate referral code if provided
    if (referral && referral.trim()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, referral_code, has_paid, full_name')
          .eq('referral_code', referral.trim().toUpperCase())
          .eq('has_paid', true)
          .single()

        if (!error && data) {
          isValidReferral = true
          setReferralValid(true)
        } else {
          setReferralValid(false)
        }
      } catch (error) {
        console.error('Error validating referral code:', error)
        setReferralValid(false)
      }
    }

    // Set price ID based on referral validity
    const priceId = isValidReferral 
      ? process.env.NEXT_PUBLIC_STRIPE_DISCOUNT_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID

    setSelectedPriceId(priceId)
    
    // Fetch course details with the selected price
    if (priceId) {
      fetchCourseDetails(priceId)
    }
  }

  const fetchCourseDetails = async (priceId) => {
    try {
      const response = await fetch('/api/get-price-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourseDetails(data.price)
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      // Fallback pricing
      setCourseDetails({
        id: priceId,
        unit_amount: isValidReferral ? 2000 : 2500, // $20 or $25
        currency: 'usd',
        product: {
          name: 'AI for Making Money Online',
          description: 'Full Course Access & Lifetime Updates'
        }
      })
    }
  }

  const handlePaymentSuccess = (paymentIntentId) => {
    setPaymentSuccess(true)
    // Redirect to course after a delay
    setTimeout(() => {
      router.push('/courses?payment=success')
    }, 3000)
  }

  // Validate referral code
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
      } else {
        setReferralValid(false)
        setSelectedPriceId(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
        fetchCourseDetails(process.env.NEXT_PUBLIC_STRIPE_DEFAULT_PRICE_ID)
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

  // Apply referral handler
  const handleApplyReferral = () => {
    validateReferralCode(referralInput)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-green-500 text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
          <p className="text-gray-700 mb-6">
            Thank you for your purchase! You now have lifetime access to the AI for Making Money Online course.
          </p>
          <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              <strong>Welcome to the course!</strong><br/>
              You'll be redirected to your course dashboard in a few seconds.
            </p>
          </div>
          <button 
            onClick={() => router.push('/courses')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Access Course Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <script async src="https://js.stripe.com/v3/buy-button.js"></script>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Complete Your Purchase
            </h1>

            {/* Course Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {courseDetails?.product?.name || "AI for Making Money Online"}
                  </h3>
                  <p className="text-gray-600">
                    {courseDetails?.product?.description || "Full Course Access & Lifetime Updates"}
                  </p>
                  {selectedPriceId && (
                    <p className="text-sm text-gray-500 mt-1">Price ID: {selectedPriceId}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {courseDetails ? 
                      `${courseDetails.currency.toUpperCase()} ${(courseDetails.unit_amount / 100).toFixed(2)}` 
                      : 'Loading...'
                    }
                  </p>
                </div>
              </div>
              
              {referral && (
                <div className={`mt-4 p-3 rounded-lg ${
                  referralValid 
                    ? 'bg-green-100 border border-green-400' 
                    : 'bg-red-100 border border-red-400'
                }`}>
                  <p className={`text-sm ${referralValid ? 'text-green-800' : 'text-red-800'}`}>
                    {referralValid 
                      ? `🎉 Referral code applied: ${referral.toUpperCase()} - You saved $5!`
                      : `❌ Invalid referral code: ${referral.toUpperCase()}`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Referral Code Section */}
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
                  disabled={referralChecking || !referralInput.trim()}
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

            {/* Stripe Elements Wrapper */}
            {selectedPriceId && (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  priceId={selectedPriceId}
                  referral={referralValid ? referralInput : ''}
                  courseDetails={courseDetails}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

