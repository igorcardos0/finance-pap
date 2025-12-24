"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Flame, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts"
import { CommitHeatmap } from "@/components/commit-heatmap"
import { ConsoleLogs } from "@/components/console-logs"
import { t, useLanguage } from "@/lib/i18n"
import { useFinanceData } from "@/hooks/use-finance-data"
import { formatCurrency, formatPercentage } from "@/lib/formatters"

export function DashboardView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [refreshKey, setRefreshKey] = useState(0)
  const savedLang = useLanguage()
  const financeData = useFinanceData()
  const metrics = financeData.calculateDashboardMetrics()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    const handleDataChange = () => {
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener("languageChange", handleLanguageChange)
    window.addEventListener("financeDataChange", handleDataChange)

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange)
      window.removeEventListener("financeDataChange", handleDataChange)
    }
  }, [savedLang])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{t("dashboard.runway", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Runway</strong> representa quantos meses você consegue sobreviver com seu dinheiro atual,
                    considerando suas despesas mensais. É calculado dividindo seu patrimônio líquido pelas despesas médias mensais.
                    Quanto maior, mais segurança financeira você tem.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <DollarSign className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
              {metrics.runway.toFixed(1)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-mono">{t("dashboard.runway.months", lang)}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{t("dashboard.networth", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Patrimônio Líquido</strong> é a diferença entre seus ativos (dinheiro, investimentos) e passivos (dívidas).
                    Representa o valor real do que você possui. É um dos indicadores mais importantes da sua saúde financeira.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-zinc-100">
              {formatCurrency(metrics.netWorth)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 font-mono">{t("dashboard.vs.year", lang)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{t("dashboard.revenue", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Receita</strong> é o total de dinheiro que entra na sua conta, incluindo salários, freelances e outras fontes de renda.
                    Acompanhar sua receita ajuda a entender sua capacidade de gerar dinheiro e planejar melhor seus gastos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
              {formatCurrency(metrics.revenue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 font-mono">{t("dashboard.vs.last", lang)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{t("dashboard.burn", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Burn Rate</strong> (Taxa de Queima) representa o total de despesas mensais.
                    Mostra quanto dinheiro você está gastando por mês. É importante manter esse valor abaixo da sua receita
                    para garantir que você está vivendo dentro das suas possibilidades.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Flame className="w-4 h-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-rose-600">
              {formatCurrency(metrics.expenses)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 font-mono">{t("dashboard.spending.alert", lang)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-zinc-100">{t("dashboard.chart.title", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Gráfico de Receitas vs Despesas</strong> mostra a evolução mensal do seu fluxo de caixa.
                    A área verde representa suas receitas e a vermelha suas despesas. Use este gráfico para identificar
                    padrões, meses com mais gastos e avaliar se está conseguindo manter um saldo positivo.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-zinc-500 font-mono">{t("dashboard.chart.subtitle", lang)}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" style={{ fontSize: "12px", fontFamily: "monospace" }} />
                <YAxis stroke="#71717a" style={{ fontSize: "12px", fontFamily: "monospace" }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#e11d48" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commit Heatmap */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-zinc-100">{t("dashboard.heatmap", lang)}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Heatmap de Atividade Financeira</strong> mostra visualmente seus padrões de gastos ao longo do tempo.
                    Cada quadrado representa um dia, e a intensidade da cor indica o nível de atividade financeira.
                    Use para identificar dias da semana ou períodos com mais movimentação financeira.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-zinc-500 font-mono">{t("dashboard.daily", lang)}</p>
          </CardHeader>
          <CardContent>
            <CommitHeatmap />
          </CardContent>
        </Card>
      </div>

      {/* Console Logs Widget */}
      <ConsoleLogs />
    </div>
  )
}
