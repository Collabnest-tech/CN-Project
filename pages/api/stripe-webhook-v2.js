import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to read the raw body
async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// Generate random referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default async function handler(req, res) {
  console.log('🔥 WEBHOOK V2 CALLED - Method:', req.method)
  console.log('🔥 Headers:', req.headers)
  
  // Immediately respond to any non-POST request
  if (req.method !== 'POST') {
    console.error('❌ Invalid method:', req.method)
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['POST'] })
  }

  const sig = req.headers['stripe-signature']
  
  if (!sig) {
    console.error('❌ No Stripe signature found')
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  if (!webhookSecret) {
    console.error('❌ No webhook secret configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }
  
  let event

  try {
    const buf = await buffer(req)
    console.log('🔥 Buffer length:', buf.length)
    
    if (buf.length === 0) {
      console.error('❌ Empty request body')
      return res.status(400).json({ error: 'Empty request body' })
    }
    
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    console.log('🔥 Event constructed successfully:', event.type)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      message: err.message 
    })
  }

  console.log('🔥 Webhook event received:', event.type)
  console.log('🔥 Event ID:', event.id)

  // ONLY handle payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    console.log('🔥 Processing payment_intent.succeeded')
    try {
      await handlePaymentSuccess(event.data.object)
      console.log('✅ Payment success handled')
      return res.status(200).json({ 
        received: true, 
        processed: true,
        event_type: event.type,
        event_id: event.id
      })
    } catch (error) {
      console.error('❌ Error processing payment:', error)
      return res.status(500).json({ 
        error: 'Failed to process payment',
        message: error.message 
      })
    }
  } else {
    console.log(`ℹ️ Ignoring event type: ${event.type}`)
    return res.status(200).json({ 
      received: true, 
      processed: false,
      event_type: event.type,
      message: 'Event type not handled'
    })
  }
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    console.log('🔥 handlePaymentSuccess called')
    console.log('🔥 Payment Intent ID:', paymentIntent.id)
    console.log('🔥 Payment Intent metadata:', JSON.stringify(paymentIntent.metadata, null, 2))
    
    const { userId, referralCode } = paymentIntent.metadata

    if (!userId) {
      console.error('❌ No userId found in payment intent metadata')
      throw new Error('No userId in metadata')
    }

    console.log('🔥 Processing payment success for user:', userId)

    // Generate referral code for this user
    const userReferralCode = generateReferralCode()
    console.log('🔥 Generated referral code:', userReferralCode)

    // First, check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, has_paid')
      .eq('id', userId)
      .single()

    if (checkError || !existingUser) {
      console.error('❌ User not found:', checkError)
      throw new Error(`User ${userId} not found in database`)
    }

    console.log('✅ User found:', existingUser)

    // Update user payment status
    console.log('🔥 Attempting to update user in database...')
    const { data: updateResult, error: userError } = await supabase
      .from('users')
      .update({ 
        has_paid: true,
        referral_code: userReferralCode,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (userError) {
      console.error('❌ Error updating user payment status:', userError)
      throw new Error(`Failed to update user: ${userError.message}`)
    } else {
      console.log('✅ Successfully updated user payment status')
      console.log('✅ Update result:', updateResult)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim()) {
      console.log('🔥 Processing referral commission for code:', referralCode)
      await processReferralCommission(referralCode, userId, paymentIntent.amount / 100)
    }

    console.log('✅ Payment processed successfully for user:', userId)

  } catch (error) {
    console.error('❌ Error handling payment success:', error)
    throw error // Re-throw so the main handler can respond with error
  }
}

async function processReferralCommission(referralCode, purchaserUserId, amount) {
  try {
    console.log('🔥 Processing referral commission for code:', referralCode)

    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, referral_code, has_paid')
      .eq('referral_code', referralCode)
      .eq('has_paid', true)
      .single()

    if (referrerError || !referrer) {
      console.error('❌ Valid referrer not found for code:', referralCode)
      return
    }

    const commission = 5.00
    console.log(`🔥 Found referrer ${referrer.id}, awarding £${commission} commission`)

    // Try to create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_user_id: purchaserUserId,
        commission_earned: commission,
        purchase_amount: amount,
        created_at: new Date().toISOString()
      })

    if (referralError) {
      console.error('❌ Error creating referral record:', referralError)
    } else {
      console.log(`✅ Referral commission of £${commission} processed for user ${referrer.id}`)
    }

  } catch (error) {
    console.error('❌ Error processing referral commission:', error)
  }
}