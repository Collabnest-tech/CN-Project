import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, referralCode } = req.body

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.authorization?.replace('Bearer ', '')
    )

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    console.log('🔥 Creating checkout session for user:', user.id, user.email)
    console.log('🔥 Referral code:', referralCode)

    // Create Stripe checkout session with comprehensive metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId, // This automatically gets the correct currency from Stripe
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout?priceId=${priceId}&referral=${referralCode || ''}`,
      
      // CRITICAL: Include all necessary metadata in the checkout session
      metadata: {
        userId: user.id,           // Supabase auth user ID
        customerEmail: user.email, // User's email
        referralCode: referralCode || '', // Referral code if provided
      },
      
      // Also set customer email directly
      customer_email: user.email,
      
      // Collect customer details
      billing_address_collection: 'required',
    })

    console.log('✅ Checkout session created:', session.id)
    
    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    })
  }
}