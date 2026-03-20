import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' })
  }

  try {
    // Get all contracts
    const { data: contracts } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', user_id)

    // Get all invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user_id)

    // Get all clients
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user_id)

    // Calculate metrics
    const total_contracts = contracts?.length || 0
    const signed_contracts = contracts?.filter((c: any) => c.signature_status === 'signed').length || 0
    const total_revenue = invoices?.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0) || 0
    const outstanding_balance = invoices?.filter((i: any) => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum: number, i: any) => sum + i.amount, 0) || 0
    
    // Average payment time
    const paid_invoices = invoices?.filter((i: any) => i.status === 'paid' && i.payment_received_date) || []
    const avg_payment_days = paid_invoices.length > 0 
      ? Math.round(paid_invoices.reduce((sum: number, i: any) => {
          const invoice_date = new Date(i.invoice_date)
          const payment_date = new Date(i.payment_received_date)
          return sum + ((payment_date.getTime() - invoice_date.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / paid_invoices.length)
      : 0

    // Active clients (contracts in last 90 days)
    const ninety_days_ago = new Date()
    ninety_days_ago.setDate(ninety_days_ago.getDate() - 90)
    const active_clients = new Set(
      contracts?.filter((c: any) => new Date(c.created_at) > ninety_days_ago).map((c: any) => c.client_id)
    ).size

    // Repeat clients
    const client_contract_counts: Record<string, number> = {}
    contracts?.forEach((c: any) => {
      if (c.client_id) {
        client_contract_counts[c.client_id] = (client_contract_counts[c.client_id] || 0) + 1
      }
    })
    const repeat_clients = Object.values(client_contract_counts).filter(count => count > 1).length
    const retention_rate = clients?.length ? ((repeat_clients / clients.length) * 100).toFixed(1) : 0

    // Top contract type
    const type_counts: Record<string, number> = {}
    contracts?.forEach((c: any) => {
      type_counts[c.contract_type] = (type_counts[c.contract_type] || 0) + 1
    })
    const top_contract_type = Object.entries(type_counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null

    // Top industry
    const industry_counts: Record<string, number> = {}
    clients?.forEach((c: any) => {
      if (c.industry) {
        industry_counts[c.industry] = (industry_counts[c.industry] || 0) + 1
      }
    })
    const top_industry = Object.entries(industry_counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null

    // Monthly breakdown
    const monthly_data: Record<string, { contracts: number, revenue: number }> = {}
    contracts?.forEach((c: any) => {
      const month = c.created_at?.substring(0, 7)
      if (month) {
        monthly_data[month] = { contracts: (monthly_data[month]?.contracts || 0) + 1, revenue: monthly_data[month]?.revenue || 0 }
      }
    })
    invoices?.forEach((i: any) => {
      if (i.status === 'paid' && i.payment_received_date) {
        const month = i.payment_received_date.substring(0, 7)
        if (month) {
          monthly_data[month] = { 
            contracts: monthly_data[month]?.contracts || 0, 
            revenue: (monthly_data[month]?.revenue || 0) + i.amount 
          }
        }
      }
    })

    return res.status(200).json({
      success: true,
      analytics: {
        overview: {
          total_contracts,
          signed_contracts,
          total_revenue,
          outstanding_balance,
          avg_payment_days,
          active_clients,
          repeat_clients,
          retention_rate,
          top_contract_type,
          top_industry
        },
        average_contract_value: total_contracts > 0 ? Math.round(total_revenue / total_contracts) : 0,
        monthly_data,
        contracts_by_type: type_counts,
        clients_by_industry: industry_counts,
        client_revenue_ranking: clients?.sort((a: any, b: any) => (b.total_revenue || 0) - (a.total_revenue || 0)).slice(0, 10).map((c: any) => ({
          name: c.name,
          company: c.company_name,
          revenue: c.total_revenue || 0,
          contract_count: c.contract_count || 0
        }))
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}