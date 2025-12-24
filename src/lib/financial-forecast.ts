/**
 * Financial forecasting and trend analysis utilities
 */

import { Transaction } from "@/hooks/use-finance-data"

export interface ForecastData {
  month: string
  predictedIncome: number
  predictedExpenses: number
  predictedBalance: number
  confidence: number // 0-100
}

export interface TrendAnalysis {
  incomeTrend: "increasing" | "decreasing" | "stable"
  expensesTrend: "increasing" | "decreasing" | "stable"
  balanceTrend: "improving" | "worsening" | "stable"
  incomeGrowthRate: number // percentage
  expensesGrowthRate: number // percentage
  predictedRunway: number // months
}

/**
 * Calculate financial forecast for next N months
 */
export function calculateForecast(
  transactions: Transaction[],
  monthsAhead: number = 6
): ForecastData[] {
  const now = new Date()
  const forecasts: ForecastData[] = []

  // Get last 6 months of data for trend analysis
  const last6Months: { [key: string]: { income: number; expenses: number } } = {}
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    last6Months[monthKey] = { income: 0, expenses: 0 }
  }

  transactions.forEach((t) => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    
    if (last6Months[monthKey]) {
      if (t.amount > 0 || t.category === "Income") {
        last6Months[monthKey].income += Math.abs(t.amount)
      } else {
        last6Months[monthKey].expenses += Math.abs(t.amount)
      }
    }
  })

  // Calculate averages and trends
  const monthlyIncomes = Object.values(last6Months).map((m) => m.income)
  const monthlyExpenses = Object.values(last6Months).map((m) => m.expenses)

  const avgIncome = monthlyIncomes.reduce((sum, val) => sum + val, 0) / monthlyIncomes.length
  const avgExpenses = monthlyExpenses.reduce((sum, val) => sum + val, 0) / monthlyExpenses.length

  // Simple linear regression for trend
  const incomeTrend = calculateTrend(monthlyIncomes)
  const expensesTrend = calculateTrend(monthlyExpenses)

  // Generate forecasts
  for (let i = 1; i <= monthsAhead; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`

    // Predict based on trend
    const predictedIncome = Math.max(0, avgIncome + incomeTrend * i)
    const predictedExpenses = Math.max(0, avgExpenses + expensesTrend * i)
    const predictedBalance = predictedIncome - predictedExpenses

    // Confidence decreases over time
    const confidence = Math.max(20, 100 - i * 10)

    forecasts.push({
      month: monthKey,
      predictedIncome,
      predictedExpenses,
      predictedBalance,
      confidence,
    })
  }

  return forecasts
}

/**
 * Calculate trend (slope) from data points
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0

  const n = values.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  values.forEach((value, index) => {
    const x = index + 1
    sumX += x
    sumY += value
    sumXY += x * value
    sumX2 += x * x
  })

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope
}

/**
 * Analyze financial trends
 */
export function analyzeTrends(transactions: Transaction[]): TrendAnalysis {
  const now = new Date()
  const last6Months: { [key: string]: { income: number; expenses: number; balance: number } } = {}

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    last6Months[monthKey] = { income: 0, expenses: 0, balance: 0 }
  }

  transactions.forEach((t) => {
    const date = new Date(t.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (last6Months[monthKey]) {
      if (t.amount > 0 || t.category === "Income") {
        last6Months[monthKey].income += Math.abs(t.amount)
      } else {
        last6Months[monthKey].expenses += Math.abs(t.amount)
      }
      last6Months[monthKey].balance = last6Months[monthKey].income - last6Months[monthKey].expenses
    }
  })

  const monthlyData = Object.values(last6Months)
  const incomes = monthlyData.map((m) => m.income)
  const expenses = monthlyData.map((m) => m.expenses)
  const balances = monthlyData.map((m) => m.balance)

  const incomeTrend = calculateTrend(incomes)
  const expensesTrend = calculateTrend(expenses)
  const balanceTrend = calculateTrend(balances)

  // Calculate growth rates
  const firstHalfIncome = incomes.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3
  const secondHalfIncome = incomes.slice(3).reduce((sum, val) => sum + val, 0) / 3
  const incomeGrowthRate = firstHalfIncome > 0 ? ((secondHalfIncome - firstHalfIncome) / firstHalfIncome) * 100 : 0

  const firstHalfExpenses = expenses.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3
  const secondHalfExpenses = expenses.slice(3).reduce((sum, val) => sum + val, 0) / 3
  const expensesGrowthRate = firstHalfExpenses > 0 ? ((secondHalfExpenses - firstHalfExpenses) / firstHalfExpenses) * 100 : 0

  // Predict runway (months until balance reaches zero)
  const avgMonthlyBurn = expenses.reduce((sum, val) => sum + val, 0) / expenses.length
  const currentBalance = balances[balances.length - 1]
  const predictedRunway = avgMonthlyBurn > 0 ? currentBalance / avgMonthlyBurn : 0

  return {
    incomeTrend: incomeTrend > 100 ? "increasing" : incomeTrend < -100 ? "decreasing" : "stable",
    expensesTrend: expensesTrend > 100 ? "increasing" : expensesTrend < -100 ? "decreasing" : "stable",
    balanceTrend: balanceTrend > 0 ? "improving" : balanceTrend < 0 ? "worsening" : "stable",
    incomeGrowthRate,
    expensesGrowthRate,
    predictedRunway: Math.max(0, predictedRunway),
  }
}

