import { useState } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import Papa from 'papaparse'
import { useStore } from '@/lib/store'

// Helper: infer category from description
function inferCategory(description = '') {
  const desc = description.toLowerCase()
  if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('food')) return 'dining'
  if (desc.includes('uber') || desc.includes('ola') || desc.includes('transport')) return 'transport'
  if (desc.includes('grocery') || desc.includes('d-mart') || desc.includes('groceries')) return 'groceries'
  if (desc.includes('subscription') || desc.includes('netflix') || desc.includes('prime')) return 'subscriptions'
  if (desc.includes('electricity') || desc.includes('bill')) return 'utilities'
  return 'other'
}

export default function CsvUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const setFinancialData = useStore((state) => state.setFinancialData)
  const analyzeFinancialData = useStore((state) => state.analyzeFinancialData)
  const [success, setSuccess] = useState(false)

  const handleFileUpload = async (file: File) => {
    Papa.parse(file, {
      complete: async (results) => {
        const rows = results.data as any[][]
        if (!rows.length) return
        const headers = rows[0].map((h: string) => h.trim().toLowerCase())
        const dataRows = rows.slice(1)
        let totalIncome = 0
        let totalExpenses = 0
        const categoryTotals: Record<string, number> = {
          dining: 0, subscriptions: 0, groceries: 0, transport: 0, utilities: 0, other: 0
        }

        // Detect format
        if (headers.includes('debit (inr)') && headers.includes('credit (inr)')) {
          // Bank Statement
          const idxDesc = headers.indexOf('description')
          const idxDebit = headers.indexOf('debit (inr)')
          const idxCredit = headers.indexOf('credit (inr)')
          dataRows.forEach((row: any) => {
            const desc = row[idxDesc]
            const debit = parseFloat(row[idxDebit] || '0')
            const credit = parseFloat(row[idxCredit] || '0')
            if (credit > 0) {
              // Try to detect salary
              if (desc && desc.toLowerCase().includes('salary')) {
                totalIncome += credit
              }
            }
            if (debit > 0) {
              totalExpenses += debit
              const cat = inferCategory(desc)
              if (categoryTotals[cat] !== undefined) categoryTotals[cat] += debit
              else categoryTotals.other += debit
            }
          })
        } else if (headers.includes('type') && headers.includes('amount (inr)')) {
          // UPI Statement
          const idxDesc = headers.indexOf('description')
          const idxAmt = headers.indexOf('amount (inr)')
          const idxType = headers.indexOf('type')
          dataRows.forEach((row: any) => {
            const desc = row[idxDesc]
            const amt = parseFloat(row[idxAmt] || '0')
            const type = (row[idxType] || '').toLowerCase()
            if (type === 'credit') {
              totalIncome += amt
            } else if (type === 'debit') {
              totalExpenses += amt
              const cat = inferCategory(desc)
              if (categoryTotals[cat] !== undefined) categoryTotals[cat] += amt
              else categoryTotals.other += amt
            }
          })
        } else if (headers.includes('category') && headers.includes('type')) {
          // Personal Format
          const idxAmt = headers.indexOf('amount')
          const idxType = headers.indexOf('type')
          const idxCat = headers.indexOf('category')
          dataRows.forEach((row: any) => {
            const amt = parseFloat(row[idxAmt] || '0')
            const type = (row[idxType] || '').toLowerCase()
            const cat = (row[idxCat] || '').toLowerCase()
            if (type === 'credit') {
              totalIncome += amt
            } else if (type === 'debit') {
              totalExpenses += amt
              if (categoryTotals[cat] !== undefined) categoryTotals[cat] += amt
              else categoryTotals.other += amt
            }
          })
        } else {
          // Unknown format: fallback to try to parse Amount/Type/Description
          dataRows.forEach((row: any) => {
            const desc = row[1] || ''
            const amt = parseFloat(row[2] || '0')
            if (amt < 0) {
              totalExpenses += Math.abs(amt)
              const cat = inferCategory(desc)
              if (categoryTotals[cat] !== undefined) categoryTotals[cat] += Math.abs(amt)
              else categoryTotals.other += Math.abs(amt)
            } else if (amt > 0) {
              totalIncome += amt
            }
          })
        }

        const parsedData: any = {
          income: totalIncome ? totalIncome.toString() : '',
          expenses: totalExpenses ? totalExpenses.toString() : '',
          categories: {
            dining: categoryTotals.dining.toString(),
            subscriptions: categoryTotals.subscriptions.toString(),
            groceries: categoryTotals.groceries.toString(),
            transport: categoryTotals.transport.toString(),
            utilities: categoryTotals.utilities.toString(),
            other: categoryTotals.other.toString(),
          },
        }
        setFinancialData(parsedData)
        await analyzeFinancialData()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      },
      header: false, // We'll handle header row manually
      error: (error) => {
        console.error('Error parsing CSV:', error)
      },
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      handleFileUpload(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div
      className={`mt-6 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-1 text-center">
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <span>Upload a CSV file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleFileInput}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">CSV files only</p>
      </div>
      {success && (
        <div className="text-green-600 text-sm mt-2">CSV uploaded and data updated!</div>
      )}
    </div>
  )
} 