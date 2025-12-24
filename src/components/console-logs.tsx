"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, X, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency } from "@/lib/formatters"

interface LogEntry {
  id: string
  timestamp: Date
  type: "info" | "success" | "warning" | "error"
  message: string
}

export function ConsoleLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const { transactions, calculateDashboardMetrics } = useFinanceData()

  useEffect(() => {
    // Generate logs based on financial data
    const generateLogs = () => {
      const newLogs: LogEntry[] = []
      const metrics = calculateDashboardMetrics()
      const now = new Date()

    // Recent transactions log
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    recentTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const isRecent = now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      
      if (isRecent) {
        newLogs.push({
          id: `tx-${transaction.id}`,
          timestamp: date,
          type: transaction.amount > 0 ? "success" : "info",
          message: `${transaction.amount > 0 ? "Receita" : "Despesa"}: ${transaction.description} - ${formatCurrency(Math.abs(transaction.amount))}`,
        })
      }
    })

    // Metrics logs
    if (metrics.runway < 3) {
      newLogs.push({
        id: `warning-runway-${now.getTime()}`,
        timestamp: now,
        type: "warning",
        message: `⚠️ Runway baixo: ${metrics.runway.toFixed(1)} meses restantes`,
      })
    }

    if (metrics.expenses > metrics.revenue) {
      newLogs.push({
        id: `warning-expenses-${now.getTime()}`,
        timestamp: now,
        type: "warning",
        message: `⚠️ Despesas (${formatCurrency(metrics.expenses)}) excedem receitas (${formatCurrency(metrics.revenue)})`,
      })
    } else if (metrics.revenue > 0) {
      newLogs.push({
        id: `success-balance-${now.getTime()}`,
        timestamp: now,
        type: "success",
        message: `✓ Saldo positivo: ${formatCurrency(metrics.revenue - metrics.expenses)} este mês`,
      })
    }

    // System status
    newLogs.push({
      id: `info-status-${now.getTime()}`,
      timestamp: now,
      type: "info",
      message: `📊 Sistema operacional - ${transactions.length} transações registradas`,
    })

    // Sort by timestamp (newest first)
    newLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setLogs(newLogs.slice(0, 10)) // Keep only last 10 logs
    }

    generateLogs()

    // Update logs when data changes
    const handleDataChange = () => {
      generateLogs()
    }

    window.addEventListener("financeDataChange", handleDataChange)
    return () => {
      window.removeEventListener("financeDataChange", handleDataChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length]) // Only depend on transactions.length to avoid infinite loops


  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-zinc-400"
    }
  }

  const getLogPrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✓"
      case "warning":
        return "⚠"
      case "error":
        return "✗"
      default:
        return "ℹ"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (isMinimized) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <CardTitle className="text-sm font-mono text-zinc-400">Console Logs</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <CardTitle className="text-sm font-mono text-zinc-400">Console Logs</CardTitle>
            <span className="text-xs text-zinc-600 font-mono">({logs.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogs([])}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          <div className="space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-zinc-600 text-center py-4">
                Nenhum log disponível
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-zinc-600 flex-shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <span className={`flex-shrink-0 ${getLogColor(log.type)}`}>
                    {getLogPrefix(log.type)}
                  </span>
                  <span className={`flex-1 ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

