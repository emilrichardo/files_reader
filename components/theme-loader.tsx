"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { loadUserSettings } = useTheme()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      console.log("🎨 [THEME-LOADER] Loading settings for user:", user.id)
      hasLoadedRef.current = true
      loadUserSettings(user.id)
    }
  }, [user]) // Solo depende del ID del usuario

  // Reset cuando el usuario cambia
  useEffect(() => {
    if (!user) {
      hasLoadedRef.current = false
    }
  }, [user])

  return <>{children}</>
}
