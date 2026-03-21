// AI Service for Contract Generation
// Uses OpenRouter API with streaming response

import { contractPrompts, fillTemplate } from './prompts'

// Contract generation result
export interface GeneratedContract {
  text: string
  title: string
  contractType: string
  tokensUsed: number
}

// Generate contract using OpenRouter
export async function generateContract(
  contractType: string,
  formData: Record<string, string>,
  onProgress?: (chunk: string) => void
): Promise<GeneratedContract> {
  const promptConfig = contractPrompts[contractType]
  
  if (!promptConfig) {
    throw new Error(`Unknown contract type: ${contractType}`)
  }
  
  // Fill in the prompt template with form data
  const userPrompt = fillTemplate(promptConfig.user, formData)
  const systemPrompt = promptConfig.system
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://contract-flow.app',
      'X-Title': 'ContractFlow'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.7,
      stream: true
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }
  
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Failed to read response stream')
  }
  
  const decoder = new TextDecoder()
  let fullText = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
            onProgress?.(content)
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
  
  // Generate title
  const clientName = formData.client_name || formData.party_b_name || formData.party_a_name || 'Client'
  const title = `${contractType} - ${clientName} - ${new Date().toLocaleDateString('en-GB')}`
  
  return {
    text: fullText,
    title,
    contractType,
    tokensUsed: Math.ceil(fullText.length / 4)
  }
}

// Quick generate (non-streaming) for simple contracts
export async function quickGenerate(
  contractType: string,
  formData: Record<string, string>
): Promise<GeneratedContract> {
  const promptConfig = contractPrompts[contractType]
  
  if (!promptConfig) {
    throw new Error(`Unknown contract type: ${contractType}`)
  }
  
  const userPrompt = fillTemplate(promptConfig.user, formData)
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://contract-flow.app',
      'X-Title': 'ContractFlow'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: promptConfig.system },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4096,
      temperature: 0.7
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  
  const clientName = formData.client_name || formData.party_b_name || formData.party_a_name || 'Client'
  const title = `${contractType} - ${clientName} - ${new Date().toLocaleDateString('en-GB')}`
  
  return {
    text: content,
    title,
    contractType,
    tokensUsed: data.usage?.total_tokens || Math.ceil(content.length / 4)
  }
}

// Estimate cost for a contract generation
export function estimateCost(contractType: string): { tokens: number; cost: string } {
  const estimatedTokens = {
    MSA: 2500,
    SOW: 2000,
    NDA: 1000,
    Contractor: 2000,
    Consulting: 1800,
    Freelance: 1800,
    FixedPrice: 2000,
    Retainer: 1500,
    Quote: 500,
    Invoice: 400
  }
  
  const tokens = estimatedTokens[contractType as keyof typeof estimatedTokens] || 2000
  const costUSD = (tokens / 1000000) * 0.1 // Approximate cost for Claude 3 Haiku
  const costGBP = (costUSD * 0.79).toFixed(4)
  
  return {
    tokens,
    cost: `~£${costGBP}`
  }
}