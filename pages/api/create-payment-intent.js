import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount, currency, customerInfo, referralCode, userId } = req.body

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        referralCode: referralCode || '',
        customerEmail: customerInfo.email,
        customerName: customerInfo.fullName,
        country: customerInfo.country
      },
      receipt_email: customerInfo.email,
    })

    // Store pending transaction in database
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount / 100, // Convert cents to dollars
        currency,
        status: 'pending',
        referral_code: referralCode || null,
        customer_info: customerInfo,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway, we can update later via webhook
    }

    res.status(200).json({
      client_secret: paymentIntent.client_secret
    })

  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    })
  }
}