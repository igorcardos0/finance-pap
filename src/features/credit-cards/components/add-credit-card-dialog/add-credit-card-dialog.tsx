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
import { useFinanceData, type CreditCard } from "@/hooks/use-finance-data"
import { t, useLanguage } from "@/lib/i18n"
import { creditCardSchema, type CreditCardFormData } from "@/lib/validations"
import { toast } from "@/lib/toast"

interface AddCreditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: CreditCard | null
}

export function AddCreditCardDialog({ open, onOpenChange, card }: AddCreditCardDialogProps) {
  const { addCreditCard, updateCreditCard } = useFinanceData()
  const lang = useLanguage()

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: "",
      limit: "",
      used: "",
      closingDay: "",
      bestDay: "",
      color: "violet",
    },
  })

  useEffect(() => {
    if (card && open) {
      form.reset({
        name: card.name,
        limit: card.limit.toString(),
        used: card.used.toString(),
        closingDay: card.closingDay.toString(),
        bestDay: card.bestDay.toString(),
        color: card.color || "violet",
      })
    } else if (open && !card) {
      form.reset({
        name: "",
        limit: "",
        used: "",
        closingDay: "",
        bestDay: "",
        color: "violet",
      })
    }
  }, [card, open, form])

  const onSubmit = (data: CreditCardFormData) => {
    const cardData = {
      name: data.name,
      limit: parseFloat(data.limit),
      used: parseFloat(data.used || "0"),
      closingDay: parseInt(data.closingDay || "1", 10),
      bestDay: parseInt(data.bestDay || "1", 10),
      color: data.color || "violet",
    }

    if (card) {
      updateCreditCard(card.id, cardData)
      toast.success("Cartão atualizado", `${data.name} foi atualizado com sucesso.`)
    } else {
      addCreditCard(cardData)
      toast.success("Cartão criado", `${data.name} foi adicionado com sucesso.`)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {card ? "Editar Cartão de Crédito" : "Adicionar Cartão de Crédito"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {card ? "Edite os detalhes do seu cartão de crédito." : "Cadastre um novo cartão de crédito"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Nubank Ultraviolet"
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
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Limite (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10000"
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
                name="used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Usado (R$)</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Dia de Fechamento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="15"
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
                name="bestDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Melhor Dia</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="16"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
