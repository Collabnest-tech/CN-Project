import { supabase } from '../../lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { priceId } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/courses?success=true`,
      cancel_url: `${req.headers.origin}/courses?canceled=true`,
    })
    res.status(200).json({ sessionId: session.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}