import { useState } from 'react'
import { Check, Clock, DollarSign, Plus, X, Edit2, Trash2 } from 'lucide-react'

type Milestone = {
  id?: string
  contract_id?: string
  milestone_number: number
  name: string
  description: string
  amount: number
  due_date: string
  is_completed: boolean
  payment_received: boolean
  payment_date?: string
}

type MilestoneTrackerProps = {
  contractId: string
  userId: string
  onMilestoneUpdate?: () => void
}

export default function MilestoneTracker({ contractId, userId, onMilestoneUpdate }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // New milestone form
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: '',
    description: '',
    amount: 0,
    due_date: '',
    is_completed: false,
    payment_received: false
  })

  // Fetch milestones
  const fetchMilestones = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/milestones/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, contract_id: contractId })
      })
      const result = await res.json()
      if (result.success) {
        setMilestones(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    }
    setLoading(false)
  }

  // Initial load
  if (loading && milestones.length === 0) {
    fetchMilestones()
  }

  // Add milestone
  const handleAddMilestone = async () => {
    if (!newMilestone.name || !newMilestone.amount) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/milestones/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          contract_id: contractId,
          milestone_number: milestones.length + 1,
          name: newMilestone.name,
          description: newMilestone.description || '',
          amount: newMilestone.amount,
          due_date: newMilestone.due_date || null,
          is_completed: false,
          payment_received: false
        })
      })
      const result = await res.json()
      if (result.success) {
        fetchMilestones()
        setShowAddForm(false)
        setNewMilestone({
          name: '',
          description: '',
          amount: 0,
          due_date: '',
          is_completed: false,
          payment_received: false
        })
        onMilestoneUpdate?.()
      }
    } catch (error) {
      console.error('Error adding milestone:', error)
    }
    setSaving(false)
  }

  // Toggle completion
  const toggleComplete = async (milestone: Milestone) => {
    try {
      const res = await fetch('/api/milestones/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: milestone.id,
          is_completed: !milestone.is_completed
        })
      })
      const result = await res.json()
      if (result.success) {
        fetchMilestones()
        onMilestoneUpdate?.()
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  // Toggle payment
  const togglePayment = async (milestone: Milestone) => {
    try {
      const res = await fetch('/api/milestones/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: milestone.id,
          payment_received: !milestone.payment_received,
          payment_date: !milestone.payment_received ? new Date().toISOString().split('T')[0] : null
        })
      })
      const result = await res.json()
      if (result.success) {
        fetchMilestones()
        onMilestoneUpdate?.()
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  // Calculate totals
  const totalValue = milestones.reduce((sum, m) => sum + m.amount, 0)
  const completedValue = milestones.filter(m => m.is_completed).reduce((sum, m) => sum + m.amount, 0)
  const paidValue = milestones.filter(m => m.payment_received).reduce((sum, m) => sum + m.amount, 0)
  const pendingValue = totalValue - paidValue

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Milestones & Payments</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500">Total Value</div>
          <div className="font-semibold">£{totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600">Completed</div>
          <div className="font-semibold text-blue-700">£{completedValue.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600">Paid</div>
          <div className="font-semibold text-green-700">£{paidValue.toLocaleString()}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-xs text-yellow-600">Pending</div>
          <div className="font-semibold text-yellow-700">£{pendingValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{milestones.filter(m => m.is_completed).length}/{milestones.length} completed</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${milestones.length ? (completedValue / totalValue) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Milestone name"
              className="px-3 py-2 border rounded-lg"
              value={newMilestone.name}
              onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount (£)"
              className="px-3 py-2 border rounded-lg"
              value={newMilestone.amount || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, amount: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="date"
              className="px-3 py-2 border rounded-lg"
              value={newMilestone.due_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              className="px-3 py-2 border rounded-lg col-span-2"
              rows={2}
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddMilestone}
              disabled={saving || !newMilestone.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Milestone'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No milestones yet. Add milestones to track payments.
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id || index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                milestone.payment_received ? 'bg-green-50 border-green-200' : 
                milestone.is_completed ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleComplete(milestone)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  milestone.is_completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {milestone.is_completed && <Check className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex-1">
                <div className={`font-medium ${milestone.is_completed ? 'line-through text-gray-500' : ''}`}>
                  {milestone.name}
                </div>
                {milestone.description && (
                  <div className="text-sm text-gray-500">{milestone.description}</div>
                )}
                {milestone.due_date && (
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Due: {milestone.due_date}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-semibold">£{milestone.amount.toLocaleString()}</div>
                <button
                  onClick={() => togglePayment(milestone)}
                  className={`text-xs px-2 py-1 rounded ${
                    milestone.payment_received 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                  }`}
                >
                  {milestone.payment_received ? 'Paid' : 'Mark Paid'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}