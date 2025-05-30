"use client"

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function FinancialChat() {
  const { income, expenses, emergencyFund, monthlyEmi, categories, setFinancialData } = useStore()
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Describe your expenses: Example: I earn Rs. 50k and spend Rs 10k on rent, Rs.5k on food, and Rs. 2k on subscriptions.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingExpenseText, setPendingExpenseText] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const parseExpenses = async (text: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/parse-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to parse expenses')
      }

      const data = await response.json()
      setFinancialData(data)
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'ve filled in your financial details. You can now click "Analyze My Burn Risk" to see your analysis.' }])
    } catch (error) {
      console.error('Error parsing expenses:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t parse your expenses. Please try again with a clearer format.' }])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '2.4rem'

    // Check if this is a response to the "Convert to Form" question
    if (pendingExpenseText && input.toLowerCase().includes('yes')) {
      await parseExpenses(pendingExpenseText)
      setPendingExpenseText(null)
      setLoading(false)
      return
    }

    // Prepare context
    const context = `User's financial data:\nIncome: ₹${income}, Expenses: ₹${expenses}, Emergency Fund: ₹${emergencyFund}, Monthly EMIs: ₹${monthlyEmi}, Categories: ${JSON.stringify(categories)}`
    try {
      const res = await fetch('/api/financial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: context },
            ...messages.filter(m => m.role !== 'system'),
            userMessage
          ]
        })
      })
      const data = await res.json()
      
      // Check if the response indicates expense description
      if (data.reply.toLowerCase().includes('would you like me to convert this to a form')) {
        setPendingExpenseText(userMessage.content)
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = '2.4rem'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  return (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border-b border-gray-200 text-base px-2 pt-2 pb-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg max-w-[80%] break-words ${msg.role === 'user' ? 'bg-primary-100 text-primary-900' : 'bg-gray-200 text-gray-800'}`}>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area docked at the bottom */}
      <form onSubmit={sendMessage} className="flex items-end gap-1 px-2 py-2 bg-white">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInput}
          className="flex-1 rounded border border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-base resize-none min-h-[2.4rem] max-h-28 px-3 py-2"
          placeholder="Type your question..."
          disabled={loading}
          style={{ overflow: 'hidden' }}
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 flex items-center justify-center"
          disabled={loading || !input.trim()}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
      {loading && <div className="text-xs text-gray-500 px-2 pb-1">Finora is thinking...</div>}
    </div>
  )
} 