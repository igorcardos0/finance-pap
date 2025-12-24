/**
 * Hook for managing budgets and spending limits by category
 */

import { useLocalStorage } from "./use-local-storage"
import { useFinanceData } from "./use-finance-data"
import { useMemo } from "react"

export interface Budget {
  id: string
  categoryName: string
  limit: number
  period: "monthly" | "yearly"
  alertThreshold: number // Percentage (0-100) to alert when reached
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "devfinance_budgets"

export function useBudgets() {
  const [budgets, setBudgets] = useLocalStorage<Budget[]>(STORAGE_KEY, [])
  const { transactions } = useFinanceData()

  // Calculate spending for each budget
  const budgetsWithSpending = useMemo(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    return budgets.map((budget) => {
      // Filter transactions by category and period
      const relevantTransactions = transactions.filter((t) => {
        if (t.category !== budget.categoryName) return false

        const transactionDate = new Date(t.date)
        if (budget.period === "monthly") {
          return (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          )
        } else {
          // yearly
          return transactionDate.getFullYear() === currentYear
        }
      })

      // Calculate total spending (only expenses, negative amounts)
      const spending = relevantTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const percentage = budget.limit > 0 ? (spending / budget.limit) * 100 : 0
      const remaining = budget.limit - spending
      const isOverBudget = spending > budget.limit
      const shouldAlert = percentage >= budget.alertThreshold

      return {
        ...budget,
        spending,
        percentage,
        remaining,
        isOverBudget,
        shouldAlert,
        transactionCount: relevantTransactions.length,
      }
    })
  }, [budgets, transactions])

  // Add budget
  const addBudget = (budget: Omit<Budget, "id" | "createdAt" | "updatedAt">) => {
    const newBudget: Budget = {
      ...budget,
      id: `budget_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBudgets([...budgets, newBudget])
    return newBudget.id
  }

  // Update budget
  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(
      budgets.map((budget) =>
        budget.id === id
          ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
          : budget
      )
    )
  }

  // Delete budget
  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== id))
  }

  // Get budget by category
  const getBudgetByCategory = (categoryName: string) => {
    return budgetsWithSpending.find((b) => b.categoryName === categoryName)
  }

  // Get budgets that need attention (over budget or near limit)
  const getBudgetsNeedingAttention = () => {
    return budgetsWithSpending.filter((b) => b.isOverBudget || b.shouldAlert)
  }

  // Calculate budget progress for a specific budget and period
  const calculateBudgetProgress = (budgetId: string, period: "month" | "quarter" | "year" | "all") => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (!budget) {
      return { spent: 0, limit: 0, percentage: 0 }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case "month":
        startDate = new Date(currentYear, currentMonth, 1)
        break
      case "quarter":
        const quarter = Math.floor(currentMonth / 3)
        startDate = new Date(currentYear, quarter * 3, 1)
        break
      case "year":
        startDate = new Date(currentYear, 0, 1)
        break
      default:
        startDate = new Date(0) // All time
    }

    const relevantTransactions = transactions.filter((t) => {
      if (t.category !== budget.categoryName) return false
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    const spent = relevantTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0

    return { spent, limit: budget.limit, percentage }
  }

  return {
    budgets: budgetsWithSpending,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategory,
    getBudgetsNeedingAttention,
    calculateBudgetProgress,
  }
}

