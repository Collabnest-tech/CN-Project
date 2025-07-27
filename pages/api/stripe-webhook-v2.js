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

  // Prioritize checkout.session.completed as the primary event
  const paymentSuccessEvents = [
    'checkout.session.completed',  // Primary - most reliable
    'payment_intent.succeeded',    // Fallback
    'invoice.payment_succeeded'    // Subscription fallback
  ]

  if (paymentSuccessEvents.includes(event.type)) {
    console.log(`🔥 Processing ${event.type}`)
    try {
      await handlePaymentSuccess(event.data.object, event.type, event.id)
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

async function handlePaymentSuccess(eventObject, eventType, eventId) {
  try {
    console.log(`🔥 handlePaymentSuccess called for ${eventType}`)
    console.log('🔥 Full event object:', JSON.stringify(eventObject, null, 2))
    
    let userId, customerEmail, referralCode, paymentIntentId, amount
    
    // PRIORITIZE checkout.session.completed
    if (eventType === 'checkout.session.completed') {
      console.log('🔥 Processing checkout session (PRIMARY):', eventObject.id)
      
      // Enhanced data extraction for checkout session
      userId = eventObject.metadata?.userId || eventObject.metadata?.user_id
      customerEmail = eventObject.customer_details?.email || 
                      eventObject.customer_email || 
                      eventObject.metadata?.customerEmail ||
                      eventObject.metadata?.customer_email
      referralCode = eventObject.metadata?.referralCode || eventObject.metadata?.referral_code
      paymentIntentId = eventObject.payment_intent
      amount = eventObject.amount_total
      
      // If we have payment_intent, fetch additional details
      if (paymentIntentId && !userId) {
        try {
          console.log('🔥 Fetching payment intent details for additional metadata')
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          userId = userId || paymentIntent.metadata?.userId || paymentIntent.metadata?.user_id
          customerEmail = customerEmail || paymentIntent.metadata?.customerEmail || paymentIntent.receipt_email
          referralCode = referralCode || paymentIntent.metadata?.referralCode
        } catch (piError) {
          console.log('⚠️ Could not fetch payment intent details:', piError.message)
        }
      }
      
    } else if (eventType === 'payment_intent.succeeded') {
      console.log('🔥 Processing payment intent (FALLBACK):', eventObject.id)
      userId = eventObject.metadata?.userId || eventObject.metadata?.user_id
      customerEmail = eventObject.metadata?.customerEmail || 
                      eventObject.metadata?.customer_email || 
                      eventObject.receipt_email
      referralCode = eventObject.metadata?.referralCode || eventObject.metadata?.referral_code
      paymentIntentId = eventObject.id
      amount = eventObject.amount
      
    } else if (eventType === 'invoice.payment_succeeded') {
      console.log('🔥 Processing invoice payment (SUBSCRIPTION):', eventObject.id)
      userId = eventObject.metadata?.userId || eventObject.metadata?.user_id
      customerEmail = eventObject.customer_email
      referralCode = eventObject.metadata?.referralCode || eventObject.metadata?.referral_code
      paymentIntentId = eventObject.payment_intent
      amount = eventObject.amount_paid
    }

    console.log('🔥 Extracted data:')
    console.log('🔥 - Auth userId:', userId)
    console.log('🔥 - Customer email:', customerEmail)
    console.log('🔥 - Referral code:', referralCode)
    console.log('🔥 - Payment Intent ID:', paymentIntentId)
    console.log('🔥 - Amount:', amount)

    if (!userId && !customerEmail) {
      console.error('❌ No user identifier found - checking event object structure')
      console.error('Event metadata:', eventObject.metadata)
      console.error('Customer details:', eventObject.customer_details)
      throw new Error('No user identifier found in event data')
    }

    // Find or create user
    let user = await findOrCreateUser(userId, customerEmail)
    
    if (!user) {
      throw new Error('Failed to find or create user')
    }

    console.log(`✅ Working with user:`, user.id, user.email)

    // Always update to ensure consistency, but log if already paid
    if (user.has_paid) {
      console.log('ℹ️ User already marked as paid, but updating anyway for consistency')
    }

    // Generate referral code if user doesn't have one
    const userReferralCode = user.referral_code || generateReferralCode()
    
    // Update user payment status with UPSERT for reliability
    console.log('🔥 Updating user payment status...')
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .upsert({ 
        id: user.id,
        email: user.email || customerEmail,
        has_paid: true,
        referral_code: userReferralCode,
        payment_date: user.payment_date || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_at: user.created_at || new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (updateError) {
      console.error('❌ Error updating user payment status:', updateError)
      throw new Error(`Failed to update user: ${updateError.message}`)
    }

    console.log('✅ Successfully updated user payment status')
    console.log('✅ Update result:', updateResult)

    // Update transaction record if exists
    if (paymentIntentId) {
      await updateTransactionRecord(paymentIntentId, user.id, amount)
    }

    // Process referral commission if referral code was used
    if (referralCode && referralCode.trim() && !user.has_paid) {
      console.log('🔥 Processing referral commission for code:', referralCode)
      await processReferralCommission(referralCode, user.id, amount || 0)
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

  // Method 1: Find by auth user ID (most reliable)
  if (userId) {
    console.log('🔥 Looking up user by auth ID:', userId)
    try {
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
    } catch (err) {
      console.log('❌ Error looking up by auth ID:', err.message)
    }
  }

  // Method 2: Find by email (fallback)
  if (!user && customerEmail) {
    console.log('🔥 Looking up user by email:', customerEmail)
    try {
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerEmail.toLowerCase())
        .single()

      if (!emailError && userByEmail) {
        user = userByEmail
        lookupMethod = 'email'
        console.log('✅ Found user by email')
        
        // If found by email but userId provided, update the user ID
        if (userId && userId !== userByEmail.id) {
          console.log('🔥 Updating user ID from metadata')
          try {
            const { error: updateIdError } = await supabase
              .from('users')
              .update({ id: userId })
              .eq('email', customerEmail.toLowerCase())
              
            if (!updateIdError) {
              user.id = userId
              console.log('✅ Updated user ID')
            }
          } catch (updateErr) {
            console.log('⚠️ Could not update user ID:', updateErr.message)
          }
        }
      } else {
        console.log('❌ User not found by email:', emailError?.message)
      }
    } catch (err) {
      console.log('❌ Error looking up by email:', err.message)
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
    
    try {
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
        
        // Handle duplicate error - try to find the user again
        if (createError.message.includes('duplicate') || createError.code === '23505') {
          console.log('🔥 User created concurrently, attempting to find again')
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', customerEmail.toLowerCase())
            .single()
          
          if (existingUser) {
            user = existingUser
            lookupMethod = 'found_after_duplicate'
            console.log('✅ Found user after duplicate error')
          } else {
            throw createError
          }
        } else {
          throw createError
        }
      } else {
        user = newUser
        lookupMethod = 'created'
        console.log('✅ Created new user:', user.id)
      }
    } catch (createError) {
      console.error('❌ Failed to create user:', createError)
      throw new Error(`Failed to create user: ${createError.message}`)
    }
  }

  console.log(`✅ User resolved via ${lookupMethod}:`, user.id, user.email)
  return user
}

async function updateTransactionRecord(paymentIntentId, userId, amount) {
  try {
    console.log('🔥 Updating transaction record for payment intent:', paymentIntentId)
    
    const { data, error: transactionError } = await supabase
      .from('transactions')
      .upsert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntentId,
        amount: amount,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_payment_intent_id'
      })
      .select()

    if (transactionError) {
      console.error('❌ Error updating transaction:', transactionError)
    } else {
      console.log('✅ Transaction record updated:', data)
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

    // Check if referral already exists to prevent duplicates
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer.id)
      .eq('referred_id', purchaserUserId)
      .single()

    if (existingReferral) {
      console.log('ℹ️ Referral already exists, skipping commission')
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
          referred_email: null
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