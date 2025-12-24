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
  { id: "income", name: "Income", color: "var(--theme-primary)", type: "income", icon: "💰" },
  { id: "saas", name: "SaaS", color: "#a855f7", type: "expense", icon: "☁️" },
  { id: "food", name: "Food", color: "#f59e0b", type: "expense", icon: "🍔" },
  { id: "housing", name: "Housing", color: "#3b82f6", type: "expense", icon: "🏠" },
  { id: "fixed", name: "Fixed", color: "#ef4444", type: "expense", icon: "📋" },
]

const STORAGE_KEY = "devfinance_custom_categories"

export function useCategories() {
  const [customCategories, setCustomCategories] = useLocalStorage<CustomCategory[]>(
    STORAGE_KEY,
    []
  )

  // Get all categories (default + custom)
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  // Get category by id or name
  const getCategory = (idOrName: string): CustomCategory | undefined => {
    return allCategories.find((cat) => cat.id === idOrName || cat.name === idOrName)
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

