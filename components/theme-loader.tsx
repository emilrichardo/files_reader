"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const { isSettingsReady } = useTheme()

  useEffect(() => {
    if (isSettingsReady) {
      // Pequeño delay para asegurar que los estilos se apliquen
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isSettingsReady])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
