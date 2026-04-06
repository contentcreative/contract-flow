// API Endpoint: /api/generate
// Generates contracts using AI

import type { NextApiRequest, NextApiResponse } from 'next'
import { generateContract, quickGenerate } from '@/lib/ai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contractType, formData, streaming = true } = req.body

    if (!contractType || !formData) {
      return res.status(400).json({ error: 'Missing contractType or formData' })
    }

    // Check authentication
    // Note: Supabase auth headers would be checked here in production

    let result

    if (streaming) {
      // Set up streaming response
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const encoder = new TextEncoder()
      
      await generateContract(contractType, formData, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
      })

      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
      
      return
    } else {
      // Non-streaming response
      result = await quickGenerate(contractType, formData)
      
      return res.status(200).json({
        success: true,
        contract: result
      })
    }
  } catch (error: any) {
    console.error('Contract generation error:', error)
    return res.status(500).json({ error: error.message || 'Failed to generate contract' })
  }
}