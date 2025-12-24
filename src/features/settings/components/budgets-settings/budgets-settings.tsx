"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, AlertCircle, Target, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useBudgets, type Budget } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "@/lib/toast"
import { useLanguage, translateCategoryName } from "@/lib/i18n"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { formatCurrency, formatPercentage } from "@/lib/formatters"

const budgetSchema = z.object({
  categoryName: z.string().min(1, "Categoria é obrigatória"),
  limit: z.string().min(1, "Limite é obrigatório").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Limite deve ser um número positivo"
  ),
  period: z.enum(["monthly", "yearly"], { required_error: "Período é obrigatório" }),
  alertThreshold: z.string().min(1, "Limite de alerta é obrigatório").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100,
    "Limite de alerta deve ser entre 0 e 100"
  ),
})

type BudgetFormData = z.infer<typeof budgetSchema>

export function BudgetsSettings() {
  const { budgets, addBudget, updateBudget, deleteBudget, getBudgetsNeedingAttention } = useBudgets()
  const { allCategories, getCategoriesByType, getCategory } = useCategories()
  const lang = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)

  const expenseCategories = getCategoriesByType("expense")
  const budgetsNeedingAttention = getBudgetsNeedingAttention()

  // Helper function to get translated category name
  const getTranslatedCategoryName = (categoryName: string) => {
    const category = getCategory(categoryName)
    return category ? translateCategoryName(category.id, lang) : categoryName
  }

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryName: "",
      limit: "",
      period: "monthly",
      alertThreshold: "80",
    },
  })

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget)
      form.reset({
        categoryName: budget.categoryName,
        limit: budget.limit.toString(),
        period: budget.period,
        alertThreshold: budget.alertThreshold.toString(),
      })
    } else {
      setEditingBudget(null)
      form.reset({
        categoryName: "",
        limit: "",
        period: "monthly",
        alertThreshold: "80",
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingBudget(null)
    form.reset()
  }

  const onSubmit = (data: BudgetFormData) => {
    try {
      if (editingBudget) {
        updateBudget(editingBudget.id, {
          categoryName: data.categoryName,
          limit: parseFloat(data.limit),
          period: data.period,
          alertThreshold: parseFloat(data.alertThreshold),
        })
        toast.success("Orçamento atualizado", `${data.categoryName} foi atualizado com sucesso.`)
      } else {
        addBudget({
          categoryName: data.categoryName,
          limit: parseFloat(data.limit),
          period: data.period,
          alertThreshold: parseFloat(data.alertThreshold),
        })
        toast.success("Orçamento criado", `Orçamento para ${data.categoryName} foi criado com sucesso.`)
      }
      handleCloseDialog()
    } catch (error) {
      toast.error("Erro", "Não foi possível salvar o orçamento.")
    }
  }

  const handleDelete = (budget: Budget) => {
    try {
      deleteBudget(budget.id)
      toast.success("Orçamento excluído", `Orçamento para ${budget.categoryName} foi removido com sucesso.`)
      setDeletingBudget(null)
    } catch (error) {
      toast.error("Erro", "Não foi possível excluir o orçamento.")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-theme-primary" />
              <div>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  Orçamentos e Limites
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-w-xs">
                      <p className="font-mono text-xs">
                        <strong>Orçamentos</strong> permitem definir limites de gastos por categoria.
                        Você receberá alertas quando estiver próximo ou ultrapassar o limite definido.
                        Acompanhe seus gastos e mantenha suas finanças sob controle.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-zinc-500 font-mono text-sm">
                  Defina limites de gastos por categoria e acompanhe seu progresso
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: 'var(--theme-primary)' }}
              className="hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetsNeedingAttention.length > 0 && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-orange-400">
                  Orçamentos que Precisam de Atenção
                </h3>
              </div>
              <div className="space-y-2">
                {budgetsNeedingAttention.map((budget) => (
                  <div key={budget.id} className="text-sm text-zinc-300">
                    <span className="font-medium">{getTranslatedCategoryName(budget.categoryName)}:</span>{" "}
                    {budget.isOverBudget ? (
                      <span className="text-red-400">Ultrapassou o limite em {formatCurrency(budget.spending - budget.limit)}</span>
                    ) : (
                      <span className="text-orange-400">
                        {formatPercentage(budget.percentage)} do limite utilizado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {budgets.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-mono text-sm">
              Nenhum orçamento configurado. Clique em "Novo Orçamento" para criar um.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget) => {
                const isOverBudget = budget.isOverBudget
                const isNearLimit = budget.shouldAlert && !isOverBudget

                return (
                  <Card
                    key={budget.id}
                    className={`bg-zinc-950 border ${
                      isOverBudget
                        ? "border-red-500/50"
                        : isNearLimit
                          ? "border-orange-500/50"
                          : "border-zinc-800"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
                          {getTranslatedCategoryName(budget.categoryName)}
                          {isOverBudget && (
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                              Excedido
                            </Badge>
                          )}
                          {isNearLimit && !isOverBudget && (
                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                              Atenção
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(budget)}
                            className="h-7 w-7 p-0 hover:bg-theme-primary/20"
                          >
                            <Edit className="w-3.5 h-3.5 text-zinc-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBudget(budget)}
                            className="h-7 w-7 p-0 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">
                        {budget.period === "monthly" ? "Mensal" : "Anual"}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">Gasto</span>
                          <span
                            className={`font-mono font-semibold ${
                              isOverBudget ? "text-red-400" : "text-zinc-100"
                            }`}
                          >
                            {formatCurrency(budget.spending)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(budget.percentage, 100)}
                          className="h-2 bg-zinc-950"
                          style={
                            isOverBudget
                              ? {
                                  ['--progress-indicator-color' as string]: "#ef4444",
                                } as React.CSSProperties
                              : {
                                  ['--progress-indicator-color' as string]: isNearLimit
                                    ? "#f59e0b"
                                    : "var(--theme-primary)",
                                } as React.CSSProperties
                          }
                        />
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className={isOverBudget ? "text-red-400" : "text-zinc-500"}>
                            {formatPercentage(budget.percentage)}
                          </span>
                          <span className="text-zinc-500">
                            de {formatCurrency(budget.limit)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">Restante</span>
                          <span
                            className={`font-mono font-semibold ${
                              budget.remaining < 0
                                ? "text-red-400"
                                : budget.remaining < budget.limit * 0.2
                                  ? "text-orange-400"
                                  : "text-theme-primary"
                            }`}
                          >
                            {formatCurrency(budget.remaining)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono mt-1">
                          {budget.transactionCount} transações
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingBudget
                ? "Edite os detalhes do orçamento"
                : "Defina um limite de gastos para uma categoria"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {expenseCategories.map((category) => {
                          const translatedName = translateCategoryName(category.id, lang)
                          return (
                            <SelectItem key={category.id} value={category.name}>
                              <div className="flex items-center gap-2">
                                {category.icon && <span>{category.icon}</span>}
                                <span>{translatedName}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Limite</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Período</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alertThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      Limite de Alerta (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        placeholder="80"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-zinc-500">
                      Receba um alerta quando atingir esta porcentagem do limite
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-zinc-800 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-theme-primary hover:bg-theme-primary-hover">
                  {editingBudget ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBudget}
        onOpenChange={(open) => !open && setDeletingBudget(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir o orçamento para "{deletingBudget ? getTranslatedCategoryName(deletingBudget.categoryName) : ""}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 bg-transparent hover:bg-zinc-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBudget && handleDelete(deletingBudget)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

