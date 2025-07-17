// pages/api/stripe-webhook.js
import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)
  let event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return res.status(400).end()
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    let userId = session.metadata?.userId

    // 1) Upsert user has_paid
    await supabase
      .from('users')
      .upsert({ id: userId, has_paid: true }, { onConflict: 'id' })

    // 2) Mark referral paid
    await supabase
      .from('referrals')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('referred_id', userId)
      .eq('status', 'unpaid')
  }

  res.json({ received: true })
}
