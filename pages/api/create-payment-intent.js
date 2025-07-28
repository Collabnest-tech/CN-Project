import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, customerInfo, referralCode } = req.body

    console.log('📥 Received payment intent request:', {
      priceId,
      customerInfo,
      referralCode
    })

    // ✅ Validate required fields
    if (!priceId) {
      console.error('❌ Missing priceId')
      return res.status(400).json({ error: 'Price ID is required' })
    }

    if (!customerInfo?.email) {
      console.error('❌ Missing customer email')
      return res.status(400).json({ error: 'Customer email is required' })
    }

    if (!customerInfo?.name) {
      console.error('❌ Missing customer name')
      return res.status(400).json({ error: 'Customer name is required' })
    }

    // ✅ Get the session to verify user is authenticated
    const authHeader = req.headers.authorization
    if (!authHeader) {
      console.error('❌ No authorization header')
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    console.log('✅ User authenticated:', user.email)

    // ✅ Get price details from Stripe
    let price
    try {
      price = await stripe.prices.retrieve(priceId)
      console.log('✅ Retrieved price:', price.id, price.unit_amount, price.currency)
    } catch (stripeError) {
      console.error('❌ Stripe price retrieval error:', stripeError)
      return res.status(400).json({ error: 'Invalid price ID' })
    }

    // ✅ Create payment intent with comprehensive metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        customerCountry: customerInfo.country || 'GB',
        referralCode: referralCode || '',
        priceId: priceId,
        userId: user.id
      },
    })

    console.log('✅ Payment intent created:', paymentIntent.id)

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('❌ Error creating payment intent:', error)
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    })
  }
}