/**
 * Utilities for importing data from JSON and CSV files
 */

import type { Transaction, CreditCard, FinancialGoal, Debt, EmergencyFund } from "@/hooks/use-finance-data"

export interface ImportData {
  transactions?: Transaction[]
  creditCards?: CreditCard[]
  financialGoals?: FinancialGoal[]
  debts?: Debt[]
  emergencyFund?: EmergencyFund
  exportDate?: string
}

/**
 * Parse JSON import data
 */
export function parseJSONImport(fileContent: string): ImportData {
  try {
    const data = JSON.parse(fileContent)
    return data as ImportData
  } catch (error) {
    throw new Error("Arquivo JSON inválido. Verifique o formato do arquivo.")
  }
}

/**
 * Parse CSV import data (transactions only)
 */
export function parseCSVImport(fileContent: string): { transactions: Transaction[] } {
  const lines = fileContent.split("\n").filter((line) => line.trim().length > 0)
  
  if (lines.length < 2) {
    throw new Error("Arquivo CSV vazio ou inválido. Deve conter pelo menos um cabeçalho e uma linha de dados.")
  }

  // Parse header
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine)
  
  // Expected headers (case-insensitive)
  const expectedHeaders = ["date", "description", "category", "tags", "account", "amount"]
  const headerMap: Record<string, number> = {}
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim()
    if (expectedHeaders.includes(normalizedHeader)) {
      headerMap[normalizedHeader] = index
    }
  })

  // Validate required headers
  if (!headerMap["date"] || !headerMap["description"] || !headerMap["amount"]) {
    throw new Error("CSV deve conter as colunas: Date, Description, Amount (e opcionalmente Category, Tags, Account)")
  }

  // Parse data rows
  const transactions: Transaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    
    if (row.length === 0) continue

    const date = row[headerMap["date"]]?.trim() || ""
    const description = row[headerMap["description"]]?.trim() || ""
    const amountStr = row[headerMap["amount"]]?.trim() || "0"
    const category = row[headerMap["category"]]?.trim() || "Conta Fixa"
    const tagsStr = row[headerMap["tags"]]?.trim() || ""
    const account = row[headerMap["account"]]?.trim() || "Checking"

    // Validate required fields
    if (!date || !description) {
      console.warn(`Linha ${i + 1} ignorada: data ou descrição ausente`)
      continue
    }

    // Parse amount
    let amount = parseFloat(amountStr.replace(/[^\d.-]/g, ""))
    if (isNaN(amount)) {
      console.warn(`Linha ${i + 1} ignorada: valor inválido`)
      continue
    }

    // Parse tags
    const tags = tagsStr
      ? tagsStr.split(/[;,\n]/).map((tag) => tag.trim()).filter((tag) => tag.length > 0)
      : []

    // Ensure Income is positive, others are negative (check both old English and new Portuguese names)
    if (category === "Income" || category === "Receita" || category.toLowerCase() === "income") {
      amount = Math.abs(amount)
    } else {
      amount = -Math.abs(amount)
    }

    // Validate date format (YYYY-MM-DD or DD/MM/YYYY)
    let formattedDate = date
    if (date.includes("/")) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = date.split("/")
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }
    }

    transactions.push({
      id: `imported_${Date.now()}_${i}`,
      date: formattedDate,
      description,
      category,
      tags,
      account,
      amount,
    })
  }

  if (transactions.length === 0) {
    throw new Error("Nenhuma transação válida encontrada no arquivo CSV.")
  }

  return { transactions }
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add last field
  result.push(current.trim())

  return result
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: ImportData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (data.transactions) {
    if (!Array.isArray(data.transactions)) {
      errors.push("Transações devem ser um array")
    } else {
      data.transactions.forEach((t, index) => {
        if (!t.date || !t.description || typeof t.amount !== "number") {
          errors.push(`Transação ${index + 1} inválida: faltam campos obrigatórios`)
        }
      })
    }
  }

  if (data.creditCards && !Array.isArray(data.creditCards)) {
    errors.push("Cartões de crédito devem ser um array")
  }

  if (data.financialGoals && !Array.isArray(data.financialGoals)) {
    errors.push("Metas financeiras devem ser um array")
  }

  if (data.debts && !Array.isArray(data.debts)) {
    errors.push("Dívidas devem ser um array")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

