import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    console.log('🔥 Verifying payment for session:', sessionId)

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        payment_status: session.payment_status 
      })
    }

    // Get user info from session metadata
    const userId = session.metadata?.userId
    const customerEmail = session.customer_details?.email || session.metadata?.customerEmail

    console.log('🔥 Session details:', {
      paymentStatus: session.payment_status,
      userId,
      customerEmail
    })

    // Verify user exists and has paid status in our database
    let user = null
    
    if (userId) {
      const { data: userById } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      user = userById
    }

    if (!user && customerEmail) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerEmail.toLowerCase())
        .single()
      
      user = userByEmail
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      success: true,
      payment_status: session.payment_status,
      user: {
        id: user.id,
        email: user.email,
        has_paid: user.has_paid,
        payment_date: user.payment_date
      },
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency
      }
    })

  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    })
  }
}