"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getUserSettings, updateUserSettings, getGlobalSettings } from "@/lib/database"
import type { UserSettings } from "@/lib/types"
import { useAuth } from "./auth-context"

interface ThemeContextType {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  isDark: boolean
  toggleTheme: () => void
  primaryColor: string
  companyLogo: string | null
  logoType: string | null
  projectName: string
  updateProjectName: (name: string) => void
  updateLogo: (file: File) => Promise<void>
  removeLogo: () => void
  fontFamilies: string[]
  colorSchemes: Record<string, string>
  isLightColor: (color: string) => boolean
  getOptimalTextColor: (backgroundColor: string) => string
  getContrastColor: (hex: string, lightColor?: string, darkColor?: string) => string
  isLoaded: boolean
  isLoadingSettings: boolean
  isAdmin: boolean
  isSettingsReady: boolean
  reloadSettings: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001"

// Configuración por defecto robusta
const defaultSettings: UserSettings = {
  id: "1",
  user_id: "demo-user",
  project_name: "Civet",
  api_endpoint: "https://cibet.app.n8n.cloud/webhook/Civet-public-upload",
  api_keys: {
    openai: "",
    google_vision: "",
    supabase: "",
  },
  theme: "light",
  color_scheme: "blue",
  custom_color: "#3b82f6",
  font_family: "Inter",
  style_mode: "flat",
  company_logo: "",
  company_logo_type: undefined,
  updated_at: new Date().toISOString(),
}

const colorSchemes = {
  black: "#000000",
  slate: "#64748b",
  gray: "#6b7280",
  zinc: "#71717a",
  neutral: "#737373",
  stone: "#78716c",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
}

const fontFamilies = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
  "Ubuntu",
  "Rubik",
  "Work Sans",
  "Quicksand",
  "Fira Sans",
  "Mulish",
  "Oswald",
  "DM Sans",
  "Space Grotesk",
]

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "59, 130, 246"

  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)

  return `${r}, ${g}, ${b}`
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
    .split(", ")
    .map((x) => Number.parseInt(x))
  const [r, g, b] = rgb.map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSettingsReady, setIsSettingsReady] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Cargar configuración inmediatamente
  useEffect(() => {
    if (!authLoading) {
      loadSettings()
    }
  }, [authLoading])

  const loadSettings = async () => {
    console.log("🎨 [THEME] Starting settings load...")
    setIsLoadingSettings(true)

    try {
      // FORZAR carga de configuración global
      console.log("🔍 [THEME] Loading global settings...")
      const globalResult = await getGlobalSettings()

      let globalSettings = null
      if (globalResult && globalResult.data && !globalResult.error) {
        globalSettings = globalResult.data
        console.log("✅ [THEME] Global settings loaded successfully")
        console.log("📋 [THEME] - Project name:", globalSettings.project_name)
        console.log("📋 [THEME] - Has logo:", !!globalSettings.company_logo)

        if (globalSettings.company_logo) {
          console.log("🖼️ [THEME] - Logo length:", globalSettings.company_logo.length)
          console.log("🖼️ [THEME] - Logo type:", globalSettings.company_logo_type)
          console.log("🖼️ [THEME] - Logo preview:", globalSettings.company_logo.substring(0, 100))
        }
      } else {
        console.log("⚠️ [THEME] No global settings found:", globalResult?.error?.message)
      }

      // Cargar tema personal si hay usuario
      let personalTheme = globalSettings?.theme || defaultSettings.theme
      if (user) {
        try {
          const userResult = await getUserSettings(user.id)
          if (userResult && userResult.data && userResult.data.theme) {
            personalTheme = userResult.data.theme
            console.log("✅ [THEME] Personal theme loaded:", personalTheme)
          }
        } catch (error) {
          console.log("⚠️ [THEME] Could not load personal theme")
        }
      }

      // Combinar configuraciones - PRESERVAR EL LOGO
      const finalSettings: UserSettings = {
        ...defaultSettings,
        ...globalSettings, // Esto debe incluir el logo
        theme: personalTheme,
        user_id: user?.id || "public",
      }

      console.log("✅ [THEME] Final settings applied:")
      console.log("📋 [THEME] - Project name:", finalSettings.project_name)
      console.log("📋 [THEME] - Theme:", finalSettings.theme)
      console.log("🖼️ [THEME] - Final logo present:", !!finalSettings.company_logo)

      if (finalSettings.company_logo) {
        console.log("🖼️ [THEME] - Final logo length:", finalSettings.company_logo.length)
        console.log("🖼️ [THEME] - Final logo preview:", finalSettings.company_logo.substring(0, 50))
      }

      setSettings(finalSettings)
      applyThemeStyles(finalSettings)
      setIsSettingsReady(true)
    } catch (error) {
      console.error("❌ [THEME] Error loading settings:", error)
      setSettings(defaultSettings)
      applyThemeStyles(defaultSettings)
      setIsSettingsReady(true)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const applyThemeStyles = (settings: UserSettings) => {
    // Determinar color primario con fallback robusto
    let primaryColor = settings.custom_color
    if (!primaryColor || primaryColor === "") {
      primaryColor = colorSchemes[settings.color_scheme as keyof typeof colorSchemes]
    }
    if (!primaryColor || primaryColor === "") {
      primaryColor = "#3b82f6" // Azul por defecto
    }

    console.log("🎨 [THEME] Applying styles with color:", primaryColor)

    const root = document.documentElement
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--font-family", settings.font_family || "Inter")

    // Aplicar tema
    if (settings.theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }

    // Aplicar estilos CSS más específicos
    const style = document.getElementById("dynamic-theme-styles") || document.createElement("style")
    style.id = "dynamic-theme-styles"
    style.textContent = `
      :root {
        --primary: ${primaryColor};
        --primary-rgb: ${hexToRgb(primaryColor)};
      }

      /* Navegación activa en sidebar */
      .sidebar-nav-active,
      [data-sidebar-nav-active="true"] {
        background-color: ${primaryColor} !important;
        color: white !important;
      }

      /* Botón de guardar configuración */
      .settings-save-button,
      button.settings-save-button {
        background-color: #000000 !important;
        background: #000000 !important;
        color: white !important;
        border-color: #000000 !important;
        border: 1px solid #000000 !important;
      }

      .settings-save-button:hover,
      button.settings-save-button:hover {
        background-color: #333333 !important;
        background: #333333 !important;
      }

      .settings-save-button svg,
      button.settings-save-button svg {
        color: ${primaryColor} !important;
      }

      /* Botones primarios generales */
      button[type="submit"]:not([variant="ghost"]):not([variant="outline"]),
      .btn-primary,
      button.bg-blue-600,
      button.bg-primary {
        background-color: #000000 !important;
        background: #000000 !important;
        color: white !important;
        border-color: #000000 !important;
      }

      button[type="submit"]:not([variant="ghost"]):not([variant="outline"]):hover,
      .btn-primary:hover,
      button.bg-blue-600:hover,
      button.bg-primary:hover {
        background-color: #333333 !important;
        background: #333333 !important;
      }

      /* Iconos en botones primarios */
      button[type="submit"] svg,
      .btn-primary svg,
      button.bg-blue-600 svg,
      button.bg-primary svg {
        color: ${primaryColor} !important;
      }
    `

    if (!document.head.contains(style)) {
      document.head.appendChild(style)
    }

    console.log("✅ [THEME] Styles applied successfully")
  }

  const reloadSettings = async () => {
    console.log("🔄 [THEME] Reloading settings...")
    setIsSettingsReady(false)
    await loadSettings()
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Updating settings:", updates)

    try {
      const isSuperAdmin = userRole === "superadmin"

      if (isSuperAdmin) {
        console.log("💾 [THEME] Superadmin updating global settings")
        const result = await updateUserSettings(GLOBAL_SETTINGS_ID, updates)

        if (result.error) {
          throw new Error("Error al guardar configuración global")
        }

        // Actualizar estado local inmediatamente
        const updatedSettings = {
          ...settings,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        applyThemeStyles(updatedSettings)
      } else if (user) {
        // Usuario normal solo puede cambiar tema
        const personalUpdates = { theme: updates.theme }
        const result = await updateUserSettings(user.id, personalUpdates)

        if (result.error) {
          throw new Error("Error al guardar tema personal")
        }

        const updatedSettings = {
          ...settings,
          ...personalUpdates,
          updated_at: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        applyThemeStyles(updatedSettings)
      } else {
        // Usuario público - solo local
        const updatedSettings = {
          ...settings,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        applyThemeStyles(updatedSettings)
      }
    } catch (error) {
      console.error("❌ [THEME] Error updating settings:", error)
      throw error
    }
  }

  const toggleTheme = async () => {
    try {
      await updateSettings({
        theme: settings.theme === "light" ? "dark" : "light",
      })
    } catch (error) {
      console.error("Error toggling theme:", error)
    }
  }

  const updateLogo = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]
      if (!allowedTypes.includes(file.type)) {
        reject(new Error("Formato de archivo no soportado. Use JPG, PNG o SVG."))
        return
      }

      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        reject(new Error("El archivo es demasiado grande. Máximo 5MB."))
        return
      }

      const reader = new FileReader()

      reader.onload = async (e) => {
        const result = e.target?.result as string
        if (result) {
          let logoType: "jpg" | "png" | "svg"
          switch (file.type) {
            case "image/jpeg":
            case "image/jpg":
              logoType = "jpg"
              break
            case "image/png":
              logoType = "png"
              break
            case "image/svg+xml":
              logoType = "svg"
              break
            default:
              logoType = "png"
          }

          try {
            await updateSettings({
              company_logo: result,
              company_logo_type: logoType,
            })
            resolve()
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error("Error al leer el archivo"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      reader.readAsDataURL(file)
    })
  }

  const updateProjectName = async (name: string) => {
    try {
      const newName = name.trim() || "Civet"
      await updateSettings({ project_name: newName })
    } catch (error) {
      console.error("Error updating project name:", error)
    }
  }

  const removeLogo = async () => {
    try {
      await updateSettings({
        company_logo: "",
        company_logo_type: undefined,
      })
    } catch (error) {
      console.error("Error removing logo:", error)
    }
  }

  const isDark = settings.theme === "dark"
  const primaryColor =
    settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || "#3b82f6"
  const companyLogo = settings.company_logo || null
  const logoType = settings.company_logo_type || null
  const projectName = settings.project_name || "Civet"
  const isAdmin = userRole === "admin" || userRole === "superadmin"

  // Debug final del logo en el contexto
  console.log("🖼️ [THEME CONTEXT] Company logo:", companyLogo ? "Present" : "Missing")
  if (companyLogo) {
    console.log("🖼️ [THEME CONTEXT] Logo length:", companyLogo.length)
  }

  const isLightColor = (color: string): boolean => {
    return getLuminance(color) > 0.5
  }

  const getOptimalTextColor = (backgroundColor: string): string => {
    return isLightColor(backgroundColor) ? "#000000" : "#ffffff"
  }

  const getContrastColor = (hex: string, lightColor = "#ffffff", darkColor = "#000000"): string => {
    return isLightColor(hex) ? darkColor : lightColor
  }

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSettings,
        isDark,
        toggleTheme,
        primaryColor,
        companyLogo,
        logoType,
        projectName,
        updateProjectName,
        updateLogo,
        removeLogo,
        fontFamilies,
        colorSchemes,
        isLightColor,
        getOptimalTextColor,
        getContrastColor,
        isLoaded,
        isLoadingSettings,
        isAdmin,
        isSettingsReady,
        reloadSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
