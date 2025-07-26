import { supabase } from '../../lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const customerEmail = session.customer_details.email

    try {
      // Update user's payment status
      const { error } = await supabase
        .from('users')
        .update({ has_paid: true })
        .eq('email', customerEmail)

      if (error) {
        console.error('Error updating user payment status:', error)
        return res.status(500).json({ error: 'Database update failed' })
      }

      console.log('User payment status updated successfully')
    } catch (error) {
      console.error('Error processing webhook:', error)
      return res.status(500).json({ error: 'Webhook processing failed' })
    }
  }

  res.status(200).json({ received: true })
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}