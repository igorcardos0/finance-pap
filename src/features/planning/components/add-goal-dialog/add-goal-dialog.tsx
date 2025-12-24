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
import { useFinanceData, type FinancialGoal } from "@/hooks/use-finance-data"
import { t, useLanguage } from "@/lib/i18n"
import { financialGoalSchema, type FinancialGoalFormData } from "@/lib/validations"
import { toast } from "@/lib/toast"

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: FinancialGoal | null
}

export function AddGoalDialog({ open, onOpenChange, goal }: AddGoalDialogProps) {
  const { addFinancialGoal, updateFinancialGoal } = useFinanceData()
  const lang = useLanguage()

  const form = useForm<FinancialGoalFormData>({
    resolver: zodResolver(financialGoalSchema),
    defaultValues: {
      name: "",
      target: "",
      current: "",
      deadline: "",
      icon: "🎯",
    },
  })

  useEffect(() => {
    if (goal && open) {
      form.reset({
        name: goal.name,
        target: goal.target.toString(),
        current: goal.current.toString(),
        deadline: goal.deadline,
        icon: goal.icon,
      })
    } else if (open && !goal) {
      form.reset({
        name: "",
        target: "",
        current: "",
        deadline: "",
        icon: "🎯",
      })
    }
  }, [goal, open, form])

  const onSubmit = (data: FinancialGoalFormData) => {
    const goalData = {
      name: data.name,
      target: parseFloat(data.target),
      current: parseFloat(data.current || "0"),
      deadline: data.deadline || new Date().toISOString().split("T")[0],
      icon: data.icon || "🎯",
    }

    if (goal) {
      updateFinancialGoal(goal.id, goalData)
      toast.success("Meta atualizada", `${data.name} foi atualizada com sucesso.`)
    } else {
      addFinancialGoal(goalData)
      toast.success("Meta criada", `${data.name} foi adicionada com sucesso.`)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {goal ? "Editar Meta Financeira" : "Adicionar Meta Financeira"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {goal ? "Edite os detalhes da sua meta financeira." : "Defina uma nova meta financeira"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Nome da Meta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: MacBook M3 Pro"
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Ícone (emoji)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="🎯"
                      maxLength={2}
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
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Valor Alvo (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="20000"
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
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Valor Atual (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
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
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Prazo</FormLabel>
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
