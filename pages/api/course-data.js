import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    console.log('🔥 Fetching course data for price ID:', priceId)

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    })

    if (!price) {
      return res.status(404).json({ error: 'Price not found' })
    }

    // Get course details from your database (if you have a courses table)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('price_id', priceId)
      .single()

    // If no course found in database, create a default course object
    let courseData
    if (courseError || !course) {
      console.log('⚠️ Course not found in database, using Stripe product data')
      courseData = {
        id: price.product.id,
        title: price.product.name,
        description: price.product.description || 'Complete course access',
        price_id: priceId
      }
    } else {
      courseData = course
    }

    console.log('✅ Course data fetched successfully')

    res.status(200).json({
      course: courseData,
      price: {
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        product: price.product
      }
    })

  } catch (error) {
    console.error('❌ Error fetching course data:', error)
    res.status(500).json({ 
      error: 'Failed to fetch course data',
      message: error.message 
    })
  }
}