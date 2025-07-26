import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { price, currency, country, referral, userId, paymentMethod } = req.body

  try {
    // Store payment intent in database
    const { data, error } = await supabase
      .from('payment_intents')
      .insert({
        user_id: userId,
        amount: price,
        currency: currency,
        country: country,
        payment_method: paymentMethod,
        referral_code: referral,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Generate payment instructions based on country and method
    let paymentUrl = `/payment-instructions?id=${data.id}`

    res.status(200).json({ paymentUrl })
  } catch (error) {
    console.error('Payment creation error:', error)
    res.status(500).json({ error: 'Failed to create payment' })
  }
}