"use client"

import { useMemo } from "react"
import { useFinanceData } from "@/hooks/use-finance-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface DayData {
  date: Date
  count: number
  value: number
}

export function CommitHeatmap() {
  const { transactions } = useFinanceData()

  const heatmapData = useMemo(() => {
    const data: DayData[] = []
    const now = new Date()
    
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      // Count transactions for this day
      const dayTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        tDate.setHours(0, 0, 0, 0)
        return tDate.getTime() === date.getTime()
      })
      
      const count = dayTransactions.length
      const value = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      data.push({ date, count, value })
    }
    
    return data
  }, [transactions])

  const maxValue = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.value), 1)
  }, [heatmapData])

  const getIntensity = (value: number) => {
    if (value === 0) return 0
    const ratio = value / maxValue
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    return 4
  }

  const getColor = (intensity: number) => {
    const colors = [
      "bg-zinc-800", // 0 - no activity
      "bg-zinc-700", // 1 - low
      "bg-zinc-600", // 2 - medium-low
      "bg-zinc-500", // 3 - medium
      "bg-zinc-400", // 4 - high
    ]
    return colors[intensity] || colors[0]
  }

  // Group by weeks
  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []
  
  heatmapData.forEach((day, index) => {
    if (index % 7 === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  })
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "short",
      year: "numeric"
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => {
              const intensity = getIntensity(day.value)
              const color = getColor(intensity)
              
              return (
                <Tooltip key={`${weekIndex}-${dayIndex}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 rounded-sm ${color} hover:ring-2 hover:ring-zinc-500 cursor-pointer transition-all`}
                      style={{
                        backgroundColor: intensity === 0 
                          ? undefined 
                          : `color-mix(in oklch, var(--theme-primary) ${intensity * 20}%, #27272a)`
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{formatDate(day.date)}</p>
                      <p>Transações: {day.count}</p>
                      {day.value > 0 && (
                        <p>Valor: {formatCurrency(day.value)}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-zinc-500 font-mono">
        <span>Menos</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-zinc-800" />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--theme-primary) 20%, #27272a)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--theme-primary) 40%, #27272a)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--theme-primary) 60%, #27272a)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "color-mix(in oklch, var(--theme-primary) 80%, #27272a)" }} />
        </div>
        <span>Mais</span>
      </div>
    </div>
  )
}

