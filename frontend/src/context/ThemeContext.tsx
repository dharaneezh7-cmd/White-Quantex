import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wq-theme") as Theme
      if (stored === "light" || stored === "dark") {
        setThemeState(stored)
        document.documentElement.className = stored
        document.documentElement.style.colorScheme = stored
      } else {
        document.documentElement.className = "dark"
        document.documentElement.style.colorScheme = "dark"
      }
    } catch {
      document.documentElement.className = "dark"
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem("wq-theme", newTheme)
    } catch {
      // ignore
    }
    document.documentElement.className = newTheme
    document.documentElement.style.colorScheme = newTheme
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
