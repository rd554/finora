import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    const prompt = `Parse this financial description into structured data:
"${text}"

Extract and return a JSON object with these fields:
- income (number)
- expenses (total number)
- categories (object with keys: dining, subscriptions, groceries, transport)
- emergencyFund (number, default to 0 if not mentioned)
- monthlyEmi (number, default to 0 if not mentioned)

Example response format:
{
  "income": 50000,
  "expenses": 17000,
  "categories": {
    "dining": 5000,
    "subscriptions": 2000,
    "groceries": 5000,
    "transport": 5000
  },
  "emergencyFund": 0,
  "monthlyEmi": 0
}

Only return the JSON object, no other text.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
    })

    const parsedData = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error parsing expenses:', error)
    return NextResponse.json(
      { error: 'Failed to parse expenses' },
      { status: 500 }
    )
  }
} 