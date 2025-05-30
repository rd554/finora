import { useStore } from '@/lib/store'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function FinancialHealthScore() {
  const { income, expenses, emergencyFund, monthlyEmi, analysis } = useStore()

  if (!income || !expenses || !analysis.analysis) {
    return null
  }

  const incomeNum = parseFloat(income)
  const expensesNum = parseFloat(expenses)
  const emergencyFundNum = parseFloat(emergencyFund) || 0
  const monthlyEmiNum = parseFloat(monthlyEmi) || 0

  // Calculate financial health score (0-100)
  const burnRate = (expensesNum / incomeNum) * 100
  const emergencyFundRatio = (emergencyFundNum / expensesNum) * 100
  const emiRatio = (monthlyEmiNum / incomeNum) * 100

  let score = 100

  // Deduct points for high burn rate
  if (burnRate > 80) {
    score -= 40
  } else if (burnRate > 60) {
    score -= 20
  } else if (burnRate > 40) {
    score -= 10
  }

  // Deduct points for low emergency fund
  if (emergencyFundRatio < 3) {
    score -= 30
  } else if (emergencyFundRatio < 6) {
    score -= 15
  }

  // Deduct points for high EMI ratio
  if (emiRatio > 50) {
    score -= 30
  } else if (emiRatio > 30) {
    score -= 15
  }

  score = Math.max(0, Math.min(100, score))

  // Determine health status and icon
  let status = ''
  let icon = ''
  let color = ''

  if (score >= 80) {
    status = 'Stable'
    icon = '🌿'
    color = 'text-success-600'
  } else if (score >= 50) {
    status = 'Moderate'
    icon = '🌤'
    color = 'text-warning-600'
  } else {
    status = 'Risk Zone'
    icon = '🔥'
    color = 'text-danger-600'
  }

  // Extract persona from analysis
  const personaMatch = analysis.analysis.match(
    /(YOLO Earner|Calculated Climber|Cautious Saver|Balanced Builder)/
  )
  const persona = personaMatch ? personaMatch[1] : ''

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-medium text-gray-900">Financial Health</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <span className={`text-lg font-medium ${color}`}>{status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Health Score</span>
            <span className="text-sm font-medium text-gray-900">{score}/100</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                score >= 80
                  ? 'bg-success-500'
                  : score >= 50
                  ? 'bg-warning-500'
                  : 'bg-danger-500'
              } transition-all duration-500 ease-out`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {persona && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Your Burn Persona:{' '}
              <span className="font-medium text-primary-600">{persona}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 