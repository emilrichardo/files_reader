"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { loadUserSettings } = useTheme()

  useEffect(() => {
    if (user) {
      loadUserSettings(user.id)
    }
  }, [user, loadUserSettings])

  // Also listen for the custom event from AuthProvider
  useEffect(() => {
    const handleUserLoaded = (event: CustomEvent) => {
      const { userId } = event.detail
      if (userId) {
        loadUserSettings(userId)
      }
    }

    window.addEventListener("userLoaded", handleUserLoaded as EventListener)
    return () => window.removeEventListener("userLoaded", handleUserLoaded as EventListener)
  }, [loadUserSettings])

  return <>{children}</>
}
