// pages/checkout.js
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

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
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

