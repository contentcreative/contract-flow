// Email notification API for ContractFlow
// Uses Supabase Edge Functions or external email service

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, recipient_email, recipient_name, contract_title, signature_url, sender_email } = req.body

  if (!type || !recipient_email) {
    return res.status(400).json({ error: 'type and recipient_email are required' })
  }

  // Email templates
  const templates: Record<string, any> = {
    signature_request: {
      subject: `Please sign: ${contract_title || 'Contract'}`,
      body: `
Hi ${recipient_name || 'there'},

You have been requested to sign a contract: ${contract_title || 'Contract'}

Please click the link below to review and sign:
${signature_url || 'https://contract-flow-six.vercel.app'}

Best regards,
${sender_email || 'ContractFlow'}
      `.trim()
    },
    contract_signed: {
      subject: `Contract signed: ${contract_title || 'Contract'}`,
      body: `
Hi ${recipient_name || 'there'},

Great news! The contract has been signed successfully.

Contract: ${contract_title || 'Contract'}
Date: ${new Date().toLocaleDateString()}

You can view the signed contract in your ContractFlow dashboard.

Best regards,
ContractFlow
      `.trim()
    },
    welcome: {
      subject: 'Welcome to ContractFlow!',
      body: `
Hi ${recipient_name || 'there'},

Welcome to ContractFlow - AI contracts for freelancers!

Your account has been created successfully. You can now:
• Create professional contracts
• Request signatures from clients
• Manage your client database
• Accept payments in multiple currencies

Get started: https://contract-flow-six.vercel.app/dashboard

Best regards,
ContractFlow
      `.trim()
    },
    subscription_upgraded: {
      subject: 'Welcome to ContractFlow Pro!',
      body: `
Hi ${recipient_name || 'there'},

Congratulations! Your subscription has been upgraded to Pro.

You now have access to:
• Unlimited contracts
• All contract types
• E-signature workflow
• Priority support

Thank you for choosing ContractFlow!

Best regards,
ContractFlow
      `.trim()
    }
  }

  const template = templates[type]
  if (!template) {
    return res.status(400).json({ error: 'Invalid email type' })
  }

  // In production, use SendGrid, Resend, or AWS SES
  // For now, log the email (in production, actually send it)
  console.log('Email notification:')
  console.log('To:', recipient_email)
  console.log('Subject:', template.subject)
  console.log('Body:', template.body)

  // Simulate API call to email service
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {...})

  return res.status(200).json({ 
    success: true, 
    message: `Email ${type} queued for delivery`,
    details: {
      to: recipient_email,
      subject: template.subject
    }
  })
}