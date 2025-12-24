/**
 * Zod validation schemas for form validation
 */

import { z } from "zod"

/**
 * Schema for transaction form validation
 */
export const transactionSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Valor deve ser um número positivo"
    ),
  account: z.string().optional(),
  tags: z.string().optional(),
  linkedDebt: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

/**
 * Schema for debt form validation
 */
export const debtSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    totalAmount: z
      .string()
      .min(1, "Valor total é obrigatório")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Valor total deve ser um número positivo"
      ),
    paidAmount: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        "Valor pago deve ser um número positivo ou zero"
      ),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      const total = parseFloat(data.totalAmount)
      const paid = parseFloat(data.paidAmount || "0")
      return paid <= total
    },
    {
      message: "Valor pago não pode ser maior que o valor total",
      path: ["paidAmount"],
    }
  )

export type DebtFormData = z.infer<typeof debtSchema>

/**
 * Schema for credit card form validation
 */
export const creditCardSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  limit: z
    .string()
    .min(1, "Limite é obrigatório")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Limite deve ser um número positivo"
    ),
  used: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Valor usado deve ser um número positivo ou zero"
    ),
  closingDay: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 1 && parseInt(val) <= 31),
      "Dia de fechamento deve ser entre 1 e 31"
    ),
  bestDay: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 1 && parseInt(val) <= 31),
      "Melhor dia deve ser entre 1 e 31"
    ),
  color: z.string().optional(),
})

export type CreditCardFormData = z.infer<typeof creditCardSchema>

/**
 * Schema for financial goal form validation
 */
export const financialGoalSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    target: z
      .string()
      .min(1, "Valor alvo é obrigatório")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Valor alvo deve ser um número positivo"
      ),
    current: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        "Valor atual deve ser um número positivo ou zero"
      ),
    deadline: z.string().optional(),
    icon: z.string().max(2, "Ícone deve ter no máximo 2 caracteres").optional(),
  })
  .refine(
    (data) => {
      const target = parseFloat(data.target)
      const current = parseFloat(data.current || "0")
      return current <= target
    },
    {
      message: "Valor atual não pode ser maior que o valor alvo",
      path: ["current"],
    }
  )

export type FinancialGoalFormData = z.infer<typeof financialGoalSchema>

/**
 * Schema for emergency fund form validation
 */
export const emergencyFundSchema = z.object({
  target: z
    .string()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Valor alvo deve ser um número positivo ou zero"
    )
    .optional(),
  current: z
    .string()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Valor atual deve ser um número positivo ou zero"
    )
    .optional(),
  monthsOfRunway: z
    .string()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      "Meses de runway devem ser um número positivo ou zero"
    )
    .optional(),
})

export type EmergencyFundFormData = z.infer<typeof emergencyFundSchema>

