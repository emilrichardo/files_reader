"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getGlobalSettings, getUserSettings } from "@/lib/database"

// Removed the useTheme import that was causing the circular dependency

export function ThemeLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    const loadSettings = async () => {
      if (user && !hasLoadedRef.current) {
        console.log("🎨 [THEME-LOADER] Loading settings for user:", user.id)
        hasLoadedRef.current = true

        try {
          // Load global settings
          const { data: globalData } = await getGlobalSettings()
          console.log("✅ [THEME-LOADER] Global settings loaded:", globalData ? "success" : "not found")

          // Load user settings
          if (user.id) {
            const { data: userData } = await getUserSettings(user.id)
            console.log("✅ [THEME-LOADER] User settings loaded:", userData ? "success" : "not found")
          }
        } catch (error) {
          console.error("❌ [THEME-LOADER] Error loading settings:", error)
        }
      }
    }

    loadSettings()
  }, [user])

  // Reset when user changes
  useEffect(() => {
    if (!user) {
      hasLoadedRef.current = false
    }
  }, [user])

  return <>{children}</>
}
