"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Download,
  HelpCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFinanceData } from "@/hooks/use-finance-data"
import { useCategories } from "@/hooks/use-categories"
import { useBudgets } from "@/hooks/use-budgets"
import { t, useLanguage, translateCategoryName } from "@/lib/i18n"
import { formatCurrency, formatPercentage, formatDate } from "@/lib/formatters"
import { exportReportToPDF } from "@/lib/pdf-export"

type Period = "month" | "quarter" | "year" | "all"

export function ReportsView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [period, setPeriod] = useState<Period>("month")
  const savedLang = useLanguage()
  const { transactions } = useFinanceData()
  const { allCategories, getCategory } = useCategories()
  const { budgets } = useBudgets()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [savedLang])

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "all":
        return transactions
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate
    })
  }, [transactions, period])

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>()

    filteredTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income" && t.category !== "Receita")
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0
        categoryMap.set(t.category, current + Math.abs(t.amount))
      })

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => {
        const categoryInfo = getCategory(category)
        const displayName = categoryInfo 
          ? translateCategoryName(categoryInfo.id, lang)
          : category
        return {
          name: category, // Keep original name for internal use
          displayName, // Translated name for display
          amount,
          percentage: 0, // Will calculate after
          color: categoryInfo?.color || "var(--theme-primary)",
          icon: categoryInfo?.icon || "",
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .map((item, index, array) => {
        const total = array.reduce((sum, i) => sum + i.amount, 0)
        return {
          ...item,
          percentage: total > 0 ? (item.amount / total) * 100 : 0,
        }
      })
  }, [filteredTransactions, getCategory, lang])

  // Income vs Expenses trend (monthly)
  const monthlyTrend = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>()

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthData = monthMap.get(monthKey) || { income: 0, expenses: 0 }

      if (t.amount > 0 || t.category === "Income" || t.category === "Receita") {
        monthData.income += Math.abs(t.amount)
      } else {
        monthData.expenses += Math.abs(t.amount)
      }

      monthMap.set(monthKey, monthData)
    })

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: month.split("-")[1] + "/" + month.split("-")[0].slice(-2),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredTransactions])

  // Top expenses
  const topExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income" && t.category !== "Receita")
      .map((t) => ({
        ...t,
        amount: Math.abs(t.amount),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [filteredTransactions])

  // Budget performance
  const budgetPerformance = useMemo(() => {
    return budgets
      .filter((b) => b.spending > 0)
      .map((budget) => ({
        category: budget.categoryName,
        limit: budget.limit,
        spending: budget.spending,
        percentage: budget.percentage,
        remaining: budget.remaining,
        isOverBudget: budget.isOverBudget,
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }, [budgets])

  // Total calculations
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.amount > 0 || t.category === "Income" || t.category === "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expenses = filteredTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income" && t.category !== "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: filteredTransactions.length,
    }
  }, [filteredTransactions])

  // Comparison with previous period
  const comparisonData = useMemo(() => {
    if (period === "all") return null

    const now = new Date()
    let currentStart: Date
    let previousStart: Date
    let previousEnd: Date

    switch (period) {
      case "month":
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        currentStart = new Date(now.getFullYear(), quarter * 3, 1)
        previousStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        previousEnd = new Date(now.getFullYear(), quarter * 3, 0)
        break
      case "year":
        currentStart = new Date(now.getFullYear(), 0, 1)
        previousStart = new Date(now.getFullYear() - 1, 0, 1)
        previousEnd = new Date(now.getFullYear(), 0, 0)
        break
      default:
        return null
    }

    // Current period transactions
    const currentTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= currentStart
    })

    // Previous period transactions
    const previousTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= previousStart && transactionDate <= previousEnd
    })

    // Calculate current period totals
    const currentIncome = currentTransactions
      .filter((t) => t.amount > 0 || t.category === "Income" || t.category === "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const currentExpenses = currentTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income" && t.category !== "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const currentBalance = currentIncome - currentExpenses

    // Calculate previous period totals
    const previousIncome = previousTransactions
      .filter((t) => t.amount > 0 || t.category === "Income" || t.category === "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const previousExpenses = previousTransactions
      .filter((t) => t.amount < 0 && t.category !== "Income" && t.category !== "Receita")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const previousBalance = previousIncome - previousExpenses

    // Calculate changes
    const incomeChange = previousIncome > 0 
      ? ((currentIncome - previousIncome) / previousIncome) * 100 
      : (currentIncome > 0 ? 100 : 0)
    
    const expensesChange = previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : (currentExpenses > 0 ? 100 : 0)
    
    const balanceChange = previousBalance !== 0 
      ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 
      : (currentBalance !== 0 ? (currentBalance > 0 ? 100 : -100) : 0)

    return {
      current: {
        income: currentIncome,
        expenses: currentExpenses,
        balance: currentBalance,
      },
      previous: {
        income: previousIncome,
        expenses: previousExpenses,
        balance: previousBalance,
      },
      incomeChange,
      expensesChange,
      balanceChange,
    }
  }, [transactions, period])

  // Colors for pie chart
  const COLORS = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#a855f7", // violet
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#84cc16", // lime
    "#f97316", // orange
  ]

  const handleExportReport = () => {
    // Export as PDF (opens print dialog)
    exportReportToPDF({
      title: "Relatório Financeiro",
      period: period === "month" ? "Mensal" : period === "quarter" ? "Trimestral" : period === "year" ? "Anual" : "Todos",
      totals,
      expensesByCategory: expensesByCategory.map((cat) => ({
        name: cat.displayName || cat.name,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
      topExpenses: topExpenses.map((t) => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
        category: t.category,
      })),
    })
  }

  const handleExportTXT = () => {
    // Simple text report export
    const report = `
RELATÓRIO FINANCEIRO - ${new Date().toLocaleDateString("pt-BR")}
Período: ${period === "month" ? "Mensal" : period === "quarter" ? "Trimestral" : period === "year" ? "Anual" : "Todos"}

RESUMO:
Receitas: ${formatCurrency(totals.income)}
Despesas: ${formatCurrency(totals.expenses)}
Saldo: ${formatCurrency(totals.balance)}
Total de Transações: ${totals.transactionCount}

DESPESAS POR CATEGORIA:
${expensesByCategory.map((cat) => `- ${cat.displayName || cat.name}: ${formatCurrency(cat.amount)} (${formatPercentage(cat.percentage)})`).join("\n")}

TOP 10 DESPESAS:
${topExpenses.map((t, i) => `${i + 1}. ${t.description}: ${formatCurrency(t.amount)} (${formatDate(t.date)})`).join("\n")}
    `.trim()

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio_financeiro_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 font-mono">Relatórios e Análises</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Análise detalhada das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="border-zinc-800 bg-transparent hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleExportTXT}
              variant="outline"
              className="border-zinc-800 bg-transparent hover:bg-zinc-800"
            >
              <Download className="w-4 h-4 mr-2" />
              TXT
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              Receitas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    Total de <strong>receitas</strong> no período selecionado.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
              {formatCurrency(totals.income)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Despesas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    Total de <strong>despesas</strong> no período selecionado.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-rose-600">
              {formatCurrency(totals.expenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: totals.balance >= 0 ? 'var(--theme-primary)' : '#ef4444' }} />
              Saldo
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Saldo</strong> é a diferença entre receitas e despesas. Um valor positivo indica lucro.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-mono font-bold ${totals.balance >= 0 ? "text-theme-primary" : "text-red-500"}`}
            >
              {formatCurrency(totals.balance)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              Transações
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    Total de <strong>transações</strong> registradas no período.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-zinc-100">
              {totals.transactionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      {comparisonData && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Comparação com Período Anterior</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Comparação</strong> mostra a diferença entre o período atual e o anterior.
                    Use para identificar tendências e avaliar seu progresso financeiro.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Receitas</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-mono font-bold text-zinc-100">
                      {formatCurrency(comparisonData.current.income)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.income)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.incomeChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.incomeChange >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.incomeChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.incomeChange)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Despesas</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-mono font-bold text-rose-400">
                      {formatCurrency(comparisonData.current.expenses)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.expenses)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.expensesChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.expensesChange <= 0 ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.expensesChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.expensesChange)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Saldo</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xl font-mono font-bold ${
                        comparisonData.current.balance >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(comparisonData.current.balance)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.balance)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.balanceChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.balanceChange >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.balanceChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.balanceChange)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Section */}
      {comparisonData && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Comparação com Período Anterior</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Comparação</strong> mostra a diferença entre o período atual e o anterior.
                    Use para identificar tendências e avaliar seu progresso financeiro.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Receitas</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-mono font-bold text-zinc-100">
                      {formatCurrency(comparisonData.current.income)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.income)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.incomeChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.incomeChange >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.incomeChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.incomeChange)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Despesas</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-mono font-bold text-rose-400">
                      {formatCurrency(comparisonData.current.expenses)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.expenses)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.expensesChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.expensesChange <= 0 ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.expensesChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.expensesChange)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">Saldo</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xl font-mono font-bold ${
                        comparisonData.current.balance >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(comparisonData.current.balance)}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Anterior: {formatCurrency(comparisonData.previous.balance)}
                    </p>
                  </div>
                  <div className={`text-right ${comparisonData.balanceChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {comparisonData.balanceChange >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <p className="text-sm font-mono font-semibold">
                      {comparisonData.balanceChange >= 0 ? "+" : ""}
                      {formatPercentage(comparisonData.balanceChange)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category - Pie Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Despesas por Categoria</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Gráfico de Pizza</strong> mostra a distribuição das despesas por categoria.
                    Use para identificar em quais categorias você mais gasta.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ displayName, name, percentage }) => `${displayName || name}: ${formatPercentage(percentage)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color === "var(--theme-primary)"
                            ? "var(--theme-primary)"
                            : entry.color
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-zinc-500 font-mono text-sm">
                Nenhuma despesa no período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category - Bar Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Despesas por Categoria (Barras)</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Gráfico de Barras</strong> mostra os valores absolutos de cada categoria.
                    Facilita a comparação entre diferentes categorias.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="displayName"
                    stroke="#71717a"
                    style={{ fontSize: "12px", fontFamily: "monospace" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: "12px", fontFamily: "monospace" }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--theme-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-zinc-500 font-mono text-sm">
                Nenhuma despesa no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Tendência Mensal</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Tendência Mensal</strong> mostra a evolução de receitas e despesas ao longo dos meses.
                    A linha de saldo indica se você está no positivo ou negativo.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  style={{ fontSize: "12px", fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px", fontFamily: "monospace" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Receitas"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e11d48"
                  strokeWidth={2}
                  name="Despesas"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--theme-primary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Expenses and Budget Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Top 10 Despesas</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    As <strong>10 maiores despesas</strong> do período selecionado.
                    Use para identificar gastos excepcionais.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            {topExpenses.length > 0 ? (
              <div className="space-y-2">
                {topExpenses.map((expense, index) => {
                  const category = getCategory(expense.category)
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 bg-zinc-950 rounded-md border border-zinc-800"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge
                          className="bg-zinc-800 text-zinc-400 border-zinc-700 font-mono text-xs"
                          style={{
                            minWidth: "24px",
                            justifyContent: "center",
                          }}
                        >
                          {index + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-100 font-medium truncate">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-zinc-500 font-mono">{formatDate(expense.date)}</p>
                            <Badge
                              variant="outline"
                              className="text-xs border-zinc-700"
                              style={
                                category?.color === "var(--theme-primary)"
                                  ? {
                                      borderColor: "color-mix(in oklch, var(--theme-primary) 30%, transparent)",
                                      color: "var(--theme-primary)",
                                    }
                                  : category
                                    ? {
                                        borderColor: `color-mix(in oklch, ${category.color} 30%, transparent)`,
                                        color: category.color,
                                      }
                                    : undefined
                              }
                            >
                              {category?.icon && <span className="mr-1">{category.icon}</span>}
                              {expense.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-400 font-mono font-semibold">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 font-mono text-sm">
                Nenhuma despesa no período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Performance */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-theme-primary" />
              <CardTitle className="text-zinc-100">Performance dos Orçamentos</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Performance dos Orçamentos</strong> mostra o uso de cada orçamento configurado.
                    Acompanhe se está dentro ou fora dos limites.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            {budgetPerformance.length > 0 ? (
              <div className="space-y-3">
                {budgetPerformance.map((budget) => (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300 font-medium">{budget.category}</span>
                      <span
                        className={`font-mono font-semibold ${
                          budget.isOverBudget ? "text-red-400" : "text-zinc-400"
                        }`}
                      >
                        {formatPercentage(budget.percentage)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-zinc-500">
                        {formatCurrency(budget.spending)} / {formatCurrency(budget.limit)}
                      </span>
                      {budget.isOverBudget && (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                          Excedido
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 font-mono text-sm">
                Nenhum orçamento configurado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

