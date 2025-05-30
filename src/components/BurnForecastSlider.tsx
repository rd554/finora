import { useState } from 'react'
import { useStore } from '@/lib/store'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function BurnForecastSlider() {
  const { income, expenses, emergencyFund, monthlyEmi } = useStore()
  const [months, setMonths] = useState(6)

  if (!income || !expenses) {
    return null
  }

  const incomeNum = parseFloat(income)
  const expensesNum = parseFloat(expenses)
  const emergencyFundNum = parseFloat(emergencyFund) || 0
  const monthlyEmiNum = parseFloat(monthlyEmi) || 0
  const monthlySavings = incomeNum - (expensesNum + monthlyEmiNum)

  // Generate forecast data
  const forecastData = Array.from({ length: months + 1 }, (_, i) => {
    const savings = emergencyFundNum + (monthlySavings * i)
    return {
      month: i,
      savings: Math.round(savings),
      label: `Month ${i}`,
    }
  })

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Savings Forecast</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Months: {months}</span>
          <input
            type="range"
            min="1"
            max="12"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              label={{ value: 'Months', position: 'insideBottom', offset: -20 }}
            />
            <YAxis
              label={{
                value: 'Savings (₹)',
                angle: -90,
                position: 'insideLeft',
                offset: -30,
              }}
            />
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString()}`}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          After {months} months, your savings will likely be{' '}
          <span className="font-semibold text-primary-600">
            ₹{forecastData[months].savings.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  )
} 