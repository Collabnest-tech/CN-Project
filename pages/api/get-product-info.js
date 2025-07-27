import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Use the specific price ID from environment variables
    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured in environment variables' })
    }

    // Fetch the specific price directly
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'] // This expands the product data within the price object
    })

    if (!price.active) {
      return res.status(404).json({ error: 'Price is not active' })
    }

    // Handle GBP currency formatting
    const currencySymbol = price.currency === 'gbp' ? '£' : '$'
    const currencyCode = price.currency.toUpperCase()

    // Construct the response with complete product and price information
    const productInfo = {
      id: price.product.id,
      name: price.product.name,
      description: price.product.description,
      price: {
        id: price.id,
        amount: price.unit_amount / 100, // Convert from pence/cents to pounds/dollars
        currency: currencyCode,
        formatted: `${currencySymbol}${(price.unit_amount / 100).toFixed(2)}`,
        unit_amount: price.unit_amount, // Keep the pence/cent value for calculations
        currency_symbol: currencySymbol
      },
      metadata: price.product.metadata || {}
    }

    console.log('Product info fetched successfully:', productInfo)
    res.status(200).json(productInfo)

  } catch (error) {
    console.error('Error fetching product info:', error)
    res.status(500).json({ 
      error: 'Failed to fetch product information',
      details: error.message 
    })
  }
}