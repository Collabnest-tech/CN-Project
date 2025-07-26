// pages/checkout.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/',
      },
    })

    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto my-16 p-8 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-semibold text-purple-700 mb-4">
        Purchase “Making Money Online with AI”
      </h2>
      <PaymentElement className="mb-4" />
      {message && (
        <div className="text-red-500 mb-4">{message}</div>
      )}
      <button
        disabled={!stripe || loading}
        className={`w-full py-2 rounded text-white font-medium ${
          loading
            ? 'bg-purple-300'
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  )
}

export default function Checkout() {
  const router = useRouter()
  const { price, referral } = router.query
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setSession(session)
  }

  const supportedCountries = [
    { code: 'PK', name: 'Pakistan', currency: 'PKR', rate: 280 },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT', rate: 110 },
    { code: 'AE', name: 'UAE', currency: 'AED', rate: 3.67 },
    { code: 'OM', name: 'Oman', currency: 'OMR', rate: 0.38 },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', rate: 3.75 },
    { code: 'US', name: 'United States', currency: 'USD', rate: 1 }
  ]

  const selectedCountry = supportedCountries.find(c => c.code === country)
  const localPrice = selectedCountry ? Math.round((price || 20) * selectedCountry.rate) : (price || 20)

  async function handlePayment() {
    setLoading(true)
    
    try {
      if (country === 'US') {
        // Stripe for US
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: price || 20,
            referral: referral || '',
            userId: session.user.id
          })
        })
        const { url } = await response.json()
        window.location.href = url
      } else {
        // Alternative payment for other countries
        const response = await fetch('/api/create-local-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: localPrice,
            currency: selectedCountry.currency,
            country: country,
            referral: referral || '',
            userId: session.user.id,
            paymentMethod: paymentMethod
          })
        })
        const { paymentUrl } = await response.json()
        window.location.href = paymentUrl
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#181e29] rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Purchase</h1>
          
          {/* Course Summary */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">AI for Making Money Online</h2>
            <p className="text-blue-200 mb-4">Complete course with 8 modules + lifetime access</p>
            <div className="text-2xl font-bold text-green-400">
              {selectedCountry ? `${selectedCountry.currency} ${localPrice}` : `$${price || 20}`}
            </div>
            {referral && (
              <div className="text-sm text-green-300 mt-2">
                ✅ Referral code applied: {referral}
              </div>
            )}
          </div>

          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Your Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white"
              required
            >
              <option value="">Choose your country</option>
              {supportedCountries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Selection */}
          {country && country !== 'US' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Bank Transfer
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="mobile_wallet"
                    checked={paymentMethod === 'mobile_wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Mobile Wallet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="crypto"
                    checked={paymentMethod === 'crypto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Cryptocurrency
                </label>
              </div>
            </div>
          )}

          {/* Terms Agreement */}
          <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-400 mb-2">⚠️ Important: No Refund Policy</h3>
            <p className="text-sm text-red-200 mb-3">
              All sales are final. No refunds, returns, or exchanges. By purchasing, you agree to our terms.
            </p>
            <Link href="/terms">
              <a className="text-blue-400 hover:text-blue-300 text-sm underline">
                Read full Terms and Conditions
              </a>
            </Link>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !country || (country !== 'US' && !paymentMethod)}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg transition-all"
          >
            {loading ? 'Processing...' : `Complete Purchase - ${selectedCountry ? `${selectedCountry.currency} ${localPrice}` : `$${price || 20}`}`}
          </button>

          <div className="text-center mt-4">
            <Link href="/">
              <a className="text-gray-400 hover:text-gray-300">← Back to Home</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

