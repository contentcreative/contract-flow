import { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, FileText, Calendar, ArrowUp, ArrowDown, Clock, CheckCircle } from 'lucide-react'

type AnalyticsData = {
  // Overview stats
  totalContracts: number
  totalRevenue: number
  averageContractValue: number
  activeClients: number
  
  // Trends
  contractsThisMonth: number
  revenueThisMonth: number
  contractsLastMonth: number
  revenueLastMonth: number
  
  // Client metrics
  totalClients: number
  repeatClients: number
  newClientsThisMonth: number
  
  // Contract metrics
  contractTypeDistribution: Record<string, number>
  averagePaymentTime: number
  
  // Pipeline
  pendingContracts: number
  draftContracts: number
}

type AnalyticsDashboardProps = {
  userId: string
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [userId, period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, period })
      })
      const result = await res.json()
      if (result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
    setLoading(false)
  }

  // Calculate trends
  const contractTrend = data && data.contractsLastMonth > 0 
    ? ((data.contractsThisMonth - data.contractsLastMonth) / data.contractsLastMonth) * 100 
    : 0
  
  const revenueTrend = data && data.revenueLastMonth > 0 
    ? ((data.revenueThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100 
    : 0

  const repeatClientRate = data && data.totalClients > 0 
    ? (data.repeatClients / data.totalClients) * 100 
    : 0

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Analytics & Insights</h2>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Total Contracts</span>
          </div>
          <div className="text-2xl font-bold">{data?.totalContracts || 0}</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${contractTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {contractTrend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(contractTrend).toFixed(1)}% vs last period
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold">£{(data?.totalRevenue || 0).toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueTrend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(revenueTrend).toFixed(1)}% vs last period
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Avg Contract Value</span>
          </div>
          <div className="text-2xl font-bold">£{(data?.averageContractValue || 0).toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Active Clients</span>
          </div>
          <div className="text-2xl font-bold">{data?.activeClients || 0}</div>
          <div className="text-sm text-gray-500 mt-1">
            {repeatClientRate.toFixed(0)}% repeat rate
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">This Period</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">New Contracts</span>
              <span className="font-semibold">{data?.contractsThisMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold">£{(data?.revenueThisMonth || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Clients</span>
              <span className="font-semibold">{data?.newClientsThisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Payment Metrics</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Days to Pay</span>
              <span className="font-semibold">{data?.averagePaymentTime || 0} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold">{data?.pendingContracts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Drafts</span>
              <span className="font-semibold">{data?.draftContracts || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Contract Types</span>
          </div>
          <div className="space-y-2">
            {data?.contractTypeDistribution && Object.entries(data.contractTypeDistribution).length > 0 ? (
              Object.entries(data.contractTypeDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-600">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))
            ) : (
              <div className="text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4">Revenue Trend</h3>
        <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
          Revenue chart visualization - Coming soon
        </div>
      </div>
    </div>
  )
}