"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, TrendingDown, Minus, Globe, Loader2 } from "lucide-react"
import { useExchangeRates } from "@/hooks/use-exchange-rates"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { toast } from "@/lib/toast"

export function ExchangeRatesView() {
  const { rates, loading, error, refreshRates, currencies } = useExchangeRates()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshRates()
      toast.success("Cotações atualizadas", "As cotações foram atualizadas com sucesso.")
    } catch (err) {
      toast.error("Erro ao atualizar", "Não foi possível atualizar as cotações.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Globe className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
            Cotações de Moedas
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Cotações em tempo real das principais moedas em relação ao Real (BRL)
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          variant="outline"
          className="border-zinc-800 bg-transparent"
        >
          {loading || isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">
              ⚠️ Erro ao carregar cotações: {error}
            </p>
            <p className="text-red-500 text-xs mt-2">
              Verificando dados em cache...
            </p>
          </CardContent>
        </Card>
      )}

      {rates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span className="font-mono">
              Base: {rates.base} (Real Brasileiro)
            </span>
            <span className="font-mono">
              Última atualização: {formatLastUpdate(rates.lastUpdated)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.rates.map((rate) => {
              const currency = currencies.find((c) => c.code === rate.code)
              const change = rate.change24h || 0
              const isPositive = change > 0
              const isNegative = change < 0

              return (
                <Card
                  key={rate.code}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency?.flag || "💱"}</span>
                        <div>
                          <CardTitle className="text-zinc-100 text-base font-semibold">
                            {rate.code}
                          </CardTitle>
                          <p className="text-xs text-zinc-500 font-mono">
                            {currency?.name || rate.code}
                          </p>
                        </div>
                      </div>
                      {change !== 0 && (
                        <Badge
                          className={`text-xs ${
                            isPositive
                              ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                              : "bg-red-900/30 text-red-400 border-red-800"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(change).toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-500 font-mono">1 {rate.code} =</span>
                        <span
                          className="text-2xl font-mono font-bold"
                          style={{ color: 'var(--theme-primary)' }}
                        >
                          {rate.rate >= 0.01 
                            ? formatNumber(rate.rate, "pt-BR", rate.rate >= 1 ? 2 : 4)
                            : formatNumber(rate.rate, "pt-BR", 8)
                          } BRL
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800">
                        <span className="text-xs text-zinc-500 font-mono">1 BRL =</span>
                        <span className="text-lg font-mono text-zinc-400">
                          {1 / rate.rate >= 0.01
                            ? formatNumber(1 / rate.rate, "pt-BR", 1 / rate.rate >= 1 ? 2 : 4)
                            : formatNumber(1 / rate.rate, "pt-BR", 8)
                          } {rate.code}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {loading && !rates && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-mono text-sm">Carregando cotações...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!rates && !loading && !error && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-500 font-mono text-sm">
              Nenhuma cotação disponível. Clique em "Atualizar" para buscar.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="pt-6">
          <div className="space-y-2 text-xs text-zinc-500 font-mono">
            <p>
              <strong className="text-zinc-400">ℹ️ Informação:</strong> As cotações são atualizadas
              automaticamente a cada hora. Use o botão "Atualizar" para forçar uma atualização
              imediata.
            </p>
            <p>
              <strong className="text-zinc-400">📊 Fonte:</strong> ExchangeRate-API (dados
              aproximados). Para valores precisos, consulte seu banco ou corretora.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

