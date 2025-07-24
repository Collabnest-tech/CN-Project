import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

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
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      setSession(session);
      // Fetch payment status from users table
      const { data, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single();
      setPaid(!!data?.has_paid);
      setLoading(false);
    });
  }, [router]);

  async function handleBuyNow() {
    if (!session) return;
    const stripe = await stripePromise;
    // Example: use a static priceId or get from your course data
    const priceId = "your_stripe_price_id";
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: session.user.id })
    });
    if (!res.ok) { console.error(await res.text()); return; }
    const { sessionId } = await res.json();
    stripe.redirectToCheckout({ sessionId });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-purple-700 text-lg">Loading...</span>
      </div>
    );
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
              onClick={handlePurchase}
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
      {/* Buy Now Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={handleBuyNow}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}