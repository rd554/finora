import { create } from 'zustand'

interface FinancialData {
  income: string
  expenses: string
  emergencyFund: string
  monthlyEmi: string
  categories: {
    dining: string
    subscriptions: string
    groceries: string
    transport: string
  }
}

interface AnalysisResult {
  analysis: string
  loading: boolean
  error: string | null
}

interface StoreState extends FinancialData {
  analysis: AnalysisResult
  setFinancialData: (data: Partial<FinancialData>) => void
  analyzeFinancialData: () => Promise<void>
  resetAnalysis: () => void
  manualEntryText: string
  setManualEntryText: (text: string) => void
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  income: '',
  expenses: '',
  emergencyFund: '',
  monthlyEmi: '',
  categories: {
    dining: '',
    subscriptions: '',
    groceries: '',
    transport: '',
  },
  analysis: {
    analysis: '',
    loading: false,
    error: null,
  },
  manualEntryText: '',

  // Actions
  setFinancialData: (data) => set((state) => ({ ...state, ...data })),

  analyzeFinancialData: async () => {
    set((state) => ({
      analysis: { ...state.analysis, loading: true, error: null },
    }))

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income: get().income,
          expenses: get().expenses,
          emergencyFund: get().emergencyFund,
          monthlyEmi: get().monthlyEmi,
          categories: get().categories,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze financial data')
      }

      const data = await response.json()
      set((state) => ({
        analysis: {
          analysis: data.analysis,
          loading: false,
          error: null,
        },
      }))
    } catch (error) {
      set((state) => ({
        analysis: {
          ...state.analysis,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        },
      }))
    }
  },

  resetAnalysis: () =>
    set((state) => ({
      analysis: {
        analysis: '',
        loading: false,
        error: null,
      },
    })),

  setManualEntryText: (text: string) => set({ manualEntryText: text }),
})) 