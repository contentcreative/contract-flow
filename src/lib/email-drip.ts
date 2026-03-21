// Email Drip Campaigns for ContractFlow
// Automated nurture sequences for free users

import { sendEmail } from './email'

interface DripEmailParams {
  to: string
  recipientName?: string
}

// Drip email templates
export const dripEmails = {
  // Day 3: Reminder for users who signed up but didn't create a contract
  abandonedSignup: {
    subject: "Ready to create your first contract?",
    html: (name?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .features { list-style: none; padding: 0; }
    .features li { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .features li:before { content: "✓ "; color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Hi ${name || 'there'}! 👋</h1>
      <p>Welcome to ContractFlow</p>
    </div>
    <div class="content">
      <h2>Ready to create your first contract?</h2>
      <p>You signed up for ContractFlow a few days ago. Here's a quick reminder of what you can do:</p>
      
      <ul class="features">
        <li>Generate professional contracts in minutes</li>
        <li>AI-powered text that adapts to your needs</li>
        <li>Request e-signatures from clients</li>
        <li>Export to Google Docs or PDF</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://contract-flow.app/generate" class="button">Create Your First Contract →</a>
      </p>
      
      <p style="color: #64748b; font-size: 14px; text-align: center;">
        You have 2 free contracts remaining this month.
      </p>
    </div>
  </div>
</body>
</html>`,
    text: (name?: string) => `
Hi ${name || 'there'}!

Ready to create your first contract?

You signed up for ContractFlow a few days ago. Here's what you can do:
- Generate professional contracts in minutes
- AI-powered text that adapts to your needs
- Request e-signatures from clients
- Export to Google Docs or PDF

Create your first contract: https://contract-flow.app/generate

You have 2 free contracts remaining this month.

© 2024 ContractFlow
      `.trim()
  },

  // Day 7: Tips and tricks
  tipsAndTricks: {
    subject: "3 ways to get more from ContractFlow",
    html: (name?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .tip { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
    .tip h3 { margin: 0 0 10px; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Pro Tips 💡</h1>
      <p>3 ways to get more from ContractFlow</p>
    </div>
    <div class="content">
      <p>Hi ${name || 'there'}!</p>
      
      <div class="tip">
        <h3>1. Save Your Clients</h3>
        <p>Add your regular clients in the Clients section. Their details auto-populate into contracts!</p>
      </div>
      
      <div class="tip">
        <h3>2. Use Templates</h3>
        <p>Browse the template gallery. Each template is optimized for specific use cases.</p>
      </div>
      
      <div class="tip">
        <h3>3. Request Signatures</h3>
        <p>Send contracts directly to clients for e-signature. No more printing and scanning!</p>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://contract-flow.app/dashboard" class="button" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Explore Features →</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    text: (name?: string) => `
Hi ${name || 'there'}!

3 ways to get more from ContractFlow:

1. Save Your Clients
   Add regular clients. Their details auto-populate into contracts!

2. Use Templates
   Browse the template gallery for specific use cases.

3. Request Signatures
   Send contracts directly for e-signature.

Explore more: https://contract-flow.app/dashboard

© 2024 ContractFlow
      `.trim()
  },

  // Day 14: Upgrade offer with discount
  upgradeOffer: {
    subject: "Special offer: 20% off Pro (3 days left)",
    html: (name?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px; border-radius: 12px; text-align: center; }
    .discount { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .features { list-style: none; padding: 0; }
    .features li { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .features li:before { content: "✓ "; color: #f59e0b; font-weight: bold; font-size: 18px; }
    .price { font-size: 24px; font-weight: bold; color: #f59e0b; }
    .original-price { text-decoration: line-through; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎁 Special Offer Just for You!</h1>
      <div class="discount">20% OFF</div>
      <p>Upgrade to Pro and unlock everything</p>
    </div>
    <div class="content">
      <p>Hi ${name || 'there'}!</p>
      <p>We've noticed you've been using ContractFlow and think you'll love what Pro has to offer:</p>
      
      <ul class="features">
        <li><strong>Unlimited contracts</strong> - No more counting</li>
        <li><strong>AI-powered generation</strong> - Smarter, faster</li>
        <li><strong>Google Docs export</strong> - Work in your workflow</li>
        <li><strong>E-signature workflow</strong> - Close deals faster</li>
        <li><strong>Priority support</strong> - Get help faster</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://contract-flow.app/dashboard?upgrade=true" style="display: inline-block; background: #f59e0b; color: white; padding: 18px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px;">Upgrade Now - Only £7.20/mo</a>
      </p>
      
      <p style="text-align: center; color: #dc2626; font-weight: bold;">
        ⏰ This offer expires in 3 days
      </p>
    </div>
  </div>
</body>
</html>`,
    text: (name?: string) => `
Hi ${name || 'there'}!

🎁 Special Offer: 20% OFF Pro!

Upgrade to Pro for just £7.20/month (normally £9):

✓ Unlimited contracts
✓ AI-powered generation
✓ Google Docs export
✓ E-signature workflow
✓ Priority support

This offer expires in 3 days!

Upgrade now: https://contract-flow.app/dashboard?upgrade=true

© 2024 ContractFlow
      `.trim()
  }
}

// Send a drip email
export async function sendDripEmail(type: keyof typeof dripEmails, params: DripEmailParams): Promise<{ success: boolean; error?: string }> {
  const template = dripEmails[type]
  
  return sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html(params.recipientName),
    text: template.text(params.recipientName)
  })
}

// Get all drip email templates (for admin viewing)
export function getDripTemplates() {
  return Object.entries(dripEmails).map(([key, value]) => ({
    id: key,
    subject: value.subject
  }))
}