import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    })

    res.status(200).json({
      price: {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        product: {
          id: price.product.id,
          name: price.product.name,
          description: price.product.description
        }
      }
    })

  } catch (error) {
    console.error('Error fetching price details:', error)
    res.status(500).json({ 
      error: 'Failed to fetch price details',
      message: error.message 
    })
  }
}