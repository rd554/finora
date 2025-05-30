'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import CsvUploader from '@/components/CsvUploader'
import BurnAnalysis from '@/components/BurnAnalysis'
import BurnMeter from '@/components/BurnMeter'
import ExpenseChart from '@/components/ExpenseChart'
import BurnForecastSlider from '@/components/BurnForecastSlider'
import ExportReportButton from '@/components/ExportReportButton'
import PeerComparisonCard from '@/components/PeerComparisonCard'
import FinancialHealthScore from '@/components/FinancialHealthScore'
import FloatingChatWidget from '@/components/FloatingChatWidget'

export default function Home() {
  const {
    income,
    expenses,
    emergencyFund,
    monthlyEmi,
    categories,
    analysis,
    setFinancialData,
    analyzeFinancialData,
  } = useStore()

  // State for adding a new category
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryValue, setNewCategoryValue] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) {
      setCategoryError('Category name cannot be empty.')
      return
    }
    if (Object.keys(categories).some(
      (cat) => cat.toLowerCase() === name.toLowerCase()
    )) {
      setCategoryError('Category already exists.')
      return
    }
    setFinancialData({
      categories: {
        ...categories,
        [name]: newCategoryValue || 0,
      },
    })
    setNewCategoryName('')
    setNewCategoryValue('')
    setCategoryError('')
  }

  const handleRemoveCategory = (key: string) => {
    const updated = { ...categories }
    delete updated[key]
    setFinancialData({ categories: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await analyzeFinancialData()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-8">
            Your AI-powered financial burn risk coach
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="income" className="block text-sm font-medium text-gray-700">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    name="income"
                    id="income"
                    value={income}
                    onChange={(e) => setFinancialData({ income: e.target.value })}
                    step={1000}
                    min={0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your monthly income"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="expenses" className="block text-sm font-medium text-gray-700">
                    Total Monthly Expenses
                  </label>
                  <input
                    type="number"
                    name="expenses"
                    id="expenses"
                    value={expenses}
                    onChange={(e) => setFinancialData({ expenses: e.target.value })}
                    step={1000}
                    min={0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your total expenses"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="emergencyFund" className="block text-sm font-medium text-gray-700">
                    Emergency Fund
                  </label>
                  <input
                    type="number"
                    name="emergencyFund"
                    id="emergencyFund"
                    value={emergencyFund}
                    onChange={(e) => setFinancialData({ emergencyFund: e.target.value })}
                    step={1000}
                    min={0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your emergency fund amount"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="monthlyEmi" className="block text-sm font-medium text-gray-700">
                    Monthly EMIs
                  </label>
                  <input
                    type="number"
                    name="monthlyEmi"
                    id="monthlyEmi"
                    value={monthlyEmi}
                    onChange={(e) => setFinancialData({ monthlyEmi: e.target.value })}
                    step={1000}
                    min={0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                    placeholder="Enter your monthly EMIs"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Expense Categories</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(categories).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1">
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">
                          {key}
                        </label>
                        <input
                          type="number"
                          name={key}
                          id={key}
                          value={value}
                          onChange={(e) =>
                            setFinancialData({
                              categories: { ...categories, [key]: e.target.value },
                            })
                          }
                          step={100}
                          min={0}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                          placeholder={`Enter ${key} expenses`}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(key)}
                        className="mt-6 ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                        aria-label={`Remove ${key}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Add Category UI */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                  <div>
                    <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700">New Category</label>
                    <input
                      id="new-category-name"
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-category-value" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      id="new-category-value"
                      type="number"
                      min={0}
                      step={100}
                      value={newCategoryValue}
                      onChange={e => setNewCategoryValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Add Category
                  </button>
                </div>
                {categoryError && <div className="text-red-500 text-sm mt-2">{categoryError}</div>}
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  disabled={analysis.loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analysis.loading ? 'Analyzing...' : 'Analyze My Burn Risk'}
                </button>
              </div>
            </form>

            <FinancialHealthScore />
            <BurnMeter />
            <ExpenseChart />
            <BurnForecastSlider />
            <PeerComparisonCard />
            <BurnAnalysis />

            <div className="mt-6 flex justify-center">
              <ExportReportButton />
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                <CsvUploader />
              </div>
            </div>
          </div>
        </div>
        <FloatingChatWidget />
      </div>
    </div>
  )
} 