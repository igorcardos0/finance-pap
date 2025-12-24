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
import { useFinanceData } from "@/hooks/use-finance-data"
import { t, useLanguage } from "@/lib/i18n"
import { emergencyFundSchema, type EmergencyFundFormData } from "@/lib/validations"
import { toast } from "@/lib/toast"

interface EmergencyFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmergencyFundDialog({ open, onOpenChange }: EmergencyFundDialogProps) {
  const { emergencyFund, updateEmergencyFund } = useFinanceData()
  const lang = useLanguage()

  const form = useForm<EmergencyFundFormData>({
    resolver: zodResolver(emergencyFundSchema),
    defaultValues: {
      target: "",
      current: "",
      monthsOfRunway: "",
    },
  })

  useEffect(() => {
    if (open) {
      // Always reset form when dialog opens with current values
      form.reset({
        target: emergencyFund.target.toString() || "",
        current: emergencyFund.current.toString() || "",
        monthsOfRunway: emergencyFund.monthsOfRunway.toString() || "",
      })
    }
  }, [open, emergencyFund.target, emergencyFund.current, emergencyFund.monthsOfRunway, form])

  const onSubmit = (data: EmergencyFundFormData) => {
    const newFund = {
      target: parseFloat(data.target || "0"),
      current: parseFloat(data.current || "0"),
      monthsOfRunway: parseFloat(data.monthsOfRunway || "0"),
    }
    
    updateEmergencyFund(newFund)

    toast.success("Fundo de emergência atualizado", "As configurações foram salvas com sucesso.")
    
    // Force a small delay to ensure state update
    setTimeout(() => {
      onOpenChange(false)
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Configurar Fundo de Emergência</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Defina seu fundo de emergência e metas
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="60000"
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

            <FormField
              control={form.control}
              name="monthsOfRunway"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Meses de Runway Desejados</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="6"
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
