// Email notification API for ContractFlow
// Uses Resend for transactional emails

import { sendSignatureRequest, sendContractSignedConfirmation, sendWelcomeEmail, sendSubscriptionUpgradedEmail } from '@/lib/email'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, recipient_email, recipient_name, contract_title, signature_url, sender_email } = req.body

  if (!type || !recipient_email) {
    return res.status(400).json({ error: 'type and recipient_email are required' })
  }

  let result

  switch (type) {
    case 'signature_request':
      result = await sendSignatureRequest({
        to: recipient_email,
        recipientName: recipient_name || 'there',
        contractTitle: contract_title || 'Contract',
        signatureUrl: signature_url || 'https://contract-flow.app/sign',
        senderEmail: sender_email,
      })
      break

    case 'contract_signed':
      result = await sendContractSignedConfirmation({
        to: recipient_email,
        recipientName: recipient_name || 'there',
        contractTitle: contract_title || 'Contract',
        signatureUrl: signature_url,
      })
      break

    case 'welcome':
      result = await sendWelcomeEmail({
        to: recipient_email,
        recipientName: recipient_name || 'there',
      })
      break

    case 'subscription_upgraded':
      result = await sendSubscriptionUpgradedEmail({
        to: recipient_email,
        recipientName: recipient_name || 'there',
      })
      break

    default:
      return res.status(400).json({ error: 'Invalid email type' })
  }

  if (!result.success) {
    console.error('Email error:', result.error)
    return res.status(500).json({ error: result.error || 'Failed to send email' })
  }

  return res.status(200).json({
    success: true,
    message: `Email ${type} sent`,
    details: {
      to: recipient_email,
      type,
    }
  })
}