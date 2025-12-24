"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useFinanceData, type Debt } from "@/hooks/use-finance-data"
import { t, useLanguage } from "@/lib/i18n"
import { debtSchema, type DebtFormData } from "@/lib/validations"
import { toast } from "@/lib/toast"

interface AddDebtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt?: Debt | null
}

export function AddDebtDialog({ open, onOpenChange, debt }: AddDebtDialogProps) {
  const { addDebt, updateDebt } = useFinanceData()
  const lang = useLanguage()

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: "",
      totalAmount: "",
      paidAmount: "",
      description: "",
      dueDate: "",
    },
  })

  useEffect(() => {
    if (debt && open) {
      form.reset({
        name: debt.name,
        totalAmount: debt.totalAmount.toString(),
        paidAmount: debt.paidAmount.toString(),
        description: debt.description || "",
        dueDate: debt.dueDate || "",
      })
    } else if (open && !debt) {
      form.reset({
        name: "",
        totalAmount: "",
        paidAmount: "",
        description: "",
        dueDate: "",
      })
    }
  }, [debt, open, form])

  const onSubmit = (data: DebtFormData) => {
    const debtData = {
      name: data.name,
      totalAmount: parseFloat(data.totalAmount),
      paidAmount: parseFloat(data.paidAmount || "0"),
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
    }

    if (debt) {
      updateDebt(debt.id, debtData)
      toast.success("Dívida atualizada", `${data.name} foi atualizada com sucesso.`)
    } else {
      addDebt(debtData)
      toast.success("Dívida criada", `${data.name} foi adicionada com sucesso.`)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {debt ? "Editar Dívida" : "Adicionar Dívida"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {debt
              ? "Edite os dados da dívida"
              : "Cadastre uma nova dívida. Para registrar pagamentos, crie uma transação normal."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Nome da Dívida</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Empréstimo, Cartão de Crédito, etc."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Empréstimo pessoal, dívida com amigo..."
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Valor Total (R$)</FormLabel>
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
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Valor Pago (R$)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Data de Vencimento (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
