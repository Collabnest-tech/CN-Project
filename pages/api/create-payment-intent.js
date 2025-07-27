import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, customerInfo, referralCode, userId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Fetch the price from Stripe to get accurate pricing
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price.active) {
      return res.status(400).json({ error: 'Price is not active' })
    }

    let finalAmount = price.unit_amount // Amount in pence (for GBP) or cents (for USD)
    let validReferralCode = null

    // Apply referral discount if provided and valid
    if (referralCode && referralCode.trim()) {
      // Verify referral code exists and belongs to a user who has paid
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, referral_code, has_paid')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .eq('has_paid', true)
        .single()

      if (!referrerError && referrer) {
        // Apply £5 discount for GBP (500 pence) or $5 discount for USD (500 cents)
        const discountAmount = price.currency === 'gbp' ? 500 : 500 // 500 pence = £5, 500 cents = $5
        finalAmount = Math.max(finalAmount - discountAmount, 500) // Minimum £5 or $5
        validReferralCode = referralCode.trim().toUpperCase()
        const discountDisplay = price.currency === 'gbp' ? '£5' : '$5'
        console.log(`Valid referral code applied: ${validReferralCode}, discount: ${discountDisplay}`)
      } else {
        console.log(`Invalid referral code: ${referralCode}`)
      }
    }

    // Create payment intent with proper metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: price.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId,
        referralCode: validReferralCode || '',
        customerEmail: customerInfo.email,
        customerName: customerInfo.fullName,
        country: customerInfo.country,
        originalPriceId: priceId,
        originalAmount: price.unit_amount.toString(),
        finalAmount: finalAmount.toString(),
        discountApplied: finalAmount < price.unit_amount ? 'true' : 'false',
        currency: price.currency
      },
      receipt_email: customerInfo.email,
      description: `AI Course Purchase - ${customerInfo.fullName}`,
    })

    // Store pending transaction in database
    const { error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_price_id: priceId,
        amount: finalAmount / 100, // Store in pounds/dollars
        original_amount: price.unit_amount / 100, // Store in pounds/dollars
        currency: price.currency,
        status: 'pending',
        referral_code: validReferralCode,
        customer_info: customerInfo,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error while storing transaction:', dbError)
    }

    // Determine currency symbol for response
    const currencySymbol = price.currency === 'gbp' ? '£' : '$'

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      amount: finalAmount / 100, // Return in pounds/dollars
      currency: price.currency.toUpperCase(),
      currency_symbol: currencySymbol,
      discount_applied: finalAmount < price.unit_amount,
      original_amount: price.unit_amount / 100
    })

  } catch (error) {
    console.error('Stripe payment intent creation error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    })
  }
}