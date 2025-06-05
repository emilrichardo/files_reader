"use client"

import { useTheme } from "@/contexts/theme-context"

export function ThemeLoader() {
  const { isSettingsReady } = useTheme()

  // NUNCA mostrar loader - siempre está listo
  return null
}
