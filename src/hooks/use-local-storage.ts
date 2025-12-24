/**
 * Custom hook for managing localStorage with error handling and type safety
 */

import { useState, useEffect, useCallback } from "react"

/**
 * Hook to manage localStorage state with automatic synchronization
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns A tuple with the stored value and a setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      if (!item) {
        return initialValue
      }
      
      // Try to parse as JSON first
      try {
        return JSON.parse(item)
      } catch (parseError) {
        // If JSON parse fails, it might be an old format (plain string)
        // This handles migration from old format (string) to new format (JSON)
        // For string values, try to use them directly
        if (typeof initialValue === "string") {
          // Migrate: the old value is a plain string like "pt"
          // Use it directly - migration will happen in useEffect
          return item as T
        }
        
        // If all else fails, return initialValue
        return initialValue
      }
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Migrate old format to new format (only once, after mount)
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    
    try {
      const item = window.localStorage.getItem(key)
      if (!item) {
        return
      }
      
      // Check if it's already in JSON format
      try {
        JSON.parse(item)
        // Already in correct format, no migration needed
        return
      } catch (parseError) {
        // Not in JSON format, needs migration
        if (typeof initialValue === "string") {
          // Migrate: save the old plain string value in JSON format
          const migratedValue = item as T
          window.localStorage.setItem(key, JSON.stringify(migratedValue))
        }
      }
    } catch (error) {
      // Ignore migration errors
    }
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        // Save state
        setStoredValue(valueToStore)
        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(`Error saving ${key} to localStorage:`, error)
      }
    },
    [key, storedValue]
  )

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          try {
            setStoredValue(JSON.parse(e.newValue))
          } catch (parseError) {
            // Handle old format migration - try using value directly if it's a string
            // This handles the case where old code saved plain strings
            const migratedValue = e.newValue as T
            if (typeof window !== "undefined") {
              window.localStorage.setItem(key, JSON.stringify(migratedValue))
            }
            setStoredValue(migratedValue)
          }
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [storedValue, setValue] as const
}

/**
 * Hook to get a value from localStorage (read-only)
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns The stored value
 */
export function useLocalStorageValue<T>(key: string, initialValue: T): T {
  const [value] = useLocalStorage(key, initialValue)
  return value
}

/**
 * Hook to set a value in localStorage (write-only)
 * @param key - The localStorage key
 * @returns A setter function
 */
export function useLocalStorageSetter<T>(key: string) {
  const [, setValue] = useLocalStorage<T>(key, null as T)
  return setValue
}

