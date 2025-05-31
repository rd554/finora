'use client'

import { useStore } from '@/lib/store'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { generateExcelReport } from '@/utils/excelExport'

export default function ExportReportButton() {
  const { income, expenses, emergencyFund, monthlyEmi, categories, analysis } = useStore()

  const generatePDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Finora</h1>
          <p style="color: #6b7280; margin: 5px 0;">Financial Wellness Report</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Financial Overview</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <p><strong>Monthly Income:</strong> ₹${parseFloat(income).toLocaleString()}</p>
              <p><strong>Monthly Expenses:</strong> ₹${parseFloat(expenses).toLocaleString()}</p>
              <p><strong>Emergency Fund:</strong> ₹${parseFloat(emergencyFund).toLocaleString()}</p>
              <p><strong>Monthly EMIs:</strong> ₹${parseFloat(monthlyEmi).toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Burn Rate:</strong> ${((parseFloat(expenses) / parseFloat(income)) * 100).toFixed(1)}%</p>
              <p><strong>Monthly Savings:</strong> ₹${(parseFloat(income) - parseFloat(expenses)).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Expense Categories</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${Object.entries(categories)
              .map(
                ([category, amount]) => `
                <div>
                  <p><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ₹${parseFloat(
                  amount
                ).toLocaleString()}</p>
                </div>
              `
              )
              .join('')}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">AI Analysis</h2>
          <div style="white-space: pre-line; color: #4b5563;">
            ${analysis.analysis}
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px;">
          <p>Powered by Finora · Financial Wellness AI</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `

    const opt = {
      margin: 1,
      filename: 'finora-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }

    try {
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleExport = async (type: 'pdf' | 'excel') => {
    if (type === 'pdf') {
      await generatePDF()
    } else {
      await generateExcelReport({
        income,
        expenses,
        emergencyFund,
        monthlyEmi,
        categories,
        analysis,
      })
    }
  }

  if (!analysis.analysis) {
    return null
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('pdf')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        Export PDF
      </button>
      <button
        onClick={() => handleExport('excel')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        Export Excel
      </button>
    </div>
  )
} 