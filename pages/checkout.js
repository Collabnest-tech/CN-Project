// pages/checkout.js
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Image from 'next/image'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Austria', 'Switzerland', 'Ireland', 'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Slovenia', 'Slovakia', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Cyprus', 'Greece', 'Bulgaria', 'Romania', 'Croatia', 'Japan', 'Singapore', 'Hong Kong', 'New Zealand', 'South Korea', 'Taiwan', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt', 'South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Morocco', 'Tunisia', 'Algeria', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Paraguay', 'Bolivia', 'Ecuador', 'Venezuela', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Dominican Republic', 'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Bahamas', 'India', 'Malaysia', 'Thailand', 'Philippines', 'Indonesia', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Pakistan', 'Afghanistan', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Mongolia', 'China', 'Russia', 'Ukraine', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Turkey', 'Cyprus', 'Albania', 'Bosnia and Herzegovina', 'Montenegro', 'Serbia', 'North Macedonia', 'Kosovo'
].sort()

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [courseData, setCourseData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    fullName: '',
    country: '',
    address: '',
    city: '',
    postalCode: ''
  })

  const { priceId, referral = '', finalPrice } = router.query

  useEffect(() => {
    Promise.all([
      checkUserSession(),
      fetchCourseData()
    ])
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    
    if (session) {
      setCustomerInfo(prev => ({
        ...prev,
        email: session.user.email
      }))

      // Check if user already paid
      const { data, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()
      
      if (!error && data && data.has_paid) {
        router.push('/courses')
        return
      }
    }
  }

  async function fetchCourseData() {
    try {
      const response = await fetch('/api/get-product-info')
      if (response.ok) {
        const data = await response.json()
        setCourseData(data)
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    if (!session) {
      setError('Please log in to complete your purchase')
      return
    }

    if (!customerInfo.fullName || !customerInfo.country || !customerInfo.address || !customerInfo.city) {
      setError('Please fill in all required fields')
      return
    }

    if (!courseData || !courseData.price) {
      setError('Course pricing not available. Please refresh the page.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create payment intent using the price ID from Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: courseData.price.id,
          customerInfo,
          referralCode: referral,
          userId: session.user.id
        }),
      })

      const { client_secret, error: backendError, amount, currency_symbol } = await response.json()

      if (backendError) {
        setError(backendError)
        setLoading(false)
        return
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerInfo.fullName,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.postalCode,
              country: getCountryCode(customerInfo.country)
            }
          }
        }
      })

      if (stripeError) {
        setError(stripeError.message)
        setLoading(false)
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful - redirect to success page
        console.log('Payment succeeded, redirecting...')
        router.push('/payment-success')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  function getCountryCode(countryName) {
    const countryCodes = {
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Spain': 'ES',
      'Italy': 'IT',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      'Austria': 'AT',
      'Switzerland': 'CH',
      'Ireland': 'IE',
      'Portugal': 'PT',
      'Poland': 'PL',
      'Japan': 'JP',
      'Singapore': 'SG',
      'Hong Kong': 'HK',
      'New Zealand': 'NZ',
      'South Korea': 'KR',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'India': 'IN',
      'China': 'CN'
    }
    return countryCodes[countryName] || 'GB' // Default to GB for UK-based business
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: true
  }

  // Handle display price with proper currency symbol
  const getDisplayPrice = () => {
    if (finalPrice) {
      const symbol = courseData?.price?.currency_symbol || '£'
      return `${symbol}${finalPrice}`
    }
    if (courseData?.price?.formatted) {
      return courseData.price.formatted
    }
    return 'Loading...'
  }

  const displayPrice = getDisplayPrice()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Image
            src="/logo.jpeg"
            alt="Collab-Nest Logo"
            width={60}
            height={60}
            className="rounded-full shadow-lg mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-blue-200 text-sm">Secure checkout with Stripe</p>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200">{courseData?.name || 'AI for Making Money Online'}</span>
            <span className="text-white font-bold">{displayPrice}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200">8 Complete Modules</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200">Lifetime Access</span>
          </div>
          {referral && (
            <div className="flex justify-between items-center mb-2 text-green-300">
              <span>Referral Discount Applied</span>
              <span>✓</span>
            </div>
          )}
          <div className="border-t border-gray-600 pt-2 mt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-green-400">{displayPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-[#181e29] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Billing Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  required
                  disabled={!!session}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">Country *</label>
                <select
                  value={customerInfo.country}
                  onChange={(e) => setCustomerInfo({...customerInfo, country: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-1">Address *</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  required
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm mb-1">City *</label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    required
                    placeholder="London"
                  />
                </div>
                <div>
                  <label className="block text-blue-200 text-sm mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    placeholder="SW1A 1AA"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[#181e29] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Payment Information</h3>
            
            <div className="mb-4">
              <label className="block text-blue-200 text-sm mb-2">Card Details</label>
              <div className="bg-gray-700 p-3 rounded-lg">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-blue-200 mb-4">
              <span>🔒</span>
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-600 rounded-xl p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
              loading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing Payment...' : `Complete Purchase - ${displayPrice}`}
          </button>

          <div className="text-center text-xs text-gray-400">
            <p>By completing this purchase, you agree to our Terms of Service</p>
            <p>Powered by Stripe • 256-bit SSL Encryption</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

