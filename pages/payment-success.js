import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PaymentSuccess() {
  const router = useRouter()
  const { session_id } = router.query
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session_id) {
      verifyPayment()
    }
  }, [session_id])

  const verifyPayment = async () => {
    try {
      setLoading(true)
      
      // Verify the checkout session and get user status
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: session_id })
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus(data)
        
        // Redirect to course after a delay
        setTimeout(() => {
          router.push('/course')
        }, 3000)
      } else {
        setError(data.error || 'Payment verification failed')
      }
    } catch (err) {
      console.error('Error verifying payment:', err)
      setError('Failed to verify payment status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/pricing')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. You now have access to the course.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to course in a few seconds...
        </p>
        <button 
          onClick={() => router.push('/courses')}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Access Course Now
        </button>
      </div>
    </div>
  )
}