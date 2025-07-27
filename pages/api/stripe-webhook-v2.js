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

  // ONLY handle payment_intent.succeeded for custom Stripe Elements
  if (event.type === 'payment_intent.succeeded') {
    console.log(`🔥 Processing payment_intent.succeeded`)
    try {
      await handlePaymentIntentSucceeded(event.data.object, event.id)
      console.log('✅ Payment intent processed successfully')
      return res.status(200).json({ 
        received: true, 
        processed: true,
        event_type: event.type,
        event_id: event.id
      })
    } catch (error) {
      console.error('❌ Error processing payment intent:', error)
      return res.status(500).json({ 
        error: 'Failed to process payment intent',
        message: error.message 
      })
    }
  } 
  // Comment out checkout.session.completed since you're using custom elements
  /*
  else if (event.type === 'checkout.session.completed') {
    // Not needed for custom Stripe Elements
  }
  */
  else {
    console.log(`ℹ️ Ignoring event type: ${event.type}`)
    return res.status(200).json({ 
      received: true, 
      processed: false,
      event_type: event.type,
      message: 'Event type not handled - only payment_intent.succeeded is processed for custom checkout'
    })
  }
}

async function handleCheckoutSessionCompleted(sessionObject, eventId) {
  try {
    console.log('🔥 Processing checkout session:', sessionObject.id)
    console.log('🔥 Session object:', JSON.stringify(sessionObject, null, 2))
    
    // Extract data from checkout session
    const userId = sessionObject.metadata?.userId
    const customerEmail = sessionObject.customer_details?.email || sessionObject.metadata?.customerEmail
    const referralCode = sessionObject.metadata?.referralCode
    const paymentIntentId = sessionObject.payment_intent
    const amount = sessionObject.amount_total

    console.log('🔥 Extracted data from checkout session:')
    console.log('🔥 - User ID:', userId)
    console.log('🔥 - Customer email:', customerEmail)
    console.log('🔥 - Referral code:', referralCode)
    console.log('🔥 - Payment Intent ID:', paymentIntentId)
    console.log('🔥 - Amount:', amount)

    if (!userId && !customerEmail) {
      console.error('❌ No user identifier found in checkout session')
      console.error('Session metadata:', sessionObject.metadata)
      console.error('Customer details:', sessionObject.customer_details)
      throw new Error('No user identifier found in checkout session data')
    }

    // Find or create user
    let user = await findOrCreateUser(userId, customerEmail)
    
    if (!user) {
      throw new Error('Failed to find or create user')
    }

    console.log(`✅ Working with user:`, user.id, user.email)

    // Check if already processed to prevent duplicates
    if (user.has_paid) {
      console.log('ℹ️ User already marked as paid')
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

    // Create/update transaction record
    if (paymentIntentId) {
      await createTransactionRecord(paymentIntentId, user.id, amount, sessionObject)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim()) {
      console.log('🔥 Processing referral commission for code:', referralCode)
      await processReferralCommission(referralCode, user.id, amount || 0)
    }

    console.log('✅ Checkout session processed successfully for user:', user.id)

  } catch (error) {
    console.error('❌ Error handling checkout session:', error)
    console.error('❌ Error stack:', error.stack)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent, eventId) {
  try {
    console.log('🔥🔥🔥 PROCESSING PAYMENT INTENT SUCCEEDED 🔥🔥🔥')
    console.log('🔥 Event ID:', eventId)
    console.log('🔥 Payment Intent ID:', paymentIntent.id)
    console.log('🔥 Payment Status:', paymentIntent.status)
    console.log('🔥 Amount:', paymentIntent.amount)
    
    // Extract data from payment intent metadata
    const customerEmail = paymentIntent.metadata?.customerEmail
    const customerName = paymentIntent.metadata?.customerName
    const referralCode = paymentIntent.metadata?.referralCode
    const priceId = paymentIntent.metadata?.priceId
    const amount = paymentIntent.amount

    console.log('🔥 EXTRACTED DATA:')
    console.log('🔥 - Customer email:', customerEmail)
    console.log('🔥 - Customer name:', customerName)
    console.log('🔥 - Referral code:', referralCode)
    console.log('🔥 - Price ID:', priceId)
    console.log('🔥 - Amount:', amount)

    if (!customerEmail) {
      console.error('❌❌❌ NO CUSTOMER EMAIL FOUND ❌❌❌')
      throw new Error('No customer email found in payment intent metadata')
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      throw new Error(`User not found for email: ${customerEmail}`)
    }

    console.log('🔥 Found user:', user.email)

    // Update user's payment status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        has_paid: true,
        payment_date: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent.id,
        amount_paid: amount / 100, // Convert from cents
        currency: paymentIntent.currency
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    console.log('✅ Successfully updated user payment status')

    // Handle referral if provided
    if (referralCode && referralCode.trim()) {
      await handleReferralReward(referralCode, user.id, amount)
    }

    return { success: true }

  } catch (error) {
    console.error('❌ Error processing payment intent:', error)
    throw error
  }
}

async function findOrCreateUser(userId, customerEmail) {
  let user = null

  // Method 1: Find by auth user ID (most reliable)
  if (userId) {
    console.log('🔥 Looking up user by auth ID:', userId)
    const { data: userByAuthId, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!authError && userByAuthId) {
      user = userByAuthId
      console.log('✅ Found user by auth ID')
      return user
    } else {
      console.log('❌ User not found by auth ID:', authError?.message)
    }
  }

  // Method 2: Find by email (fallback)
  if (!user && customerEmail) {
    console.log('🔥 Looking up user by email:', customerEmail)
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail.toLowerCase())
      .single()

    if (!emailError && userByEmail) {
      user = userByEmail
      console.log('✅ Found user by email')
      return user
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
        email: customerEmail.toLowerCase(),
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
    console.log('✅ Created new user:', user.id)
  }

  return user
}

async function createTransactionRecord(paymentIntentId, userId, amount, sessionObject) {
  try {
    console.log('🔥 Creating transaction record')
    
    const { data, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntentId,
        amount: amount,
        currency: sessionObject.currency || 'gbp',
        status: 'completed',
        customer_info: {
          email: sessionObject.customer_details?.email,
          name: sessionObject.customer_details?.name,
          session_id: sessionObject.id
        },
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()

    if