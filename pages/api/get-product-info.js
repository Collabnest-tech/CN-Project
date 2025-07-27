import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the product by looking up your specific product
    // You'll need to create a product in Stripe dashboard first
    const products = await stripe.products.list({
      limit: 10,
      active: true
    })

    // Find your AI course product (you can also use a specific product ID)
    const courseProduct = products.data.find(
      product => product.name.includes('AI for Making Money Online') || 
                 product.metadata.course_type === 'ai_course'
    )

    if (!courseProduct) {
      return res.status(404).json({ error: 'Course product not found' })
    }

    // Get the prices for this product
    const prices = await stripe.prices.list({
      product: courseProduct.id,
      active: true
    })

    if (prices.data.length === 0) {
      return res.status(404).json({ error: 'No prices found for this product' })
    }

    // Get the default price (you can have multiple prices for different currencies)
    const defaultPrice = prices.data.find(price => price.currency === 'usd') || prices.data[0]

    const productInfo = {
      id: courseProduct.id,
      name: courseProduct.name,
      description: courseProduct.description,
      price: {
        id: defaultPrice.id,
        amount: defaultPrice.unit_amount / 100, // Convert from cents
        currency: defaultPrice.currency.toUpperCase(),
        formatted: `$${(defaultPrice.unit_amount / 100).toFixed(2)}`
      },
      metadata: courseProduct.metadata
    }

    res.status(200).json(productInfo)

  } catch (error) {
    console.error('Error fetching product info:', error)
    res.status(500).json({ 
      error: 'Failed to fetch product information',
      details: error.message 
    })
  }
}