/**
 * Hook for automatic backup scheduling
 */

import { useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import { useFinanceData } from "./use-finance-data"

export type BackupFrequency = "daily" | "weekly" | "monthly" | "never"

const BACKUP_ENABLED_KEY = "devfinance_auto_backup_enabled"
const BACKUP_FREQUENCY_KEY = "devfinance_auto_backup_frequency"
const LAST_BACKUP_KEY = "devfinance_last_backup"

export function useAutoBackup() {
  const [enabled, setEnabled] = useLocalStorage<boolean>(BACKUP_ENABLED_KEY, false)
  const [frequency, setFrequency] = useLocalStorage<BackupFrequency>(BACKUP_FREQUENCY_KEY, "weekly")
  const [lastBackup, setLastBackup] = useLocalStorage<string | null>(LAST_BACKUP_KEY, null)
  const financeData = useFinanceData()

  const shouldBackup = (): boolean => {
    if (!enabled || frequency === "never") return false

    if (!lastBackup) return true

    const lastBackupDate = new Date(lastBackup)
    const now = new Date()
    const diffTime = now.getTime() - lastBackupDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    switch (frequency) {
      case "daily":
        return diffDays >= 1
      case "weekly":
        return diffDays >= 7
      case "monthly":
        return diffDays >= 30
      default:
        return false
    }
  }

  const performBackup = () => {
    try {
      const data = {
        transactions: financeData.transactions,
        creditCards: financeData.creditCards,
        financialGoals: financeData.financialGoals,
        debts: financeData.debts,
        emergencyFund: financeData.emergencyFund,
        backupDate: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `devfinance_auto_backup_${new Date().toISOString().split("T")[0]}.json`
      
      // Create a temporary link and trigger download
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setLastBackup(new Date().toISOString())
      
      // Store backup info in localStorage
      const backupInfo = {
        date: new Date().toISOString(),
        frequency,
        transactionCount: financeData.transactions.length,
      }
      localStorage.setItem("devfinance_backup_info", JSON.stringify(backupInfo))

      return true
    } catch (error) {
      console.error("Error performing auto backup:", error)
      return false
    }
  }

  // Check and perform backup periodically
  useEffect(() => {
    if (!enabled || frequency === "never") return

    // Check immediately on mount
    if (shouldBackup()) {
      performBackup()
    }

    // Check every hour
    const interval = setInterval(() => {
      if (shouldBackup()) {
        performBackup()
      }
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [enabled, frequency, lastBackup, financeData])

  return {
    enabled,
    setEnabled,
    frequency,
    setFrequency,
    lastBackup,
    performBackup,
    shouldBackup: shouldBackup(),
  }
}

