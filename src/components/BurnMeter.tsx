import { useStore } from '@/lib/store'

export default function BurnMeter() {
  const { income, expenses } = useStore()

  if (!income || !expenses) {
    return null
  }

  const incomeNum = parseFloat(income)
  const expensesNum = parseFloat(expenses)
  const burnRate = (expensesNum / incomeNum) * 100
  const remaining = 100 - burnRate

  // Determine the color based on burn rate
  let color = 'bg-success-500'
  if (burnRate > 80) {
    color = 'bg-danger-500'
  } else if (burnRate > 60) {
    color = 'bg-warning-500'
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">Burn Rate Meter</h3>
        <span className="text-sm font-medium text-gray-500">
          {burnRate.toFixed(1)}% of income
        </span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${burnRate}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Safe Zone</span>
        <span>Warning Zone</span>
        <span>Danger Zone</span>
      </div>
    </div>
  )
} 