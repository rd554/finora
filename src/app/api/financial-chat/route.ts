import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const userMessage = (messages as any[])[messages.length - 1]?.content?.toLowerCase() || ''
    const contextMsg = (messages as any[]).find((m: any) => m.role === 'system')?.content || ''
    // Check if financial data is present (income and expenses are not empty)
    const hasData = /income: *₹?\d+/i.test(contextMsg) && /expenses: *₹?\d+/i.test(contextMsg) && !/income: *₹?0+/i.test(contextMsg)
    const personalKeywords = ['my', 'burn rate', 'savings', 'should i', 'how much', 'can i', 'what is my', 'personal', 'recommend', 'advice']
    const isPersonal = personalKeywords.some(k => userMessage.includes(k))
    if (!hasData && isPersonal) {
      return NextResponse.json({
        reply: "I don't have your data. Upload a CSV or manually enter your financial information and I'll be able to guide you with personalized advice."
      })
    }
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
    })
    const reply = completion.choices[0].message.content
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Error in financial chat:', error)
    return NextResponse.json({ reply: 'Sorry, something went wrong.' }, { status: 500 })
  }
} 