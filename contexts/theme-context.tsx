"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { updateUserSettings, getGlobalSettings } from "@/lib/database"
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

// Logo SVG FIJO que sabemos que funciona
const FIXED_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzYjgyZjYiIHJ4PSIxMiIgcnk9IjEyIi8+PHRleHQgeD0iMzIiIHk9IjQyIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+QzwvdGV4dD48L3N2Zz4="

// Configuración FIJA que funciona
const FIXED_SETTINGS: UserSettings = {
  id: "1",
  user_id: "global",
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
  company_logo: FIXED_LOGO,
  company_logo_type: "svg",
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
  const { user, userRole } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(FIXED_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(true) // SIEMPRE listo
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSettingsReady, setIsSettingsReady] = useState(true) // SIEMPRE listo

  // Aplicar estilos INMEDIATAMENTE
  useEffect(() => {
    console.log("🎨 [THEME] Applying IMMEDIATE styles...")
    applyThemeStyles(FIXED_SETTINGS)

    // Cargar configuración real en background SIN bloquear - CON DELAY MAYOR
    setTimeout(() => {
      loadSettingsAsync()
    }, 2000) // 2 segundos de delay para evitar timeouts
  }, [])

  const loadSettingsAsync = async () => {
    try {
      console.log("🔍 [THEME] Loading real settings in background...")

      // Intentar cargar con timeout manual más largo
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Manual timeout")), 10000) // 10 segundos
      })

      const settingsPromise = getGlobalSettings()

      const globalResult = await Promise.race([settingsPromise, timeoutPromise])

      if (globalResult?.data && !globalResult.error) {
        const realSettings = {
          ...FIXED_SETTINGS,
          ...globalResult.data,
          // FORZAR logo si existe
          company_logo: globalResult.data.company_logo || FIXED_LOGO,
        }

        console.log("✅ [THEME] Real settings loaded, updating...")
        setSettings(realSettings)
        applyThemeStyles(realSettings)
      } else {
        console.log("⚠️ [THEME] No real settings found, keeping fixed ones")
      }
    } catch (error) {
      console.log("⚠️ [THEME] Error loading real settings (timeout or error), keeping fixed ones:", error.message)
    }
  }

  const applyThemeStyles = (settings: UserSettings) => {
    const primaryColor = settings.custom_color || "#3b82f6"

    console.log("🎨 [THEME] Applying styles with color:", primaryColor)
    console.log("🖼️ [THEME] Logo:", settings.company_logo ? "Present" : "Missing")

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

    // FORZAR estilos adicionales MÁS AGRESIVOS
    const style = document.getElementById("ultra-dynamic-styles") || document.createElement("style")
    style.id = "ultra-dynamic-styles"
    style.textContent = `
      /* ULTRA FORZADO */
      button[type="submit"],
      .settings-save-button,
      button.bg-blue-600,
      button.bg-primary,
      .btn-primary,
      button[class*="bg-blue"],
      button[class*="bg-primary"] {
        background-color: #000000 !important;
        background: #000000 !important;
        color: #ffffff !important;
        border-color: #000000 !important;
        border: 1px solid #000000 !important;
      }
      
      button[type="submit"]:hover,
      .settings-save-button:hover,
      button.bg-blue-600:hover,
      button.bg-primary:hover,
      .btn-primary:hover,
      button[class*="bg-blue"]:hover,
      button[class*="bg-primary"]:hover {
        background-color: #333333 !important;
        background: #333333 !important;
        color: #ffffff !important;
      }
      
      /* FORZAR CLASES TAILWIND */
      .bg-blue-600 {
        background-color: #000000 !important;
      }
      
      .hover\\:bg-blue-700:hover {
        background-color: #333333 !important;
      }
      
      .text-white {
        color: #ffffff !important;
      }
      
      /* Navegación activa */
      .sidebar-nav-active,
      [data-sidebar-nav-active="true"] {
        background-color: ${primaryColor} !important;
        color: white !important;
      }
    `

    if (!document.head.contains(style)) {
      document.head.appendChild(style)
    }

    console.log("✅ [THEME] ULTRA styles applied")
  }

  const reloadSettings = async () => {
    await loadSettingsAsync()
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Updating settings:", updates)

    try {
      const isSuperAdmin = userRole === "superadmin"

      if (isSuperAdmin) {
        console.log("💾 [THEME] Superadmin updating global settings")
        const result = await updateUserSettings(GLOBAL_SETTINGS_ID, updates)
        if (result.error) {
          throw new Error("Error al guardar configuración global: " + result.error.message)
        }
      } else if (user && updates.theme) {
        console.log("💾 [THEME] User updating personal theme")
        const result = await updateUserSettings(user.id, { theme: updates.theme })
        if (result.error) {
          throw new Error("Error al guardar tema personal: " + result.error.message)
        }
      }

      // Actualizar estado local INMEDIATAMENTE
      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      }
      setSettings(updatedSettings)
      applyThemeStyles(updatedSettings)

      console.log("✅ [THEME] Settings updated successfully")
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
        company_logo: FIXED_LOGO,
        company_logo_type: "svg",
      })
    } catch (error) {
      console.error("Error removing logo:", error)
    }
  }

  const isDark = settings.theme === "dark"
  const primaryColor = settings.custom_color || "#3b82f6"
  const companyLogo = settings.company_logo || FIXED_LOGO
  const logoType = settings.company_logo_type || "svg"
  const projectName = settings.project_name || "Civet"
  const isAdmin = userRole === "admin" || userRole === "superadmin"

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
