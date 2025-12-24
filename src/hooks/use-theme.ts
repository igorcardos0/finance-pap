"use client"

import { useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

type Theme = "matrix-green" | "cyber-violet" | "neon-blue"

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("devfinance_theme", "matrix-green")

  useEffect(() => {
    if (typeof window === "undefined") return

    // Validate theme value
    const validThemes: Theme[] = ["matrix-green", "cyber-violet", "neon-blue"]
    const currentTheme = validThemes.includes(theme) ? theme : "matrix-green"
    
    document.documentElement.setAttribute("data-theme", currentTheme)

    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("devfinance_theme") as Theme
      if (savedTheme && validThemes.includes(savedTheme)) {
        setTheme(savedTheme)
        document.documentElement.setAttribute("data-theme", savedTheme)
      }
    }

    window.addEventListener("themeChange", handleThemeChange)
    return () => window.removeEventListener("themeChange", handleThemeChange)
  }, [theme, setTheme])

  return { theme, setTheme }
}

export function setTheme(theme: Theme) {
  if (typeof window !== "undefined") {
    localStorage.setItem("devfinance_theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
    window.dispatchEvent(new Event("themeChange"))
  }
}
