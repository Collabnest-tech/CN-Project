import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, customerInfo, referralCode, userId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Get the price from Stripe
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price.active) {
      return res.status(400).json({ error: 'Price is not active' })
    }

    let finalAmount = price.unit_amount
    let validReferralCode = null

    // Apply referral discount if provided and valid
    if (referralCode && referralCode.trim()) {
      // Verify referral code exists and belongs to a user who has paid
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, referral_code, has_paid')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .eq('has_paid', true) // Only paid users have active referral codes
        .single()

      if (!referrerError && referrer) {
        // Apply $5 discount (500 cents)
        finalAmount = Math.max(finalAmount - 500, 500) // Minimum $5
        validReferralCode = referralCode.trim().toUpperCase()
        console.log(`Valid referral code applied: ${validReferralCode}`)
      } else {
        console.log(`Invalid referral code: ${referralCode}`)
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: price.currency,
      metadata: {
        userId,
        referralCode: validReferralCode || '',
        customerEmail: customerInfo.email,
        customerName: customerInfo.fullName,
        country: customerInfo.country,
        originalPriceId: priceId,
        discountApplied: finalAmount < price.unit_amount ? 'true' : 'false'
      },
      receipt_email: customerInfo.email,
    })

    // Store pending transaction in database
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_price_id: priceId,
        amount: finalAmount / 100,
        original_amount: price.unit_amount / 100,
        currency: price.currency,
        status: 'pending',
        referral_code: validReferralCode,
        customer_info: customerInfo,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      amount: finalAmount / 100,
      currency: price.currency.toUpperCase(),
      discount_applied: finalAmount < price.unit_amount
    })

  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    })
  }
}