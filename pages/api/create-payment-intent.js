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
    const { priceId, customerName, customerEmail, referralCode } = req.body

    if (!priceId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price) {
      return res.status(404).json({ error: 'Price not found' })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        priceId: priceId,
        customerEmail: customerEmail,
        customerName: customerName || '',
        referralCode: referralCode || '',
      },
    })

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    })
  }
}