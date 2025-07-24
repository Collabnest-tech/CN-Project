import Link from 'next/link'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function ModuleCard({ moduleNumber, title, locked }) {
  return (
    <div className={`p-4 rounded shadow ${locked ? 'bg-gray-200' : 'bg-white'} flex flex-col items-center`}>
      <div className="text-lg font-bold mb-2">Module {moduleNumber}</div>
      <div className="mb-4">{title}</div>
      {locked ? (
        <span className="text-sm text-gray-500">Locked</span>
      ) : (
        <Link href={`/courses/1/modules/${moduleNumber}`}>
          <a className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">View Module</a>
        </Link>
      )}
    </div>
  );
}

export default function Courses() {
  const [paid, setPaid] = useState(false) // Replace with real payment logic

  async function handleStripeCheckout() {
    const stripe = await stripePromise
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    })
    if (!res.ok) {
      alert('Failed to start checkout.')
      return
    }
    const { sessionId } = await res.json()
    stripe.redirectToCheckout({ sessionId })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-purple-700 mb-8 text-center">Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Course 1 */}
        <div className="bg-white rounded shadow p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Using AI to Make Money Online</h2>
          <p className="mb-4 text-gray-700">A step-by-step course on leveraging AI tools for online income.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <ModuleCard
                key={i + 1}
                moduleNumber={i + 1}
                title={`Module ${i + 1} Title`}
                locked={!paid}
              />
            ))}
          </div>
          {!paid && (
            <button
              onClick={handleStripeCheckout}
              className="mb-6 px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Purchase Full Course
            </button>
          )}
          {/* Learning Flow Diagram */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Learning Flow</h3>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold">1</div>
                <span className="text-xs mt-1">Intro</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold">2</div>
                <span className="text-xs mt-1">Module</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold">3</div>
                <span className="text-xs mt-1">Quiz</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold">4</div>
                <span className="text-xs mt-1">Certificate</span>
              </div>
            </div>
          </div>
        </div>
        {/* Coming Soon Card */}
        <div className="bg-gray-200 rounded shadow p-6 flex flex-col items-center justify-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-500 mb-2">Coming Soon</h2>
            <p className="text-gray-500">More courses are on the way. Stay tuned!</p>
          </div>
        </div>
      </div>
    </div>
  )
}


