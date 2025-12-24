/**
 * Hook for managing custom categories
 */

import { useState, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface CustomCategory {
  id: string
  name: string
  color: string // hex color or CSS color name
  type: "income" | "expense"
  icon?: string // emoji or icon name
}

// Default categories that cannot be deleted
export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: "income", name: "Receita", color: "var(--theme-primary)", type: "income", icon: "💰" },
  { id: "food", name: "Alimentação", color: "#f59e0b", type: "expense", icon: "🍔" },
  { id: "housing", name: "Moradia", color: "#3b82f6", type: "expense", icon: "🏠" },
  { id: "fixed", name: "Conta Fixa", color: "#ef4444", type: "expense", icon: "📋" },
  { id: "education", name: "Educação", color: "#8b5cf6", type: "expense", icon: "📚" },
  { id: "health", name: "Saúde", color: "#f43f5e", type: "expense", icon: "🏥" },
  { id: "transport", name: "Transporte", color: "#06b6d4", type: "expense", icon: "🚗" },
  { id: "leisure", name: "Lazer", color: "#ec4899", type: "expense", icon: "🎮" },
  { id: "utilities", name: "Utilidades", color: "#10b981", type: "expense", icon: "💡" },
]

const STORAGE_KEY = "devfinance_custom_categories"

export function useCategories() {
  const [customCategories, setCustomCategories] = useLocalStorage<CustomCategory[]>(
    STORAGE_KEY,
    []
  )

  // Get all categories (default + custom)
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  // Get category by id or name (with backward compatibility for old English names)
  const getCategory = (idOrName: string): CustomCategory | undefined => {
    // First try to find by ID or current name
    let category = allCategories.find((cat) => cat.id === idOrName || cat.name === idOrName)
    
    // If not found, try to match old English names for backward compatibility
    if (!category) {
      const oldNameMap: Record<string, string> = {
        "Income": "income",
        "Receita": "income",
        "Food": "food",
        "Alimentação": "food",
        "Housing": "housing",
        "Moradia": "housing",
        "Fixed": "fixed",
        "Conta Fixa": "fixed",
        "SaaS": "food", // Migrar SaaS antigo para Alimentação como fallback
        "Education": "education",
        "Educação": "education",
        "Health": "health",
        "Saúde": "health",
        "Transport": "transport",
        "Transporte": "transport",
        "Leisure": "leisure",
        "Lazer": "leisure",
        "Utilities": "utilities",
        "Utilidades": "utilities",
      }
      const categoryId = oldNameMap[idOrName]
      if (categoryId) {
        category = allCategories.find((cat) => cat.id === categoryId)
      }
    }
    
    return category
  }

  // Add custom category
  const addCategory = (category: Omit<CustomCategory, "id">) => {
    const newCategory: CustomCategory = {
      ...category,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }
    setCustomCategories([...customCategories, newCategory])
    return newCategory.id
  }

  // Update custom category
  const updateCategory = (id: string, updates: Partial<CustomCategory>) => {
    setCustomCategories(
      customCategories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    )
  }

  // Delete custom category
  const deleteCategory = (id: string) => {
    // Prevent deleting default categories
    if (DEFAULT_CATEGORIES.some((cat) => cat.id === id)) {
      throw new Error("Cannot delete default category")
    }
    setCustomCategories(customCategories.filter((cat) => cat.id !== id))
  }

  // Get categories by type
  const getCategoriesByType = (type: "income" | "expense" | "all") => {
    if (type === "all") return allCategories
    return allCategories.filter((cat) => cat.type === type)
  }

  return {
    allCategories,
    customCategories,
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
  }
}

