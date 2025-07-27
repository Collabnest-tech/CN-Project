// pages/checkout.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Head from 'next/head'

export default function Checkout() {
  const router = useRouter()
  const { priceId, referral } = router.query
  
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

  const handleCustomCheckout = async (e) => {
    e.preventDefault()
    
    if (!session) {
      setError('Please log in to continue')
      return
    }

    if (!customerInfo.name.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!priceId) {
      setError('No price ID provided')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Creating checkout session...')
      
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId: priceId,
          referralCode: referral || ''
        }),
      })

      const responseData = await response.json()

      if (!response.ok || responseData.error) {
        setError(responseData.error || 'Failed to create checkout session')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      if (responseData.url) {
        console.log('Redirecting to Stripe Checkout...')
        window.location.href = responseData.url
      } else {
        setError('Failed to create checkout session')
        setLoading(false)
      }

    } catch (err) {
      console.error('Checkout error:', err)
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                  <h3 className="font-medium">AI for Making Money Online</h3>
                  <p className="text-gray-600">Full Course Access & Lifetime Updates</p>
                  {priceId && (
                    <p className="text-sm text-gray-500 mt-1">Price ID: {priceId}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    $15.00
                  </p>
                </div>
              </div>
              
              {referral && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Referral code applied: <strong>{referral}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* User Information Display */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-2">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Name:</strong> {session.user.user_metadata?.full_name || 'Not provided'}</p>
              </div>
            </div>

            {/* Stripe Buy Button */}
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Purchase (Recommended)</h3>
              <div className="flex justify-center">
                <stripe-buy-button
                  buy-button-id="buy_btn_1RjMCTGh6fpaudVTgYPuYixf"
                  publishable-key="pk_test_51RjLwaGh6fpaudVTD3HSyfTeWmXJhW8lyNiBRKLmFk1Jc1Zypn4yUbDXebdw8VzLkN5IlziPsR0YimP033WZiWNX00ixp9qFBY"
                ></stripe-buy-button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Fast, secure checkout powered by Stripe
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 px-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Custom Checkout Form (Alternative) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Checkout</h3>
              <form onSubmit={handleCustomCheckout} className="space-y-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <option value="CH">Switzerland</option>
                    <option value="AT">Austria</option>
                    <option value="IE">Ireland</option>
                    <option value="PT">Portugal</option>
                    <option value="GR">Greece</option>
                    <option value="PL">Poland</option>
                    <option value="CZ">Czech Republic</option>
                    <option value="HU">Hungary</option>
                    <option value="RO">Romania</option>
                    <option value="BG">Bulgaria</option>
                    <option value="HR">Croatia</option>
                    <option value="SI">Slovenia</option>
                    <option value="SK">Slovakia</option>
                    <option value="LT">Lithuania</option>
                    <option value="LV">Latvia</option>
                    <option value="EE">Estonia</option>
                    <option value="MT">Malta</option>
                    <option value="CY">Cyprus</option>
                    <option value="LU">Luxembourg</option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Custom Checkout'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>🔒 Secure payment powered by Stripe</p>
              <p className="mt-2 text-xs">
                After payment, you'll receive instant access to the course
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

