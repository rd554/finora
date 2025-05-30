import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      income,
      expenses,
      emergencyFund,
      monthlyEmi,
      categories,
    } = data

    const prompt = `You are Finora, a financial burn risk coach. Based on this data:
- Monthly income: ₹${income}
- Expenses: ₹${expenses}
- Emergency fund: ₹${emergencyFund}
- Fixed EMIs: ₹${monthlyEmi}
- Category-wise expenses:
${Object.entries(categories)
  .map(([category, amount]) => `  - ${category}: ₹${amount}`)
  .join('\n')}

Generate a comprehensive financial analysis with:
1. A 4-line summary of the current burn risk situation
2. Classification into one of these personas: "YOLO Earner", "Calculated Climber", "Cautious Saver", or "Balanced Builder"
3. Three specific, actionable recommendations to improve financial health
4. A brief explanation of lifestyle inflation risk (if any)

Tone: Friendly and professional, like a CFO helping a peer.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    })

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      { error: 'Failed to analyze financial data' },
      { status: 500 }
    )
  }
} 