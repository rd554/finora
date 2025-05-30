import { useStore } from '@/lib/store'
import { UserGroupIcon } from '@heroicons/react/24/outline'

export default function PeerComparisonCard() {
  const { income, categories, analysis } = useStore()

  if (!analysis.analysis || !income) {
    return null
  }

  // Mock peer data based on income brackets
  const incomeNum = parseFloat(income)
  let peerData = {
    dining: 0,
    subscriptions: 0,
    groceries: 0,
    transport: 0,
  }

  if (incomeNum <= 30000) {
    peerData = {
      dining: 3000,
      subscriptions: 1000,
      groceries: 4000,
      transport: 3000,
    }
  } else if (incomeNum <= 60000) {
    peerData = {
      dining: 5000,
      subscriptions: 2000,
      groceries: 6000,
      transport: 5000,
    }
  } else {
    peerData = {
      dining: 8000,
      subscriptions: 3000,
      groceries: 8000,
      transport: 7000,
    }
  }

  // Calculate differences
  const differences = Object.entries(categories).map(([category, amount]) => {
    const amountNum = parseFloat(amount)
    const peerAmount = peerData[category as keyof typeof peerData]
    const diff = ((amountNum - peerAmount) / peerAmount) * 100
    return {
      category,
      difference: diff,
    }
  })

  // Find the most significant differences
  const significantDiffs = differences
    .filter((diff) => Math.abs(diff.difference) > 10)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 2)

  if (significantDiffs.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <UserGroupIcon className="h-6 w-6 text-primary-600" />
        <h3 className="text-lg font-medium text-gray-900">Peer Comparison</h3>
      </div>

      <div className="space-y-3">
        {significantDiffs.map(({ category, difference }) => (
          <div
            key={category}
            className={`p-3 rounded-md ${
              difference > 0 ? 'bg-red-50' : 'bg-green-50'
            }`}
          >
            <p className="text-sm text-gray-600">
              Compared to others in your income bracket, you spend{' '}
              <span
                className={`font-medium ${
                  difference > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {Math.abs(difference).toFixed(0)}% {difference > 0 ? 'more' : 'less'}
              </span>{' '}
              on {category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 