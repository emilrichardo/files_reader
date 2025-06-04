"use client"

import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

export function ThemeLoader() {
  const { isSettingsReady, isLoadingSettings } = useTheme()
  const { loading: authLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Solo mostrar contenido cuando todo esté listo
    if (!authLoading && isSettingsReady && !isLoadingSettings) {
      // Pequeño delay para evitar flashes
      setTimeout(() => {
        setShowContent(true)
        document.body.classList.add("theme-ready")
        document.body.classList.remove("theme-loading")
      }, 100)
    } else {
      document.body.classList.add("theme-loading")
      document.body.classList.remove("theme-ready")
    }
  }, [authLoading, isSettingsReady, isLoadingSettings])

  // Mostrar loader mientras no esté listo
  if (!showContent) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return null
}
