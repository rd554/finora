# 🚀 Finora - AI-Powered Financial Burn Risk Coach

Finora is a smart financial coach that analyzes your monthly expense-to-income burn risk, detects lifestyle inflation, and provides AI-generated advice to help you manage spending better and avoid financial burnout.

## 🎯 Features

- 🔍 **GPT-powered Burn Risk Diagnosis**: Get human-friendly explanations of your spending behavior and burn risk
- 🔄 **Lifestyle Inflation Detection**: Compare monthly expenses over time and detect overspending trends
- 🎭 **Burn Persona Classification**: Get classified into personas like "YOLO Earner" or "Calculated Climber"
- 📊 **Scenario Simulator**: See the financial impact of saving more, earning less, or spending differently
- 💡 **Smart Budget Recommendations**: Get AI-suggested category-wise budgets tailored to your income and spending style
- 📑 **PDF & CSV Bank Statement Upload**: Upload CSV or password-protected PDF bank statements. Finora auto-detects and extracts transactions, converts them to CSV, and autofills your financial dashboard for instant analysis.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-3.5 API
- **Data Processing**: PapaParse for CSV parsing
- **Visualization**: Recharts for financial charts
- **State Management**: React Hooks + Zustand
- **UI Components**: Heroicons

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/finora.git
   cd finora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Project Structure

```
finora/
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable UI components
│   ├── lib/             # OpenAI integration
│   └── utils/           # Helper functions
├── .env.local           # Environment variables
└── package.json         # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📑 PDF & CSV Bank Statement Upload

- **CSV Upload**: Upload your bank statement in CSV format. Finora will auto-detect columns, extract income and expenses, and analyze your burn risk.
- **PDF Upload**: Upload a regular or password-protected PDF bank statement. Finora will:
  - Prompt for a password if needed (all client-side)
  - Extract and auto-detect the transaction table
  - Convert transactions to CSV format
  - Autofill your financial dashboard and run instant analysis
- **Supported Formats**: Most Indian bank statements with clear date, description, debit, and credit columns. If your PDF is not detected, try exporting as CSV or contact us to add support for your format. 

## 📤 Excel Export with Insights & Charts

- **Export to Excel**: Instantly export your financial dashboard to a styled `.xlsx` Excel report.
- **Sheets Included**:
  - **Summary**: Key metrics, totals, and AI-generated insights
  - **Categories**: Expense breakdown by category, with percentage of total expenses (clearly explained)
  - **Transactions**: Full transaction table
  - **Trends**: Monthly ratios and coverage, with explanations for each metric
- **How to Use**:
  1. Upload your CSV or PDF and review your parsed data
  2. Click the "Export Excel" button below the dashboard
  3. Download your report with all insights and explanations included
- **Privacy**: All processing is done in your browser. No data leaves your device.

Example explanations in the report:
- _Percentages are calculated as a share of your total monthly expenses._
- _Emergency Fund Coverage: How many months you can cover your expenses using your emergency fund (Emergency Fund ÷ Monthly Expenses)._ 