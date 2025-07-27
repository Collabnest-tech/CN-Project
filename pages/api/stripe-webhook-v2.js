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
    console.log('🔥 Receipt email:', paymentIntent.receipt_email)
    
    const { userId, referralCode, customerEmail } = paymentIntent.metadata
    const receiptEmail = paymentIntent.receipt_email

    console.log('🔥 Looking for user with:')
    console.log('🔥 - Auth userId (from metadata):', userId)
    console.log('🔥 - Customer email (from metadata):', customerEmail) 
    console.log('🔥 - Receipt email:', receiptEmail)

    // Method 1: Find user in YOUR custom users table by the auth user ID
    let user = null
    let lookupMethod = ''

    if (userId) {
      console.log('🔥 Looking up user in public.users table by auth user id:', userId)
      const { data: userByAuthId, error: authError } = await supabase
        .from('users') // This is your custom table
        .select('*')
        .eq('id', userId) // This should reference the auth.users.id
        .single()

      if (!authError && userByAuthId) {
        user = userByAuthId
        lookupMethod = 'auth_user_id'
        console.log('✅ Found user in public.users by auth ID:', user)
      } else {
        console.log('❌ User not found in public.users by auth ID:', authError)
      }
    }

    // Method 2: If not found by auth ID, try by email
    if (!user && customerEmail) {
      console.log('🔥 Looking up user in public.users table by email:', customerEmail)
      const { data: userByEmail, error: emailError } = await supabase
        .from('users') // Your custom table
        .select('*')
        .eq('email', customerEmail)
        .single()

      if (!emailError && userByEmail) {
        user = userByEmail
        lookupMethod = 'customer_email'
        console.log('✅ Found user in public.users by email:', user)
      } else {
        console.log('❌ User not found in public.users by email:', emailError)
      }
    }

    // Method 3: Try by receipt email
    if (!user && receiptEmail) {
      console.log('🔥 Looking up user in public.users table by receipt email:', receiptEmail)
      const { data: userByReceipt, error: receiptError } = await supabase
        .from('users') // Your custom table
        .select('*')
        .eq('email', receiptEmail)
        .single()

      if (!receiptError && userByReceipt) {
        user = userByReceipt
        lookupMethod = 'receipt_email'
        console.log('✅ Found user in public.users by receipt email:', user)
      } else {
        console.log('❌ User not found in public.users by receipt email:', receiptError)
      }
    }

    // If still not found, list users for debugging
    if (!user) {
      console.error('❌ User not found in public.users table by any method')
      
      // Debug: List users in your custom table
      const { data: allUsers, error: listError } = await supabase
        .from('users') // Your custom table
        .select('id, email, has_paid')
        .limit(5)

      if (!listError) {
        console.log('📋 Sample users in public.users table:', allUsers)
      }

      // Debug: Check auth.users table
      const { data: authUsers, error: authListError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(5)

      if (!authListError) {
        console.log('📋 Sample users in auth.users table:', authUsers)
      }
      
      throw new Error('User not found in public.users table')
    }

    console.log(`✅ User found in public.users table via ${lookupMethod}:`, user)

    // Generate referral code for this user
    const userReferralCode = generateReferralCode()
    console.log('🔥 Generated referral code:', userReferralCode)

    // Update user payment status in YOUR custom users table
    console.log('🔥 Attempting to update user in public.users table...')
    const { data: updateResult, error: userError } = await supabase
      .from('users') // Your custom table, not auth.users
      .update({ 
        has_paid: true,
        referral_code: userReferralCode,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id) // Use the ID from your custom table
      .select()

    if (userError) {
      console.error('❌ Error updating user payment status:', userError)
      console.error('❌ Full error details:', JSON.stringify(userError, null, 2))
      throw new Error(`Failed to update user: ${userError.message}`)
    } else {
      console.log('✅ Successfully updated user payment status in public.users')
      console.log('✅ Update result:', updateResult)
    }

    // Verify the update worked
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users') // Your custom table
      .select('id, email, has_paid, referral_code')
      .eq('id', user.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError)
    } else {
      console.log('✅ User after update in public.users:', verifyUser)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim()) {
      console.log('🔥 Processing referral commission for code:', referralCode)
      await processReferralCommission(referralCode, user.id, paymentIntent.amount / 100)
    }

    console.log('✅ Payment processed successfully for user:', user.id)

  } catch (error) {
    console.error('❌ Error handling payment success:', error)
    console.error('❌ Error stack:', error.stack)
    throw error
  }
}

async function processReferralCommission(referralCode, purchaserUserId, amount) {
  try {
    console.log('🔥 Processing referral commission for code:', referralCode)

    // Look for referrer in YOUR custom users table
    const { data: referrer, error: referrerError } = await supabase
      .from('users') // Your custom table
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

    // Try to create referral record (skip if table doesn't exist)
    try {
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
    } catch (refError) {
      console.log('ℹ️ Referrals table might not exist, skipping referral commission')
    }

  } catch (error) {
    console.error('❌ Error processing referral commission:', error)
  }
}