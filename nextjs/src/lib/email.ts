// Email Service using Resend
// Transactional emails for ContractFlow

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface SignatureEmailParams {
  to: string
  recipientName: string
  contractTitle: string
  signatureUrl: string
  senderEmail?: string
}

interface WelcomeEmailParams {
  to: string
  recipientName: string
}

// Send transactional email via Resend
export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('Resend not configured, email logged instead:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    return { success: true }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'ContractFlow <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    const data = await response.json()
    console.log('Email sent:', data.id)
    return { success: true }
  } catch (error: any) {
    console.error('Email error:', error)
    return { success: false, error: error.message }
  }
}

// Send signature request email
export async function sendSignatureRequest({
  to,
  recipientName,
  contractTitle,
  signatureUrl,
  senderEmail = 'ContractFlow'
}: SignatureEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">ContractFlow</h1>
          <p style="margin: 10px 0 0;">AI-Powered Contract Generation</p>
        </div>
        <div class="content">
          <h2>Please sign: ${contractTitle}</h2>
          <p>Hi ${recipientName},</p>
          <p>You've been requested to sign a contract. Please review and sign at your convenience.</p>
          <a href="${signatureUrl}" class="button">Review & Sign Contract</a>
          <p style="color: #64748b; font-size: 14px;">Or copy this link: ${signatureUrl}</p>
        </div>
        <div class="footer">
          <p>Sent by ${senderEmail}</p>
          <p>© 2024 ContractFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${recipientName},

You've been requested to sign a contract: ${contractTitle}

Please review and sign at:
${signatureUrl}

Sent by ${senderEmail}
© 2024 ContractFlow
  `.trim()

  return sendEmail({
    to,
    subject: `Please sign: ${contractTitle}`,
    html,
    text,
  })
}

// Send contract signed confirmation email
export async function sendContractSignedConfirmation({
  to,
  recipientName,
  contractTitle
}: SignatureEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✓ Contract Signed</h1>
        </div>
        <div class="content">
          <span class="success-badge">✓ Success</span>
          <h2>Great news, ${recipientName}!</h2>
          <p>Your contract has been signed successfully.</p>
          <p><strong>Contract:</strong> ${contractTitle}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>You can view the signed contract in your ContractFlow dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${recipientName},

Great news! Your contract has been signed successfully.

Contract: ${contractTitle}
Date: ${new Date().toLocaleDateString()}

View in your ContractFlow dashboard.
© 2024 ContractFlow
  `.trim()

  return sendEmail({
    to,
    subject: `Contract signed: ${contractTitle}`,
    html,
    text,
  })
}

// Send welcome email
export async function sendWelcomeEmail({ to, recipientName }: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .features { list-style: none; padding: 0; }
        .features li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .features li:before { content: "✓ "; color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to ContractFlow! 🎉</h1>
          <p style="margin: 10px 0 0;">AI contracts for freelancers</p>
        </div>
        <div class="content">
          <h2>Hi ${recipientName}!</h2>
          <p>Your account has been created successfully. You're ready to start creating professional contracts!</p>
          <h3>You can now:</h3>
          <ul class="features">
            <li>Create professional contracts in minutes</li>
            <li>Generate AI-powered contract text</li>
            <li>Request e-signatures from clients</li>
            <li>Manage your client database</li>
            <li>Accept payments in multiple currencies</li>
          </ul>
          <a href="https://contract-flow.app/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started →</a>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${recipientName}!

Welcome to ContractFlow! Your account is ready.

Get started at: https://contract-flow.app/dadow
© 2024 ContractFlow
  `.trim()

  return sendEmail({
    to: recipientName + ' <' + to + '>',
    subject: 'Welcome to ContractFlow!',
    html,
    text,
  })
}

// Send subscription upgraded email
export async function sendSubscriptionUpgradedEmail({ to, recipientName }: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: #8b5cf6; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 You're now a Pro!</h1>
          <span class="badge">Pro Member</span>
        </div>
        <div class="content">
          <h2>Welcome to ContractFlow Pro, ${recipientName}!</h2>
          <p>Your subscription has been upgraded. You now have access to:</p>
          <ul>
            <li>✓ Unlimited contracts</li>
            <li>✓ All contract types</li>
            <li>✓ AI-powered generation</li>
            <li>✓ Google Docs export</li>
            <li>✓ E-signature workflow</li>
            <li>✓ Priority support</li>
          </ul>
          <p>Thank you for choosing ContractFlow!</p>
        </div>
      </div>
    </body>
    </html>
  `.replace(/\$\{recipientName\}/g, recipientName)

  const text = `
Hi ${recipientName}!

You're now a Pro member! Thanks for upgrading.

Your Pro features:
- Unlimited contracts
- AI-powered generation
- Google Docs export
- E-signature workflow
- Priority support

© 2024 ContractFlow
  `.trim()

  return sendEmail({
    to: recipientName + ' <' + to + '>',
    subject: 'Welcome to ContractFlow Pro!',
    html,
    text,
  })
}