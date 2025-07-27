import Stripe from 'stripe'
import { supabase } from '../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
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

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
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

    // Update user payment status
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        has_paid: true,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating user payment status:', userError)
    } else {
      console.log('Successfully updated user payment status for:', userId)
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
    } else {
      console.log('Successfully updated transaction status for:', paymentIntent.id)
    }

    // Handle referral commission if referral code exists
    if (referralCode && referralCode.trim()) {
      await processReferralCommission(referralCode, userId, paymentIntent.amount / 100)
    }

    console.log('Payment processed successfully for user:', userId)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    console.log('Processing payment failure for:', paymentIntent.id)

    // Update transaction status
    const { error } = await supabase
      .from('transactions')
      .update({ 
        status: 'failed',
        failed_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed transaction:', error)
    } else {
      console.log('Successfully updated failed transaction:', paymentIntent.id)
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function processReferralCommission(referralCode, purchaserUserId, amount) {
  try {
    console.log('Processing referral commission for code:', referralCode)

    // Find the referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (referrerError || !referrer) {
      console.error('Referrer not found for code:', referralCode)
      return
    }

    // Calculate commission ($5 flat rate)
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
      console.log(`Referral commission of $${commission} processed for user ${referrer.id}`)
    }

  } catch (error) {
    console.error('Error processing referral commission:', error)
  }
}