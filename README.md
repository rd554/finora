# 🚀 Finora - AI-Powered Financial Burn Risk Coach

Finora is a smart financial coach that analyzes your monthly expense-to-income burn risk, detects lifestyle inflation, and provides AI-generated advice to help you manage spending better and avoid financial burnout.

## 🎯 Features

- 🔍 **GPT-powered Burn Risk Diagnosis**: Get human-friendly explanations of your spending behavior and burn risk
- 🔄 **Lifestyle Inflation Detection**: Compare monthly expenses over time and detect overspending trends
- 🎭 **Burn Persona Classification**: Get classified into personas like "YOLO Earner" or "Calculated Climber"
- 📊 **Scenario Simulator**: See the financial impact of saving more, earning less, or spending differently
- 💡 **Smart Budget Recommendations**: Get AI-suggested category-wise budgets tailored to your income and spending style

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