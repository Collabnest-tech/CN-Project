// pages/checkout.js
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import DropdownNavbar from '../components/DropdownNavbar'
import { useTranslations } from '../lib/translations'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// CheckoutForm component inline
function CheckoutForm({ priceId, referral, courseDetails, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    country: 'GB'
  })
  const { t } = useTranslations()

  useEffect(() => {
    // Get user's email from session
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setCustomerInfo(prev => ({
          ...prev,
          email: session.user.email
        }))
      }
    }
    fetchUserEmail()
  }, [])

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) return
    
    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          customerInfo,
          referralCode: referral
        })
      })

      const { clientSecret, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      // Confirm payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              country: customerInfo.country
            }
          }
        }
      })

      if (confirmError) {
        setError(confirmError.message)
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Customer Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.payment.fullName} *
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({
              ...prev,
              name: e.target.value
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t.payment.fullName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.payment.email}
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
            {t.payment.country}
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

      {/* Card Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.payment.cardInfo} *
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
            {t.payment.processing}
          </div>
        ) : (
          `${t.payment.completePayment} - ${courseDetails ? `${courseDetails.currency.toUpperCase()} ${(courseDetails.unit_amount / 100).toFixed(2)}` : 'Loading...'}`
        )}
      </button>

      {/* Payment Support Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">📞</span>
          <h4 className="text-blue-800 font-semibold">{t.payment.issues}</h4>
        </div>
        <p className="text-blue-700 text-sm mb-2">
          {t.payment.contact}
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
        
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg">🇵🇰</span>
            <span className="text-orange-800 font-semibold text-sm">{t.payment.pakistani}</span>
          </div>
          <p className="text-orange-700 text-xs">
            {t.payment.jazzcash}
          </p>
        </div>
        
        <p className="text-blue-600 text-xs mt-2">
          {t.payment.whatsapp}
        </p>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 {t.payment.securePayment}</p>
        <p className="mt-1">{t.payment.noCardStorage}</p>
      </div>
    </form>
  )
}

// Main Checkout Component
export default function Checkout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPriceId, setSelectedPriceId] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [referralInput, setReferralInput] = useState('')
  const [referralValid, setReferralValid] = useState(null)
  const [referralChecking, setReferralChecking] = useState(false)
  const { t } = useTranslations()
  const router = useRouter()

  useEffect(() => {
    checkUserSession()
    fetchCourseDetails()
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/auth')
      return
    }
    
    setSession(session)
    setLoading(false)
  }

  async function fetchCourseDetails() {
    try {
      const priceId = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROD 
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST

      setSelectedPriceId(priceId)

      const response = await fetch('/api/get-price-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      if (response.ok) {
        const details = await response.json()
        setCourseDetails(details)
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
    }
  }

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return
    
    setReferralChecking(true)
    try {
      const response = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralInput.trim().toUpperCase() })
      })
      
      const result = await response.json()
      setReferralValid(result.valid)
      
      if (result.valid) {
        // Apply discount
        const discountedPrice = process.env.NODE_ENV === 'production' ? 4000 : 500 // $40 -> $35 or $5 -> $0 in test
        setCourseDetails(prev => prev ? { ...prev, unit_amount: discountedPrice } : null)
      }
    } catch (error) {
      console.error('Error validating referral:', error)
      setReferralValid(false)
    } finally {
      setReferralChecking(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DropdownNavbar session={session} />
      
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.payment.orderSummary}</h2>
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

          {/* Referral Code Section */}
          <div className="bg-white rounded-lg p-6 mb-8 border">
            <h3 className="text-lg font-semibold mb-4">{t.payment.referralCode}</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder={t.payment.enterCode}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
              <button
                onClick={handleApplyReferral}
                disabled={referralChecking}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {referralChecking ? t.payment.checking : t.payment.apply}
              </button>
            </div>
            
            {/* Referral Status */}
            {referralValid === true && (
              <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-lg">
                <p className="text-green-800 text-sm">
                  🎉 {t.payment.validCode}
                </p>
              </div>
            )}
            {referralValid === false && (
              <div className="mt-3 p-3 bg-red-100 border border-red-400 rounded-lg">
                <p className="text-red-800 text-sm">
                  ❌ {t.payment.invalidCode}
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              {t.payment.saveDiscount}
            </p>
          </div>

          {/* Checkout Form */}
          {selectedPriceId && (
            <div className="bg-white rounded-lg p-6 border">
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  priceId={selectedPriceId}
                  referral={referralValid ? referralInput : ''}
                  courseDetails={courseDetails}
                  onSuccess={() => router.push('/courses')}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

