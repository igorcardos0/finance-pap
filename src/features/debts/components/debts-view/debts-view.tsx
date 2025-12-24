"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, AlertCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFinanceData, type Debt } from "@/hooks/use-finance-data"
import { AddDebtDialog } from "@/features/debts/components/add-debt-dialog"
import { t, useLanguage } from "@/lib/i18n"
import { formatCurrency, formatDate, formatPercentage } from "@/lib/formatters"
import { toast } from "@/lib/toast"

export function DebtsView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null)
  const savedLang = useLanguage()
  const { debts, deleteDebt } = useFinanceData()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [savedLang])

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setDialogOpen(true)
  }

  const handleDelete = (debt: Debt) => {
    setDeletingDebt(debt)
  }

  const confirmDelete = () => {
    if (deletingDebt) {
      const name = deletingDebt.name
      deleteDebt(deletingDebt.id)
      toast.success("Dívida excluída", `${name} foi removida com sucesso.`)
      setDeletingDebt(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingDebt(null)
    }
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const totalPaid = debts.reduce((sum, debt) => sum + debt.paidAmount, 0)
  const totalRemaining = totalDebt - totalPaid

  return (
    <div className="space-y-6">
      <AddDebtDialog open={dialogOpen} onOpenChange={handleDialogClose} debt={editingDebt} />
      <AlertDialog open={!!deletingDebt} onOpenChange={(open) => !open && setDeletingDebt(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir a dívida "{deletingDebt?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dívidas</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Gerencie suas dívidas. Para pagar, crie uma transação normal.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          style={{ backgroundColor: 'var(--theme-primary)' }}
          className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Dívida
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-400 flex items-center gap-2">
              Total de Dívidas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Total de Dívidas</strong> é a soma de todos os valores que você deve, incluindo empréstimos,
                    cartões de crédito e outras obrigações. Este valor representa o montante total que você precisa quitar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-orange-500">
              {formatCurrency(totalDebt)}
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ backgroundColor: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)', borderColor: 'color-mix(in oklch, var(--theme-primary) 30%, transparent)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
              Total Pago
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Total Pago</strong> é a soma de todos os valores que você já quitou das suas dívidas.
                    Este indicador mostra seu progresso no pagamento das obrigações financeiras.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Restante
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Total Restante</strong> é quanto você ainda precisa pagar de todas as suas dívidas.
                    É calculado como: Total de Dívidas - Total Pago. Este é o valor que você deve focar em quitar.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-red-500">
              {formatCurrency(totalRemaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-zinc-500 font-mono">Nenhuma dívida cadastrada</p>
            <p className="text-xs text-zinc-600 mt-2 font-mono">
              Adicione suas dívidas para acompanhar o progresso de pagamento
            </p>
          </div>
        ) : (
          debts.map((debt) => {
            const remaining = debt.totalAmount - debt.paidAmount
            const percentage = (debt.paidAmount / debt.totalAmount) * 100
            const isPaid = remaining <= 0

            return (
              <Card
                key={debt.id}
                className={`bg-zinc-900 border-zinc-800 ${isPaid ? "border" : ""}`}
                style={isPaid ? { borderColor: 'color-mix(in oklch, var(--theme-primary) 30%, transparent)' } : {}}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-zinc-100 flex items-center gap-2">
                        {isPaid && <span style={{ color: 'var(--theme-primary)' }}>✓</span>}
                        {debt.name}
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                          <p className="font-mono text-xs">
                            <strong>Dívida Individual</strong> mostra os detalhes de uma dívida específica, incluindo
                            valor total, quanto já foi pago e quanto ainda falta. A barra de progresso indica o percentual
                            quitado. Use para acompanhar o progresso de cada dívida separadamente.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(debt)}
                            className="h-8 w-8 p-0"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Edit className="w-4 h-4 text-emerald-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(debt)}
                        className="h-8 w-8 p-0 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  {debt.description && (
                    <p className="text-sm text-zinc-400 mt-1">{debt.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Progresso</span>
                      <span className={`font-mono font-semibold ${isPaid ? "" : "text-orange-500"}`} style={isPaid ? { color: 'var(--theme-primary)' } : {}}>
                        {formatPercentage(percentage)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-3 bg-zinc-950"
                      style={isPaid ? { '--progress-indicator-color': 'var(--theme-primary)' } as React.CSSProperties : undefined}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Total:</span>
                      <span className="text-zinc-100 font-mono font-semibold">
                        {formatCurrency(debt.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Pago:</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {formatCurrency(debt.paidAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Restante:</span>
                      <span className={`font-mono font-semibold ${isPaid ? "" : "text-red-400"}`} style={isPaid ? { color: 'var(--theme-primary)' } : {}}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {debt.dueDate && (
                    <div className="pt-3 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Vencimento:</span>
                        <Badge className="bg-zinc-800 text-zinc-300 border-0 font-mono text-xs">
                          {formatDate(debt.dueDate)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {isPaid && (
                    <div className="pt-3">
                      <Badge className="border font-mono text-xs w-full justify-center" style={{ backgroundColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)', color: 'var(--theme-primary)', borderColor: 'color-mix(in oklch, var(--theme-primary) 30%, transparent)' }}>
                        ✓ Dívida Quitada
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

