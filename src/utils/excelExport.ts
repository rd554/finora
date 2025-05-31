import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface FinancialData {
  income: string;
  expenses: string;
  emergencyFund: string;
  monthlyEmi: string;
  categories: Record<string, string>;
  analysis: {
    analysis: string;
  };
}

export async function generateExcelReport(data: FinancialData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Finora';
  workbook.lastModifiedBy = 'Finora';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 40 },
  ];

  const monthlyIncome = parseFloat(data.income);
  const monthlyExpenses = parseFloat(data.expenses);
  const burnRate = (monthlyExpenses / monthlyIncome) * 100;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  summarySheet.addRows([
    { metric: 'Monthly Income', value: `₹${monthlyIncome.toLocaleString()}` },
    { metric: 'Monthly Expenses', value: `₹${monthlyExpenses.toLocaleString()}` },
    { metric: 'Emergency Fund', value: `₹${parseFloat(data.emergencyFund).toLocaleString()}` },
    { metric: 'Monthly EMIs', value: `₹${parseFloat(data.monthlyEmi).toLocaleString()}` },
    { metric: 'Burn Rate', value: `${burnRate.toFixed(1)}%` },
    { metric: 'Monthly Savings', value: `₹${monthlySavings.toLocaleString()}` },
  ]);

  // Add insights
  const insights = generateInsights(data);
  summarySheet.addRow({ metric: 'Key Insights', value: '' });
  insights.forEach(insight => {
    summarySheet.addRow({ metric: '', value: insight });
  });

  // Wrap and merge AI Analysis cell if present
  const aiRowIdx = summarySheet.actualRowCount;
  const aiRow = summarySheet.getRow(aiRowIdx);
  if (aiRow.getCell('value').value && String(aiRow.getCell('value').value).includes('AI Analysis:')) {
    // Merge the value cell across columns B to D for better vertical display
    summarySheet.mergeCells(`B${aiRowIdx}:D${aiRowIdx}`);
    aiRow.getCell('value').alignment = { wrapText: true, vertical: 'top' };
    aiRow.height = 60; // Increase row height for readability
  }

  // Categories Sheet
  const categoriesSheet = workbook.addWorksheet('Categories');
  categoriesSheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 20 },
    { header: 'Percentage', key: 'percentage', width: 20 },
  ];

  // Add explanation row
  const catNote = `Note: Percentages are calculated as a share of your total monthly expenses (₹${monthlyExpenses.toLocaleString()}).`;
  categoriesSheet.addRow({ category: catNote, amount: '', percentage: '' });
  categoriesSheet.getRow(1).font = { italic: true, color: { argb: 'FF888888' } };
  categoriesSheet.mergeCells('A1:C1');

  // Add category data
  Object.entries(data.categories).forEach(([category, amount]) => {
    const amountNum = parseFloat(amount);
    const percentage = (amountNum / monthlyExpenses) * 100;
    categoriesSheet.addRow({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: `₹${amountNum.toLocaleString()}`,
      percentage: `${percentage.toFixed(1)}%`,
    });
  });

  // Transactions Sheet
  const transactionsSheet = workbook.addWorksheet('Transactions');
  transactionsSheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 20 },
    { header: 'Percentage', key: 'percentage', width: 20 },
  ];

  Object.entries(data.categories).forEach(([category, amount]) => {
    const amountNum = parseFloat(amount);
    const percentage = (amountNum / monthlyExpenses) * 100;
    transactionsSheet.addRow({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: `₹${amountNum.toLocaleString()}`,
      percentage: `${percentage.toFixed(1)}%`,
    });
  });

  // Trends Sheet
  const trendsSheet = workbook.addWorksheet('Trends');
  trendsSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 30 },
  ];

  // Add explanation rows
  const trendsNotes = [
    'Explanations:',
    '• Income to Expense Ratio: How many times your income covers your expenses (Income ÷ Expenses).',
    '• Savings Rate: What percent of your income you save each month ((Income - Expenses) ÷ Income × 100).',
    '• Emergency Fund Coverage: How many months you can cover your expenses using your emergency fund (Emergency Fund ÷ Monthly Expenses).',
  ];
  trendsNotes.forEach((note, idx) => {
    trendsSheet.addRow({ metric: note, value: '' });
    trendsSheet.getRow(idx + 1).font = { italic: true, color: { argb: 'FF888888' } };
    trendsSheet.mergeCells(`A${idx + 1}:B${idx + 1}`);
  });

  trendsSheet.addRows([
    { metric: 'Income to Expense Ratio', value: (monthlyIncome / monthlyExpenses).toFixed(2) },
    { metric: 'Savings Rate', value: `${((monthlySavings / monthlyIncome) * 100).toFixed(1)}%` },
    { metric: 'Emergency Fund Coverage', value: `${(parseFloat(data.emergencyFund) / monthlyExpenses).toFixed(1)} months` },
  ]);

  // Style the workbook
  workbook.views = [
    {
      x: 0, y: 0, width: 10000, height: 20000,
      firstSheet: 0, activeTab: 0, visibility: 'visible'
    }
  ];

  // Generate and save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Finora_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
}

function generateInsights(data: FinancialData): string[] {
  const insights: string[] = [];
  const monthlyIncome = parseFloat(data.income);
  const monthlyExpenses = parseFloat(data.expenses);
  const burnRate = (monthlyExpenses / monthlyIncome) * 100;

  // Burn rate insights
  if (burnRate > 90) {
    insights.push('⚠️ High burn rate detected! Consider reducing expenses to maintain financial stability.');
  } else if (burnRate < 50) {
    insights.push('✅ Excellent burn rate! You\'re maintaining a healthy balance between income and expenses.');
  }

  // Category insights
  const categories = Object.entries(data.categories)
    .map(([category, amount]) => ({ category, amount: parseFloat(amount) }))
    .sort((a, b) => b.amount - a.amount);

  if (categories.length > 0) {
    const topCategory = categories[0];
    insights.push(`🛍️ ${topCategory.category} is your highest expense category (₹${topCategory.amount.toLocaleString()})`);
  }

  // Emergency fund insights
  const emergencyFund = parseFloat(data.emergencyFund);
  const monthlyExpense = parseFloat(data.expenses);
  const emergencyFundMonths = emergencyFund / monthlyExpense;

  if (emergencyFundMonths < 3) {
    insights.push('⚠️ Your emergency fund is below the recommended 3-month threshold. Consider building it up.');
  } else if (emergencyFundMonths > 6) {
    insights.push('✅ Great job maintaining a robust emergency fund!');
  }

  // Add AI analysis if available
  if (data.analysis.analysis) {
    insights.push('💡 AI Analysis: ' + data.analysis.analysis);
  }

  return insights;
} 