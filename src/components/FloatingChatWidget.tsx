"use client"

import { useState } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import FinancialChat from './FinancialChat'

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 h-[32rem] bg-white shadow-2xl rounded-xl flex flex-col border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-primary-600 rounded-t-xl" style={{ minHeight: '3rem' }}>
            <span className="text-white font-semibold" style={{ fontSize: '12px' }}>Finora AI Chat</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <FinancialChat />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Chat with Finora
        </button>
      )}
    </div>
  )
}

{/* Mobile styles */}
<style jsx global>{`
  @media (max-width: 640px) {
    .fixed.bottom-6.right-6.w-\[350px\] {
      width: 100vw !important;
      right: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      border-radius: 0.75rem 0.75rem 0 0 !important;
      height: auto !important;
      max-height: 60vh !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .flex-1.flex.flex-col.overflow-y-auto.px-4 {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }
`}</style> 