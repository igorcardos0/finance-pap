"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFinanceData } from "@/hooks/use-finance-data"
import { AddCreditCardDialog } from "@/features/credit-cards/components/add-credit-card-dialog"
import { formatCurrency, formatPercentage } from "@/lib/formatters"

export function CreditCardsView() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { creditCards } = useFinanceData()
  const totalAvailable = creditCards.reduce(
    (sum, card) => sum + (card.limit - card.used),
    0,
  )

  return (
    <div className="space-y-6">
      <AddCreditCardDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Credit Cards & Debt</h1>
        {creditCards.length > 0 && (
          <Badge className="border-0 font-mono" style={{ backgroundColor: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)', color: 'var(--theme-primary)' }}>
            Total Available: {formatCurrency(totalAvailable)}
          </Badge>
        )}
        <Button
          onClick={() => setDialogOpen(true)}
                style={{ backgroundColor: 'var(--theme-primary)' }}
                className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cartão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.length === 0 ? (
          <div className="col-span-full text-center text-zinc-500 font-mono py-8">
            Nenhum cartão cadastrado
          </div>
        ) : (
          creditCards.map((card) => {
          const percentage = (card.used / card.limit) * 100
          const isHighUsage = percentage > 70

          return (
            <Card key={card.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                      {card.name}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                        <p className="font-mono text-xs">
                          <strong>Cartão de Crédito</strong> mostra o limite total, quanto você já utilizou e quanto ainda está disponível.
                          A barra de progresso indica o uso do limite. Mantenha o uso abaixo de 70% para evitar problemas.
                          O "Melhor Dia" é quando você deve fazer compras para ter mais dias até o vencimento da fatura.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Limit Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Limit Usage</span>
                    <span className={`font-mono font-semibold ${isHighUsage ? "text-rose-600" : ""}`} style={!isHighUsage ? { color: 'var(--theme-primary)' } : {}}>
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-3 bg-zinc-950"
                    style={!isHighUsage ? { '--progress-indicator-color': 'var(--theme-primary)' } as React.CSSProperties : undefined}
                  />
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={isHighUsage ? "text-rose-600" : "text-emerald-500"}>
                      {formatCurrency(card.used)}
                    </span>
                    <span className="text-zinc-500">of {formatCurrency(card.limit)}</span>
                  </div>
                </div>

                {/* Available */}
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Available</span>
                    <span className="font-mono font-semibold text-zinc-100">
                      {formatCurrency(card.limit - card.used)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Closing Day</p>
                    <p className="font-mono font-semibold text-zinc-100">{card.closingDay}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Best Day</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--theme-primary)' }}>{card.bestDay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
        )}
      </div>
    </div>
  )
}
