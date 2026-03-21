// API: Detect user location from headers
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get country from Vercel/Edge headers
  const country = req.headers['x-vercel-ip-country'] || 
                  req.headers['cf-ipcountry'] || // Cloudflare
                  ''

  res.status(200).json({
    country: country.toUpperCase(),
    currency: country ? undefined : 'GBP' // Default if no country
  })
}