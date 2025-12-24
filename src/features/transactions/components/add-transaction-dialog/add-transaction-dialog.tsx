"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useFinanceData, type Transaction } from "@/hooks/use-finance-data"
import { useCategories } from "@/hooks/use-categories"
import { t, useLanguage } from "@/lib/i18n"
import { transactionSchema, type TransactionFormData } from "@/lib/validations"
import { formatCurrency } from "@/lib/formatters"
import { toast } from "@/lib/toast"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

export function AddTransactionDialog({ open, onOpenChange, transaction }: AddTransactionDialogProps) {
  const { addTransaction, updateTransaction, debts } = useFinanceData()
  const { allCategories, getCategoriesByType } = useCategories()
  const lang = useLanguage()

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      tags: "",
      account: "",
      amount: "",
      linkedDebt: "none",
    },
  })

  // Load transaction data when editing
  useEffect(() => {
    if (transaction && open) {
      form.reset({
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        tags: transaction.tags.join(", "),
        account: transaction.account,
        amount: Math.abs(transaction.amount).toString(),
        linkedDebt: "none",
      })
    } else if (open && !transaction) {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "",
        tags: "",
        account: "",
        amount: "",
        linkedDebt: "none",
      })
    }
  }, [transaction, open, form])

  const onSubmit = (data: TransactionFormData) => {
    const tagsArray = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    // Get category to determine type
    const category = allCategories.find((cat) => cat.name === data.category)
    const isIncome = category?.type === "income" || data.category === "Income"
    
    // Ensure Income is positive, everything else is negative
    let finalAmount = parseFloat(data.amount)
    if (!isIncome) {
      // For expenses, ensure it's negative
      if (finalAmount > 0) {
        finalAmount = -Math.abs(finalAmount)
      }
    } else {
      // For income, ensure it's positive
      finalAmount = Math.abs(finalAmount)
    }

    if (transaction) {
      // Update existing transaction
      updateTransaction(transaction.id, {
        date: data.date,
        description: data.description,
        category: data.category,
        tags: tagsArray,
        account: data.account || "Checking",
        amount: finalAmount,
      })
      toast.success(
        t("transactions.updated", lang) || "Transação atualizada",
        `${data.description} foi atualizada com sucesso.`
      )
    } else {
      // Add new transaction
      const newTransaction = {
        date: data.date,
        description: data.description,
        category: data.category,
        tags: tagsArray,
        account: data.account || "Checking",
        amount: finalAmount,
      }

      addTransaction(newTransaction, data.linkedDebt && data.linkedDebt !== "none" ? data.linkedDebt : undefined)
      toast.success(
        t("transactions.created", lang) || "Transação criada",
        `${data.description} foi adicionada com sucesso.`
      )
    }

    onOpenChange(false)
  }

  const selectedCategoryName = form.watch("category")
  const selectedCategory = allCategories.find((cat) => cat.name === selectedCategoryName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {transaction ? "Editar Transação" : t("btn.new.transaction", lang)}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {transaction
              ? "Edite os dados da transação"
              : "Adicione uma nova transação financeira"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const today = new Date().toISOString().split("T")[0]
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                
                return (
                  <FormItem>
                    <FormLabel className="text-zinc-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("transactions.date", lang)}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="date"
                          min="1900-01-01"
                          max="2100-12-31"
                          className="bg-zinc-950 border-zinc-800 text-zinc-100"
                          {...field}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(yesterday)}
                            className="text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Ontem
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(today)}
                            className="text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Hoje
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(tomorrow)}
                            className="text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Amanhã
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Você pode lançar transações com datas passadas ou futuras
                    </p>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    {t("transactions.description", lang)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Salário, Aluguel, etc."
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">{t("transactions.category", lang)}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {allCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            {category.icon && <span>{category.icon}</span>}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">{t("transactions.amount", lang)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow positive numbers in input
                        if (value === "" || parseFloat(value) >= 0) {
                          field.onChange(value)
                        }
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-zinc-500">
                    {selectedCategory?.type === "income" || selectedCategoryName === "Income"
                      ? "✓ Valor será salvo como positivo (receita)"
                      : selectedCategoryName
                        ? "✓ Valor será salvo como negativo (despesa) automaticamente"
                        : "Selecione uma categoria primeiro"}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">{t("transactions.account", lang)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Conta Corrente, Cartão de Crédito"
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">{t("transactions.tags", lang)}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Salário, Trabalho (separados por vírgula)"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Link to Debt (only for expenses) */}
            {selectedCategory && selectedCategory.type !== "income" && debts && debts.length > 0 && (
              <FormField
                control={form.control}
                name="linkedDebt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Vincular a Dívida (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectValue placeholder="Selecione uma dívida para vincular o pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {(debts || [])
                          .filter((debt) => debt.totalAmount - debt.paidAmount > 0)
                          .map((debt) => {
                            const remaining = debt.totalAmount - debt.paidAmount
                            return (
                              <SelectItem key={debt.id} value={debt.id}>
                                {debt.name} (Restante: {formatCurrency(remaining)})
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-500">
                      Ao vincular, o pagamento será registrado automaticamente na dívida
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-zinc-800 bg-transparent"
              >
                {t("btn.cancel", lang)}
              </Button>
              <Button type="submit" className="hover:opacity-90" style={{ backgroundColor: 'var(--theme-primary)' }}>
                {t("btn.save", lang)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
