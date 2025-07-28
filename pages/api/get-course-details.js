import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId } = req.body

    console.log('📥 Fetching course details for priceId:', priceId)

    if (!priceId) {
      console.error('❌ Missing priceId')
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    })

    console.log('✅ Retrieved price details:', {
      id: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      product: price.product?.name
    })

    // Return the price details in the format your checkout expects
    res.status(200).json({
      id: price.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      product: {
        name: price.product?.name || 'AI Marketing Mastery Course',
        description: price.product?.description || 'Complete AI marketing course'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching course details:', error)
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid price ID' })
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to fetch course details' 
    })
  }
}