"use client"

import { useState, useEffect } from "react"

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  tags: string[]
  account: string
  amount: number
}

export interface CreditCard {
  id: string
  name: string
  limit: number
  used: number
  closingDay: number
  bestDay: number
  color: string
}

export interface FinancialGoal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  icon: string
}

export interface EmergencyFund {
  target: number
  current: number
  monthsOfRunway: number
}

export interface Debt {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  description?: string
  dueDate?: string
}

const STORAGE_KEYS = {
  transactions: "devfinance_transactions",
  creditCards: "devfinance_credit_cards",
  financialGoals: "devfinance_financial_goals",
  emergencyFund: "devfinance_emergency_fund",
  debts: "devfinance_debts",
}

export function useFinanceData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>({
    target: 0,
    current: 0,
    monthsOfRunway: 0,
  })

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadTransactions = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.transactions)
      if (stored) {
        try {
          const loaded = JSON.parse(stored)
          // Migrate old transactions: ensure Income is positive, others are negative
          const migrated = loaded.map((t: Transaction) => {
            if (t.category === "Income") {
              // Income should always be positive
              return { ...t, amount: Math.abs(t.amount) }
            } else {
              // Expenses should always be negative
              return { ...t, amount: t.amount > 0 ? -Math.abs(t.amount) : t.amount }
            }
          })
          setTransactions(migrated)
          // Save migrated data back
          if (JSON.stringify(loaded) !== JSON.stringify(migrated)) {
            localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(migrated))
          }
        } catch (e) {
          console.error("Error loading transactions:", e)
        }
      }
    }

    const loadCreditCards = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.creditCards)
      if (stored) {
        try {
          setCreditCards(JSON.parse(stored))
        } catch (e) {
          console.error("Error loading credit cards:", e)
        }
      }
    }

    const loadFinancialGoals = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.financialGoals)
      if (stored) {
        try {
          setFinancialGoals(JSON.parse(stored))
        } catch (e) {
          console.error("Error loading financial goals:", e)
        }
      }
    }

    const loadEmergencyFund = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.emergencyFund)
      if (stored) {
        try {
          setEmergencyFund(JSON.parse(stored))
        } catch (e) {
          console.error("Error loading emergency fund:", e)
        }
      }
    }

    const loadDebts = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.debts)
      if (stored) {
        try {
          setDebts(JSON.parse(stored))
        } catch (e) {
          console.error("Error loading debts:", e)
        }
      }
    }

    loadTransactions()
    loadCreditCards()
    loadFinancialGoals()
    loadEmergencyFund()
    loadDebts()
  }, [])

  // Save transactions
  const addTransaction = (transaction: Omit<Transaction, "id">, linkedDebtId?: string) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    const updated = [...transactions, newTransaction]
    setTransactions(updated)
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
    
    // If linked to a debt, update the debt (only for expenses)
    if (linkedDebtId && transaction.amount < 0 && debts) {
      const debt = debts.find((d) => d.id === linkedDebtId)
      if (debt) {
        const paymentAmount = Math.abs(transaction.amount)
        const newPaidAmount = Math.min(debt.paidAmount + paymentAmount, debt.totalAmount)
        const updatedDebts = debts.map((d) =>
          d.id === linkedDebtId ? { ...d, paidAmount: newPaidAmount } : d,
        )
        setDebts(updatedDebts)
        localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(updatedDebts))
      }
    }
    
    window.dispatchEvent(new Event("financeDataChange"))
    return newTransaction.id
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    setTransactions(updated)
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id)
    setTransactions(updated)
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  // Save credit cards
  const addCreditCard = (card: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(),
    }
    const updated = [...creditCards, newCard]
    setCreditCards(updated)
    localStorage.setItem(STORAGE_KEYS.creditCards, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    const updated = creditCards.map((card) =>
      card.id === id ? { ...card, ...updates } : card,
    )
    setCreditCards(updated)
    localStorage.setItem(STORAGE_KEYS.creditCards, JSON.stringify(updated))
  }

  const deleteCreditCard = (id: string) => {
    const updated = creditCards.filter((card) => card.id !== id)
    setCreditCards(updated)
    localStorage.setItem(STORAGE_KEYS.creditCards, JSON.stringify(updated))
  }

  // Save financial goals
  const addFinancialGoal = (goal: Omit<FinancialGoal, "id">) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Date.now().toString(),
    }
    const updated = [...financialGoals, newGoal]
    setFinancialGoals(updated)
    localStorage.setItem(STORAGE_KEYS.financialGoals, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  const updateFinancialGoal = (id: string, updates: Partial<FinancialGoal>) => {
    const updated = financialGoals.map((goal) =>
      goal.id === id ? { ...goal, ...updates } : goal,
    )
    setFinancialGoals(updated)
    localStorage.setItem(STORAGE_KEYS.financialGoals, JSON.stringify(updated))
  }

  const deleteFinancialGoal = (id: string) => {
    const updated = financialGoals.filter((goal) => goal.id !== id)
    setFinancialGoals(updated)
    localStorage.setItem(STORAGE_KEYS.financialGoals, JSON.stringify(updated))
  }

  // Save emergency fund
  const updateEmergencyFund = (fund: EmergencyFund) => {
    setEmergencyFund(fund)
    localStorage.setItem(STORAGE_KEYS.emergencyFund, JSON.stringify(fund))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  // Save debts
  const addDebt = (debt: Omit<Debt, "id">) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
      paidAmount: debt.paidAmount || 0,
    }
    const updated = [...debts, newDebt]
    setDebts(updated)
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    const updated = debts.map((debt) => (debt.id === id ? { ...debt, ...updates } : debt))
    setDebts(updated)
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  const deleteDebt = (id: string) => {
    const updated = debts.filter((debt) => debt.id !== id)
    setDebts(updated)
    localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(updated))
    window.dispatchEvent(new Event("financeDataChange"))
  }

  // Update debt when transaction is linked
  const linkTransactionToDebt = (transactionId: string, debtId: string, amount: number) => {
    const debt = debts.find((d) => d.id === debtId)
    if (debt) {
      // Only update if transaction is negative (expense)
      const paymentAmount = Math.abs(amount)
      const newPaidAmount = Math.min(debt.paidAmount + paymentAmount, debt.totalAmount)
      updateDebt(debtId, { paidAmount: newPaidAmount })
    }
  }

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate revenue and expenses for current month
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Revenue: only positive amounts OR Income category (even if somehow negative)
    const revenue = currentMonthTransactions
      .filter((t) => t.amount > 0 || t.category === "Income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Expenses: only negative amounts AND not Income category
    const expenses = currentMonthTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Calculate total revenue and expenses for last 12 months
    const last12Months: { month: string; revenue: number; expenses: number }[] = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === month && tDate.getFullYear() === year
      })

      // Revenue: only positive amounts OR Income category
      const monthRevenue = monthTransactions
        .filter((t) => t.amount > 0 || t.category === "Income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      // Expenses: only negative amounts AND not Income category
      const monthExpenses = monthTransactions
        .filter((t) => t.amount < 0 && t.category !== "Income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      last12Months.push({
        month: monthNames[month],
        revenue: monthRevenue,
        expenses: monthExpenses,
      })
    }

    // Calculate net worth: sum of all transactions (positive = income, negative = expenses)
    // Ensure Income is always positive and expenses are always negative
    const netWorth = transactions.reduce((sum, t) => {
      if (t.category === "Income") {
        return sum + Math.abs(t.amount) // Income always adds
      } else {
        return sum + (t.amount < 0 ? t.amount : -Math.abs(t.amount)) // Expenses always subtract
      }
    }, 0)

    // Calculate runway (months of survival based on current balance and monthly burn)
    const monthlyBurn = expenses || 1 // Avoid division by zero
    const runway = netWorth > 0 ? netWorth / monthlyBurn : 0

    return {
      revenue,
      expenses,
      netWorth,
      runway,
      monthlyData: last12Months,
    }
  }

  // Import data (merge or replace)
  const importData = (
    data: {
      transactions?: Transaction[]
      creditCards?: CreditCard[]
      financialGoals?: FinancialGoal[]
      debts?: Debt[]
      emergencyFund?: EmergencyFund
    },
    mode: "merge" | "replace" = "merge"
  ) => {
    if (mode === "replace") {
      // Replace all data
      if (data.transactions) {
        setTransactions(data.transactions)
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data.transactions))
      }
      if (data.creditCards) {
        setCreditCards(data.creditCards)
        localStorage.setItem(STORAGE_KEYS.creditCards, JSON.stringify(data.creditCards))
      }
      if (data.financialGoals) {
        setFinancialGoals(data.financialGoals)
        localStorage.setItem(STORAGE_KEYS.financialGoals, JSON.stringify(data.financialGoals))
      }
      if (data.debts) {
        setDebts(data.debts)
        localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(data.debts))
      }
      if (data.emergencyFund) {
        setEmergencyFund(data.emergencyFund)
        localStorage.setItem(STORAGE_KEYS.emergencyFund, JSON.stringify(data.emergencyFund))
      }
    } else {
      // Merge data (add new items, keep existing)
      if (data.transactions) {
        const merged = [...transactions, ...data.transactions]
        setTransactions(merged)
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(merged))
      }
      if (data.creditCards) {
        const merged = [...creditCards, ...data.creditCards]
        setCreditCards(merged)
        localStorage.setItem(STORAGE_KEYS.creditCards, JSON.stringify(merged))
      }
      if (data.financialGoals) {
        const merged = [...financialGoals, ...data.financialGoals]
        setFinancialGoals(merged)
        localStorage.setItem(STORAGE_KEYS.financialGoals, JSON.stringify(merged))
      }
      if (data.debts) {
        const merged = [...debts, ...data.debts]
        setDebts(merged)
        localStorage.setItem(STORAGE_KEYS.debts, JSON.stringify(merged))
      }
      if (data.emergencyFund) {
        setEmergencyFund(data.emergencyFund)
        localStorage.setItem(STORAGE_KEYS.emergencyFund, JSON.stringify(data.emergencyFund))
      }
    }
    
    window.dispatchEvent(new Event("financeDataChange"))
  }

  return {
    transactions,
    creditCards,
    financialGoals,
    debts,
    emergencyFund,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    addDebt,
    updateDebt,
    deleteDebt,
    linkTransactionToDebt,
    updateEmergencyFund,
    calculateDashboardMetrics,
    importData,
  }
}

