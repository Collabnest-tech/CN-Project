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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  console.log('Webhook event received:', event.type)

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.status(200).json({ received: true })
}

async function handlePaymentSuccess(paymentIntent) {
  try {
    const { userId, referralCode } = paymentIntent.metadata

    console.log('Processing payment success for user:', userId)

    // Generate referral code for this user (now that they've paid)
    const userReferralCode = generateReferralCode()

    // Update user payment status and generate their referral code
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        has_paid: true,
        referral_code: userReferralCode,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating user payment status:', userError)
    } else {
      console.log('Successfully updated user payment status and generated referral code:', userReferralCode)
    }

    // Update transaction status
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (transactionError) {
      console.error('Error updating transaction:', transactionError)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim()) {
      await processReferralCommission(referralCode, userId, paymentIntent.amount / 100)
    }

    console.log('Payment processed successfully for user:', userId)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    // Handle checkout session completion (if using checkout sessions)
    const { userId, referralCode } = session.metadata || {}
    
    if (userId) {
      await handlePaymentSuccess({
        metadata: { userId, referralCode },
        amount: session.amount_total,
        id: session.payment_intent
      })
    }
  } catch (error) {
    console.error('Error handling checkout session completion:', error)
  }
}

async function processReferralCommission(referralCode, purchaserUserId, amount) {
  try {
    console.log('Processing referral commission for code:', referralCode)

    // Find the referrer (must have has_paid = true to have a valid referral code)
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, referral_code, has_paid')
      .eq('referral_code', referralCode)
      .eq('has_paid', true)
      .single()

    if (referrerError || !referrer) {
      console.error('Valid referrer not found for code:', referralCode)
      return
    }

    // Calculate commission (£5 flat rate)
    const commission = 5.00

    // Create referral record
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
      console.error('Error creating referral record:', referralError)
    } else {
      console.log(`Referral commission of £${commission} processed for user ${referrer.id}`)
    }

  } catch (error) {
    console.error('Error processing referral commission:', error)
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    console.log('Processing payment failure for:', paymentIntent.id)

    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'failed',
        failed_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed transaction:', error)
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}