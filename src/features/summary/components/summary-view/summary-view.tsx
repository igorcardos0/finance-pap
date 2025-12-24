"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Edit, Trash2, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useFinanceData, type Transaction } from "@/hooks/use-finance-data"
import { AddTransactionDialog } from "@/features/transactions/components/add-transaction-dialog"
import { t, useLanguage } from "@/lib/i18n"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { toast } from "@/lib/toast"

export function SummaryView() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const savedLang = useLanguage()
  const { transactions, debts, deleteTransaction } = useFinanceData()

  useEffect(() => {
    setLang(savedLang as "pt" | "en" | "es")

    const handleLanguageChange = () => {
      setLang(savedLang as "pt" | "en" | "es")
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [savedLang])

  // Calculate summary data
  const summary = useMemo(() => {
    // Entradas (Income) - positive transactions OR Income category
    const entradas = transactions
      .filter((t) => t.amount > 0 || t.category === "Income")
      .map((t) => ({
        id: t.id,
        description: t.description,
        amount: Math.abs(t.amount), // Always show as positive for display
        date: t.date,
        category: t.category,
      }))

    const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0)

    // Contas Fixas (Fixed Costs) - recurring expenses (negative amounts, not Income, not Debt)
    const contasFixas = transactions
      .filter((t) => {
        const isExpense = t.amount < 0 || (t.amount > 0 && t.category !== "Income")
        const isFixedCategory =
          t.category === "Fixed" ||
          t.category === "Housing" ||
          t.category === "Food" ||
          t.description.toLowerCase().includes("aluguel") ||
          t.description.toLowerCase().includes("luz") ||
          t.description.toLowerCase().includes("internet") ||
          t.description.toLowerCase().includes("transporte") ||
          t.description.toLowerCase().includes("trybe") ||
          t.tags.some((tag) => tag.toLowerCase().includes("fixa") || tag.toLowerCase().includes("fixed"))
        return isExpense && isFixedCategory && t.category !== "Debt" && t.category !== "Income"
      })
      .map((t) => ({
        id: t.id,
        description: t.description,
        amount: Math.abs(t.amount),
        date: t.date,
        category: t.category,
      }))

    const totalContasFixas = contasFixas.reduce((sum, t) => sum + t.amount, 0)

    // Dívidas (Debts) - agora vem da lista de dívidas, não de transações
    // Mostramos apenas o total devido (não pago ainda)
    const totalDividas = (debts || []).reduce((sum, debt) => sum + (debt.totalAmount - debt.paidAmount), 0)

    // Resto (Remaining) - Entradas - Contas Fixas (dívidas não entram no cálculo mensal)
    const resto = totalEntradas - totalContasFixas

    return {
      entradas,
      totalEntradas,
      contasFixas,
      totalContasFixas,
      totalDividas,
      resto,
    }
  }, [transactions, debts])

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionDialogOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction)
  }

  const confirmDelete = () => {
    if (deletingTransaction) {
      const description = deletingTransaction.description
      deleteTransaction(deletingTransaction.id)
      toast.success("Transação excluída", `${description} foi removida com sucesso.`)
      setDeletingTransaction(null)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setTransactionDialogOpen(open)
    if (!open) {
      setEditingTransaction(null)
    }
  }

  return (
    <div className="space-y-6">
      <AddTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={handleDialogClose}
        transaction={editingTransaction}
      />
      <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir a transação "{deletingTransaction?.description}"? Esta ação não pode ser desfeita.
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
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 font-mono">Resumo Financeiro</h1>
        <p className="text-sm text-zinc-500 font-mono mt-1">Visão consolidada das suas finanças</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-theme-primary/30" style={{ background: 'linear-gradient(to bottom right, color-mix(in oklch, var(--theme-primary) 20%, transparent), color-mix(in oklch, var(--theme-primary) 5%, transparent))' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
              <TrendingUp className="w-4 h-4" />
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
              R$ {summary.totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Contas Fixas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                  <p className="font-mono text-xs">
                    <strong>Contas Fixas</strong> são despesas recorrentes que você precisa pagar todos os meses,
                    como aluguel, internet, luz, água e outras contas regulares. Essas despesas são essenciais
                    e devem ser priorizadas no seu planejamento financeiro.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-rose-500">
              {formatCurrency(summary.totalContasFixas)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-orange-500">
              {formatCurrency(summary.totalDividas)}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${
            summary.resto >= 0
              ? "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30"
              : "from-red-500/20 to-red-500/5 border-red-500/30"
          }`}
        >
          <CardHeader className="pb-2">
                <CardTitle
                  className={`text-sm font-medium flex items-center gap-2 ${
                    summary.resto >= 0 ? "text-cyan-400" : "text-red-400"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Resto
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                      <p className="font-mono text-xs">
                        <strong>Resto</strong> é o dinheiro que sobra após pagar todas as contas fixas.
                        É calculado como: Entradas - Contas Fixas. Este valor pode ser usado para investimentos,
                        pagamento de dívidas ou reserva de emergência. Um valor negativo indica que você está gastando
                        mais do que ganha.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-mono font-bold ${
                summary.resto >= 0 ? "text-cyan-500" : "text-red-500"
              }`}
            >
              {summary.resto < 0 ? "-" : ""}R${" "}
              {Math.abs(summary.resto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            {summary.resto < 0 && (
              <p className="text-xs text-red-400 mt-2 font-mono">⚠️ Saldo negativo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entradas */}
        <Card className="border" style={{ backgroundColor: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)', borderColor: 'color-mix(in oklch, var(--theme-primary) 30%, transparent)' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between" style={{ color: 'var(--theme-primary)' }}>
              <span>Entradas</span>
              <Badge className="border-theme-primary/30" style={{ backgroundColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)', color: 'var(--theme-primary)' }}>
                {summary.entradas.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {summary.entradas.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono text-center py-4">
                Nenhuma entrada registrada
              </p>
            ) : (
              summary.entradas.map((entrada) => {
                const transaction = transactions.find((t) => t.id === entrada.id)
                return (
                  <div
                    key={entrada.id}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-md border group transition-colors"
                    style={{ borderColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 font-medium truncate">{entrada.description}</p>
                      <p className="text-xs text-zinc-400 font-mono">
                        {formatDate(entrada.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-semibold" style={{ color: 'var(--theme-primary)' }}>
                          {formatCurrency(entrada.amount)}
                        </p>
                      </div>
                      {transaction && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-7 w-7 p-0"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit className="w-3.5 h-3.5 text-emerald-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction)}
                            className="h-7 w-7 p-0 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Contas Fixas */}
        <Card className="bg-rose-500/10 border-rose-500/30">
          <CardHeader>
            <CardTitle className="text-rose-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Contas Fixas</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                    <p className="font-mono text-xs">
                      Lista de todas as suas despesas fixas e recorrentes. Essas são as contas que você precisa
                      pagar mensalmente. Manter controle dessas despesas é essencial para um planejamento financeiro eficaz.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                {summary.contasFixas.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {summary.contasFixas.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono text-center py-4">
                Nenhuma conta fixa registrada
              </p>
            ) : (
              summary.contasFixas.map((conta) => {
                const transaction = transactions.find((t) => t.id === conta.id)
                return (
                  <div
                    key={conta.id}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-md border border-rose-500/20 group hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-100 font-medium truncate">{conta.description}</p>
                      <p className="text-xs text-zinc-400 font-mono">
                        {formatDate(conta.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-rose-400 font-mono font-semibold">
                          {formatCurrency(conta.amount)}
                        </p>
                      </div>
                      {transaction && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-7 w-7 p-0"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit className="w-3.5 h-3.5 text-emerald-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction)}
                            className="h-7 w-7 p-0 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Dívidas */}
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center justify-between">
              <span>Dívidas</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {debts?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {!debts || debts.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono text-center py-4">
                Nenhuma dívida cadastrada
              </p>
            ) : (
              (debts || []).map((debt) => {
                const remaining = debt.totalAmount - debt.paidAmount
                const percentage = (debt.paidAmount / debt.totalAmount) * 100
                return (
                  <div
                    key={debt.id}
                    className="p-3 bg-black/30 rounded-md border border-orange-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-zinc-100 font-medium">{debt.name}</p>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                    {debt.description && (
                      <p className="text-xs text-zinc-400 mb-2">{debt.description}</p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Total:</span>
                        <span className="text-orange-400 font-mono">
                          {formatCurrency(debt.totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Pago:</span>
                        <span className="text-emerald-400 font-mono">
                          {formatCurrency(debt.paidAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Restante:</span>
                        <span className="text-red-400 font-mono font-semibold">
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calculation Formula */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">Entradas</span>
              <span className="text-zinc-500">{formatCurrency(summary.totalEntradas)}</span>
            </div>
            <span className="text-zinc-500">-</span>
            <div className="flex items-center gap-2">
              <span className="text-rose-400">Contas Fixas</span>
              <span className="text-zinc-500">{formatCurrency(summary.totalContasFixas)}</span>
            </div>
            <span className="text-zinc-500">-</span>
            <div className="flex items-center gap-2">
              <span className="text-orange-400">Dívidas (não incluídas)</span>
              <span className="text-zinc-500">{formatCurrency(summary.totalDividas)}</span>
            </div>
            <span className="text-zinc-500">=</span>
            <div className="flex items-center gap-2">
              <span className={summary.resto >= 0 ? "text-cyan-400" : "text-red-400"}>Resto</span>
              <span className={summary.resto >= 0 ? "text-cyan-400" : "text-red-400"}>
                {summary.resto < 0 ? "-" : ""}
                {formatCurrency(Math.abs(summary.resto)).replace("R$", "").trim()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

