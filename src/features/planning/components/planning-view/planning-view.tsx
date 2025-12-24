"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Settings, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFinanceData } from "@/hooks/use-finance-data"
import { AddGoalDialog } from "@/features/planning/components/add-goal-dialog"
import { EmergencyFundDialog } from "@/features/planning/components/emergency-fund-dialog"
import { formatCurrency, formatPercentage } from "@/lib/formatters"

export function PlanningView() {
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false)
  const { financialGoals, emergencyFund } = useFinanceData()

  // The component will automatically re-render when emergencyFund changes
  // because it comes from the useFinanceData hook which uses React state

  const emergencyFundPercentage =
    emergencyFund.target > 0 ? (emergencyFund.current / emergencyFund.target) * 100 : 0

  return (
    <div className="space-y-6">
      <AddGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} />
      <EmergencyFundDialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Planning & Goals</h1>
        <Button
          onClick={() => setGoalDialogOpen(true)}
          style={{ backgroundColor: 'var(--theme-primary)' }}
          className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Meta
        </Button>
      </div>

      {/* Emergency Fund */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Emergency Fund
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      <strong>Fundo de Emergência</strong> é uma reserva financeira para cobrir despesas inesperadas
                      ou períodos sem renda. O ideal é ter de 3 a 6 meses de despesas mensais guardados.
                      Este fundo oferece segurança e tranquilidade financeira em momentos difíceis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <p className="text-sm text-zinc-500 font-mono">
                Target: {emergencyFund.monthsOfRunway.toFixed(1)} months of living costs
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmergencyDialogOpen(true)}
              className="border-zinc-800 bg-transparent"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Progress</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--theme-primary)' }}>{formatPercentage(emergencyFundPercentage)}</span>
            </div>
            <Progress value={emergencyFundPercentage} className="h-4 bg-zinc-950" style={{ '--progress-indicator-color': 'var(--theme-primary)' } as React.CSSProperties} />
            <div className="flex items-center justify-between text-xs font-mono">
              <span style={{ color: 'var(--theme-primary)' }}>
                {formatCurrency(emergencyFund.current)}
              </span>
              <span className="text-zinc-500">
                of {formatCurrency(emergencyFund.target)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Remaining</span>
              <span className="font-mono font-semibold text-zinc-100">
                {formatCurrency(emergencyFund.target - emergencyFund.current)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100">Financial Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialGoals.length === 0 ? (
            <div className="col-span-full text-center text-zinc-500 font-mono py-8">
              Nenhuma meta cadastrada
            </div>
          ) : (
            financialGoals.map((goal) => {
            const percentage = (goal.current / goal.target) * 100
            const remaining = goal.target - goal.current
            const daysUntilDeadline = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <Card key={goal.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100 flex items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-base">{goal.name}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                        <p className="font-mono text-xs">
                          <strong>Meta Financeira</strong> é um objetivo específico que você quer alcançar, como comprar
                          um carro ou fazer uma viagem. A barra de progresso mostra quanto você já economizou em relação
                          ao valor alvo. Use metas para manter o foco e motivação nos seus objetivos financeiros.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Progress</span>
                      <span className="font-mono font-semibold" style={{ color: 'var(--theme-accent, var(--accent))' }}>{formatPercentage(percentage)}</span>
                    </div>
                    <Progress value={percentage} className="h-3 bg-zinc-950" style={{ '--progress-indicator-color': 'var(--theme-accent, var(--accent))' } as React.CSSProperties} />
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span style={{ color: 'var(--theme-accent, var(--accent))' }}>{formatCurrency(goal.current)}</span>
                      <span className="text-zinc-500">of {formatCurrency(goal.target)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Remaining</span>
                      <span className="font-mono font-semibold text-zinc-100">{formatCurrency(remaining)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Deadline</span>
                      <Badge className="bg-zinc-800 text-zinc-300 border-0 font-mono text-xs">
                        {daysUntilDeadline} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
          )}
        </div>
      </div>
    </div>
  )
}
