export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, user_email, price_id } = req.body

  if (!price_id) {
    return res.status(400).json({ error: 'Price ID is required' })
  }

  const origin = req.headers.origin || 'https://contract-flow-six.vercel.app'

  try {
    // Call Stripe API directly using fetch
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price]': price_id,
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': `${origin}/dashboard?success=true`,
        'cancel_url': `${origin}/dashboard?canceled=true`,
        'customer_email': user_email,
        'metadata[user_id]': user_id
      })
    })

    const session = await response.json()

    if (!response.ok) {
      console.error('Stripe API error:', session)
      return res.status(400).json({ error: session.error?.message || 'Stripe API error' })
    }

    return res.status(200).json({ success: true, url: session.url, session_id: session.id })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({ error: error.message })
  }
}