"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(false) // Cambiado a false para evitar loading infinito
  const { isSettingsReady } = useTheme()

  useEffect(() => {
    // No mostrar loader
    setIsLoading(false)
  }, [isSettingsReady])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
