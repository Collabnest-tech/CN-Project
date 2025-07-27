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
    console.log('🔥 Event constructed successfully:', event.type, 'ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      message: err.message 
    })
  }

  // Handle multiple payment success events for maximum reliability
  const paymentSuccessEvents = [
    'payment_intent.succeeded',
    'checkout.session.completed',
    'invoice.payment_succeeded'
  ]

  if (paymentSuccessEvents.includes(event.type)) {
    console.log(`🔥 Processing ${event.type}`)
    try {
      await handlePaymentSuccess(event.data.object, event.type)
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

async function handlePaymentSuccess(eventObject, eventType) {
  try {
    console.log(`🔥 handlePaymentSuccess called for ${eventType}`)
    
    let userId, customerEmail, referralCode, paymentIntentId
    
    // Extract data based on event type
    if (eventType === 'checkout.session.completed') {
      console.log('🔥 Processing checkout session:', eventObject.id)
      userId = eventObject.metadata?.userId
      customerEmail = eventObject.customer_details?.email || eventObject.metadata?.customerEmail
      referralCode = eventObject.metadata?.referralCode
      paymentIntentId = eventObject.payment_intent
    } else if (eventType === 'payment_intent.succeeded') {
      console.log('🔥 Processing payment intent:', eventObject.id)
      userId = eventObject.metadata?.userId
      customerEmail = eventObject.metadata?.customerEmail || eventObject.receipt_email
      referralCode = eventObject.metadata?.referralCode
      paymentIntentId = eventObject.id
    } else if (eventType === 'invoice.payment_succeeded') {
      console.log('🔥 Processing invoice payment:', eventObject.id)
      userId = eventObject.metadata?.userId
      customerEmail = eventObject.customer_email
      referralCode = eventObject.metadata?.referralCode
      paymentIntentId = eventObject.payment_intent
    }

    console.log('🔥 Extracted data:')
    console.log('🔥 - Auth userId:', userId)
    console.log('🔥 - Customer email:', customerEmail)
    console.log('🔥 - Referral code:', referralCode)
    console.log('🔥 - Payment Intent ID:', paymentIntentId)

    if (!userId && !customerEmail) {
      throw new Error('No user identifier found in event data')
    }

    // Find or create user
    let user = await findOrCreateUser(userId, customerEmail)
    
    if (!user) {
      throw new Error('Failed to find or create user')
    }

    console.log(`✅ Working with user:`, user.id, user.email)

    // Check if already processed (prevent duplicate processing)
    if (user.has_paid) {
      console.log('ℹ️ User already marked as paid, skipping update')
      return
    }

    // Generate referral code if user doesn't have one
    const userReferralCode = user.referral_code || generateReferralCode()
    
    // Update user payment status
    console.log('🔥 Updating user payment status...')
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ 
        has_paid: true,
        referral_code: userReferralCode,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()

    if (updateError) {
      console.error('❌ Error updating user payment status:', updateError)
      throw new Error(`Failed to update user: ${updateError.message}`)
    }

    console.log('✅ Successfully updated user payment status')
    console.log('✅ Update result:', updateResult)

    // Update transaction record if exists
    if (paymentIntentId) {
      await updateTransactionRecord(paymentIntentId, user.id)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim()) {
      console.log('🔥 Processing referral commission for code:', referralCode)
      await processReferralCommission(referralCode, user.id, eventObject.amount_total || eventObject.amount || 0)
    }

    console.log('✅ Payment processed successfully for user:', user.id)

  } catch (error) {
    console.error('❌ Error handling payment success:', error)
    console.error('❌ Error stack:', error.stack)
    throw error
  }
}

async function findOrCreateUser(userId, customerEmail) {
  let user = null
  let lookupMethod = ''

  // Method 1: Find by auth user ID
  if (userId) {
    console.log('🔥 Looking up user by auth ID:', userId)
    const { data: userByAuthId, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!authError && userByAuthId) {
      user = userByAuthId
      lookupMethod = 'auth_user_id'
      console.log('✅ Found user by auth ID')
    } else {
      console.log('❌ User not found by auth ID:', authError?.message)
    }
  }

  // Method 2: Find by email
  if (!user && customerEmail) {
    console.log('🔥 Looking up user by email:', customerEmail)
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (!emailError && userByEmail) {
      user = userByEmail
      lookupMethod = 'email'
      console.log('✅ Found user by email')
    } else {
      console.log('❌ User not found by email:', emailError?.message)
    }
  }

  // Method 3: Create user if not found
  if (!user) {
    console.log('🔥 User not found, creating new user...')
    
    if (!customerEmail) {
      throw new Error('Cannot create user without email')
    }

    // Use provided userId or generate one if not available
    const newUserId = userId || crypto.randomUUID()
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: customerEmail,
        has_paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating user:', createError)
      throw new Error(`Failed to create user: ${createError.message}`)
    }

    user = newUser
    lookupMethod = 'created'
    console.log('✅ Created new user:', user.id)
  }

  console.log(`✅ User resolved via ${lookupMethod}:`, user.id, user.email)
  return user
}

async function updateTransactionRecord(paymentIntentId, userId) {
  try {
    console.log('🔥 Updating transaction record for payment intent:', paymentIntentId)
    
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('user_id', userId)

    if (transactionError) {
      console.error('❌ Error updating transaction:', transactionError)
    } else {
      console.log('✅ Transaction record updated')
    }
  } catch (error) {
    console.error('❌ Error in updateTransactionRecord:', error)
  }
}

async function processReferralCommission(referralCode, purchaserUserId, amount) {
  try {
    console.log('🔥 Processing referral commission for code:', referralCode)

    // Find referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, referral_code, has_paid')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .eq('has_paid', true)
      .single()

    if (referrerError || !referrer) {
      console.error('❌ Valid referrer not found for code:', referralCode)
      return
    }

    const commission = 5.00
    console.log(`🔥 Found referrer ${referrer.id}, awarding commission: £${commission}`)

    // Create referral record
    try {
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: purchaserUserId,
          status: 'completed',
          created_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          referred_email: null // Will be populated if needed
        })

      if (referralError) {
        console.error('❌ Error creating referral record:', referralError)
      } else {
        console.log(`✅ Referral commission of £${commission} processed`)
      }
    } catch (refError) {
      console.log('ℹ️ Referrals table might not exist, skipping referral commission')
    }

  } catch (error) {
    console.error('❌ Error processing referral commission:', error)
  }
}