/**
 * Hook for managing financial notifications and alerts
 */

import { useEffect, useCallback } from "react"
import { useFinanceData } from "./use-finance-data"
import { useBudgets } from "./use-budgets"
import { useLocalStorage } from "./use-local-storage"
import { toast } from "@/lib/toast"

export interface Notification {
  id: string
  type: "budget" | "goal" | "debt" | "emergency"
  title: string
  message: string
  severity: "info" | "warning" | "error"
  timestamp: string
  read: boolean
  actionUrl?: string
}

const STORAGE_KEY = "devfinance_notifications"
const NOTIFICATIONS_ENABLED_KEY = "devfinance_notifications_enabled"

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(STORAGE_KEY, [])
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>(
    NOTIFICATIONS_ENABLED_KEY,
    true
  )
  const { transactions, financialGoals, debts, emergencyFund } = useFinanceData()
  const { budgets, calculateBudgetProgress } = useBudgets()

  // Check for budget alerts
  const checkBudgetAlerts = useCallback(() => {
    if (!notificationsEnabled) return

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    budgets.forEach((budget) => {
      const progress = calculateBudgetProgress(budget.id, "month")
      const percentage = (progress.spent / budget.limit) * 100
      const isOverBudget = progress.spent > budget.limit
      const isNearLimit = percentage >= budget.alertThreshold && !isOverBudget

      if (isNearLimit) {
        // Check if notification already exists
        const existingNotification = notifications.find(
          (n) => n.type === "budget" && n.title.includes(budget.categoryName) && !n.read
        )

        if (!existingNotification) {
          const remaining = budget.limit - progress.spent
          const notification: Notification = {
            id: `budget_${budget.categoryName}_${Date.now()}`,
            type: "budget",
            title: `Orçamento próximo do limite: ${budget.categoryName}`,
            message: `Você já utilizou ${percentage.toFixed(1)}% do orçamento de ${budget.categoryName}. Restam ${remaining.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
            severity: percentage >= 90 ? "error" : "warning",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/dashboard/settings",
          }

          setNotifications((prev) => [notification, ...prev])
          
          // Show toast notification
          if (percentage >= 90) {
            toast.error(
              "Orçamento quase esgotado",
              `${budget.categoryName}: ${percentage.toFixed(1)}% utilizado`
            )
          } else {
            toast.warning(
              "Atenção ao orçamento",
              `${budget.categoryName}: ${percentage.toFixed(1)}% utilizado`
            )
          }
        }
      } else if (isOverBudget) {
        // Budget exceeded
        const existingNotification = notifications.find(
          (n) => n.type === "budget" && n.title.includes(`Orçamento excedido: ${budget.categoryName}`) && !n.read
        )

        if (!existingNotification) {
          const exceeded = progress.spent - budget.limit
          const notification: Notification = {
            id: `budget_exceeded_${budget.categoryName}_${Date.now()}`,
            type: "budget",
            title: `Orçamento excedido: ${budget.categoryName}`,
            message: `Você ultrapassou o limite de ${budget.categoryName} em ${exceeded.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
            severity: "error",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/dashboard/settings",
          }

          setNotifications((prev) => [notification, ...prev])
          toast.error(
            "Orçamento excedido",
            `${budget.categoryName} ultrapassou o limite em ${exceeded.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
          )
        }
      }
    })
  }, [budgets, notifications, notificationsEnabled, setNotifications, calculateBudgetProgress])

  // Check for goal alerts
  const checkGoalAlerts = useCallback(() => {
    if (!notificationsEnabled) return

    financialGoals.forEach((goal) => {
      const percentage = (goal.current / goal.target) * 100
      const deadline = new Date(goal.deadline)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Alert if goal is 80% complete
      if (percentage >= 80 && percentage < 100) {
        const existingNotification = notifications.find(
          (n) => n.type === "goal" && n.title.includes(goal.name) && !n.read
        )

        if (!existingNotification) {
          const notification: Notification = {
            id: `goal_${goal.id}_${Date.now()}`,
            type: "goal",
            title: `Meta quase alcançada: ${goal.name}`,
            message: `Você está a ${percentage.toFixed(1)}% de alcançar sua meta "${goal.name}". Faltam ${(goal.target - goal.current).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
            severity: "info",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/dashboard/planning",
          }

          setNotifications((prev) => [notification, ...prev])
        }
      }

      // Alert if deadline is approaching (30 days)
      if (daysUntilDeadline <= 30 && daysUntilDeadline > 0 && percentage < 100) {
        const existingNotification = notifications.find(
          (n) => n.type === "goal" && n.title.includes(`Prazo próximo: ${goal.name}`) && !n.read
        )

        if (!existingNotification) {
          const notification: Notification = {
            id: `goal_deadline_${goal.id}_${Date.now()}`,
            type: "goal",
            title: `Prazo próximo: ${goal.name}`,
            message: `Faltam ${daysUntilDeadline} dias para o prazo da meta "${goal.name}". Você está a ${percentage.toFixed(1)}% do objetivo.`,
            severity: daysUntilDeadline <= 7 ? "error" : "warning",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/dashboard/planning",
          }

          setNotifications((prev) => [notification, ...prev])
        }
      }
    })
  }, [financialGoals, notifications, notificationsEnabled, setNotifications])

  // Check for debt alerts
  const checkDebtAlerts = useCallback(() => {
    if (!notificationsEnabled) return

    debts.forEach((debt) => {
      if (debt.dueDate) {
        const dueDate = new Date(debt.dueDate)
        const now = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const remaining = debt.totalAmount - debt.paidAmount

        if (daysUntilDue <= 7 && daysUntilDue > 0 && remaining > 0) {
          const existingNotification = notifications.find(
            (n) => n.type === "debt" && n.title.includes(`Vencimento próximo: ${debt.name}`) && !n.read
          )

          if (!existingNotification) {
            const notification: Notification = {
              id: `debt_due_${debt.id}_${Date.now()}`,
              type: "debt",
              title: `Vencimento próximo: ${debt.name}`,
              message: `A dívida "${debt.name}" vence em ${daysUntilDue} dias. Valor restante: ${remaining.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
              severity: daysUntilDue <= 3 ? "error" : "warning",
              timestamp: new Date().toISOString(),
              read: false,
              actionUrl: "/dashboard/debts",
            }

            setNotifications((prev) => [notification, ...prev])
            toast.warning(
              "Vencimento próximo",
              `${debt.name} vence em ${daysUntilDue} dias`
            )
          }
        }
      }
    })
  }, [debts, notifications, notificationsEnabled, setNotifications])

  // Check for emergency fund alerts
  const checkEmergencyFundAlerts = useCallback(() => {
    if (!notificationsEnabled) return

    const percentage = emergencyFund.target > 0 ? (emergencyFund.current / emergencyFund.target) * 100 : 0

    if (percentage >= 80 && percentage < 100) {
      const existingNotification = notifications.find(
        (n) => n.type === "emergency" && n.title.includes("Fundo de Emergência") && !n.read
      )

      if (!existingNotification) {
        const notification: Notification = {
          id: `emergency_${Date.now()}`,
          type: "emergency",
          title: "Fundo de Emergência quase completo",
          message: `Seu fundo de emergência está a ${percentage.toFixed(1)}% do objetivo. Faltam ${(emergencyFund.target - emergencyFund.current).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
          severity: "info",
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: "/dashboard/planning",
        }

        setNotifications((prev) => [notification, ...prev])
      }
    }
  }, [emergencyFund, notifications, notificationsEnabled, setNotifications])

  // Run all checks
  useEffect(() => {
    if (!notificationsEnabled) return

    checkBudgetAlerts()
    checkGoalAlerts()
    checkDebtAlerts()
    checkEmergencyFundAlerts()
  }, [
    transactions,
    budgets,
    financialGoals,
    debts,
    emergencyFund,
    checkBudgetAlerts,
    checkGoalAlerts,
    checkDebtAlerts,
    checkEmergencyFundAlerts,
    notificationsEnabled,
  ])

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
  }

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    notificationsEnabled,
    setNotificationsEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}

