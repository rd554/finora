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

// Helper: extract transactions from PDF text and convert to CSV
function extractTransactionsToCSV(pdfText: string): string | null {
  // Remove header lines
  const cleaned = pdfText.replace(/Date\s+Particulars[\s\S]*?Total Amount\s+/g, '')
  // Use regex to find all transactions by date pattern
  const txRegex = /(\d{4}-\d{2}-\d{2} 00:00:00)([\s\S]*?)(?=(\d{4}-\d{2}-\d{2} 00:00:00)|$)/g
  const csvRows = [
    'Date,Description,Debit,Credit,Total', // CSV header
  ]
  let found = false
  let match
  while ((match = txRegex.exec(cleaned)) !== null) {
    const date = match[1].trim()
    const rest = match[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    // Extract description (up to first amount)
    const descMatch = rest.match(/^(.*?)([\d,]+\.\d{2})/)
    let desc = descMatch ? descMatch[1].replace(/,/g, ' ').trim() : rest
    // Find all amounts
    const amountPattern = /([\d,]+\.\d{2})/g
    const amounts = Array.from(rest.matchAll(amountPattern), m => m[1])
    // Find balance (last amount before CR)
    const crPattern = /([\d,]+\.\d{2})\s*CR/
    let total = ''
    const crMatch = rest.match(crPattern)
    if (crMatch) {
      total = crMatch[1].replace(/,/g, '')
    }
    // Assign debit/credit: if only one amount before balance, it's debit; if two, first is debit, second is credit
    let debit = ''
    let credit = ''
    if (amounts.length === 2) {
      debit = amounts[0].replace(/,/g, '')
      credit = ''
    } else if (amounts.length === 3) {
      debit = amounts[0].replace(/,/g, '')
      credit = amounts[1].replace(/,/g, '')
    } else if (amounts.length === 1) {
      debit = amounts[0].replace(/,/g, '')
      credit = ''
    }
    // Only add if we have a date and at least one amount
    if (date && (debit || credit)) {
      csvRows.push(`${date},${desc},${debit},${credit},${total}`)
      found = true
    }
  }
  if (found && csvRows.length > 1) {
    return csvRows.join('\n') + '\n'
  }
  return null
}

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const setFinancialData = useStore((state) => state.setFinancialData)
  const analyzeFinancialData = useStore((state) => state.analyzeFinancialData)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState('')
  const [pdfPassword, setPdfPassword] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [pdfText, setPdfText] = useState('')
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const handleFileUpload = async (file: File, password?: string) => {
    setFileName(file.name)
    setPdfError('')
    setPdfText('')
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setIsPdfLoading(true)
      try {
        if (typeof window === 'undefined') {
          setPdfError('PDF parsing is only supported in the browser.')
          setIsPdfLoading(false)
          return
        }
        // @ts-ignore
        const pdfjsLib = await import('pdfjs-dist/build/pdf')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        const arrayBuffer = await file.arrayBuffer()
        let loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password })
        let pdf
        try {
          pdf = await loadingTask.promise
        } catch (err: any) {
          if (err?.name === 'PasswordException' || err?.code === 1) {
            setShowPasswordPrompt(true)
            setPdfError('This PDF is password-protected. Please enter the password.')
            setIsPdfLoading(false)
            return
          } else if (err?.name === 'PasswordException' || err?.code === 2) {
            setShowPasswordPrompt(true)
            setPdfError('Incorrect password. Please try again.')
            setIsPdfLoading(false)
            return
          } else {
            setPdfError('Failed to open PDF. ' + (err?.message || 'Unknown error.'))
            setIsPdfLoading(false)
            return
          }
        }
        // Extract text from all pages
        let textContent = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const txt = await page.getTextContent()
          textContent += txt.items.map((item: any) => item.str).join(' ') + '\n'
        }
        setPdfText(textContent)
        setShowPasswordPrompt(false)
        setPdfError('')

        // --- PDF to CSV conversion ---
        const csvString = extractTransactionsToCSV(textContent)
        // Debug: log and show the generated CSV
        if (csvString) {
          console.log('Generated CSV from PDF:', csvString)
          // Only show CSV in the textarea if there is an error, not after successful parsing
          // Check if CSV is only header (no transactions)
          if (csvString.trim() === 'Date,Description,Debit,Credit,Total') {
            setPdfError('No transactions detected in PDF. Please upload a CSV or try a different PDF.')
            return
          }
          Papa.parse(csvString, {
            complete: async (results) => {
              console.log('PapaParse results:', results.data);
              const rows = results.data as any[]
              if (!rows.length || typeof rows[0] !== 'object') {
                setPdfError('Parsed CSV is empty or invalid. Please check your PDF format.')
                return
              }
              let totalIncome = 0
              let totalExpenses = 0
              const categoryTotals: Record<string, number> = {
                dining: 0, subscriptions: 0, groceries: 0, transport: 0, utilities: 0, other: 0
              }
              for (const row of rows) {
                const desc = row.Description || row.description || ''
                const debit = parseFloat(row.Debit || row.debit || '0')
                const credit = parseFloat(row.Credit || row.credit || '0')
                if (credit > 0) {
                  totalIncome += credit
                }
                if (debit > 0) {
                  totalExpenses += debit
                  const cat = inferCategory(desc)
                  if (categoryTotals[cat] !== undefined) categoryTotals[cat] += debit
                  else categoryTotals.other += debit
                }
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
              // Clear the textarea after successful parsing
              setPdfText('')
            },
            header: true,
            skipEmptyLines: true,
            error: (error: any) => {
              setPdfError('Error parsing generated CSV: ' + error.message)
            },
          })
        } else {
          setPdfError('Could not detect transactions in PDF. Please upload a CSV or try a different PDF.')
        }
        // --- End PDF to CSV conversion ---
        // (Optional: show generated CSV to user for review)
        // setPdfText(csvString || textContent)
        // ---
        // (Old direct PDF parsing logic removed for clarity)
      } catch (err: any) {
        setPdfError('Failed to parse PDF: ' + (err?.message || 'Unknown error.'))
      } finally {
        setIsPdfLoading(false)
      }
      return
    }
    // CSV logic (existing)
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
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handlePdfPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fileName) {
      // Find the file input element and get the file again
      const input = document.getElementById('file-upload') as HTMLInputElement
      const file = input?.files?.[0]
      if (file) {
        handleFileUpload(file, pdfPassword)
      }
    }
  }

  return (
    <div
      className={`mt-6 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-1 text-center w-full">
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600 justify-center">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
          >
            <span>Upload a CSV or PDF file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".csv,application/pdf"
              className="sr-only"
              onChange={handleFileInput}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        {fileName && <div className="text-xs text-gray-500 mt-1">File: {fileName}</div>}
        <p className="text-xs text-gray-500">CSV or PDF files only</p>
        {pdfError && <div className="text-red-600 text-sm mt-2">{pdfError}</div>}
        {isPdfLoading && <div className="text-primary-600 text-sm mt-2">Loading PDF...</div>}
        {showPasswordPrompt && (
          <form onSubmit={handlePdfPasswordSubmit} className="mt-2 flex flex-col items-center gap-2">
            <input
              type="password"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Enter PDF password"
              value={pdfPassword}
              onChange={e => setPdfPassword(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
            >
              Unlock PDF
            </button>
          </form>
        )}
        {pdfText && (
          <div className="mt-4 w-full max-w-md mx-auto">
            <label className="block text-xs font-medium text-gray-700 mb-1">Extracted PDF Text:</label>
            <textarea
              className="w-full h-40 border border-gray-300 rounded p-2 text-xs bg-gray-50"
              value={pdfText}
              readOnly
            />
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm mt-2">CSV uploaded and data updated!</div>
        )}
      </div>
    </div>
  )
} 