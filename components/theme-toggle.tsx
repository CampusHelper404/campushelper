"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width: 36, height: 36 }} />
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "1px solid var(--border)",
        background: "var(--card)",
        color: "var(--foreground)",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
