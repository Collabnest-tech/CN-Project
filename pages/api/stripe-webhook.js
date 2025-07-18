// pages/api/stripe-webhook.js
import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)
  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    console.log('✅ checkout.session.completed for session', session.id)

    // Prefer metadata.userId, else resolve guest by email
    let userId = session.metadata?.userId
    if (!userId) {
      const email = session.customer_details.email
      console.log('🔍 No metadata.userId; resolving guest by email', email)
      const { data, error } = await supabase
        .from('users')
        .upsert({ email, has_paid: true }, { onConflict: 'email', returning: 'representation' })
        .select('id')
        .single()
      if (error) {
        console.error('❌ Supabase upsert guest user error:', error)
        return res.status(500).end()
      }
      userId = data.id
      console.log('✅ Created/found guest user with id', userId)
    } else {
      // Logged‑in user: mark has_paid
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, has_paid: true }, { onConflict: 'id' })
      if (error) console.error('❌ Supabase upsert paid user error:', error)
      else console.log('✅ Marked user', userId, 'as paid')
    }

    // Update referral status
    const { error: refErr } = await supabase
      .from('referrals')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('referred_id', userId)
      .eq('status', 'unpaid')
    if (refErr) console.error('❌ Error updating referral:', refErr)
    else console.log('✅ Updated referral to paid for', userId)
  }

  res.json({ received: true })
}
