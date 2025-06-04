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

// Logo SVG FIJO
const FIXED_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzYjgyZjYiIHJ4PSIxMiIgcnk9IjEyIi8+PHRleHQgeD0iMzIiIHk9IjQyIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+QzwvdGV4dD48L3N2Zz4="

// Configuración FIJA HARDCODEADA
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
  const { user, userRole, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(FIXED_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false) // CAMBIO: Empezar como false
  const [isLoadingSettings, setIsLoadingSettings] = useState(true) // CAMBIO: Empezar como true
  const [isSettingsReady, setIsSettingsReady] = useState(false) // CAMBIO: Empezar como false
  const [isSaving, setIsSaving] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Aplicar estilos INMEDIATAMENTE pero sin mostrar la UI hasta que esté listo
  useEffect(() => {
    console.log("🎨 [THEME] Applying FIXED styles...")
    applyThemeStyles(FIXED_SETTINGS)

    // Cargar configuración real INMEDIATAMENTE
    if (!authLoading) {
      loadSettingsOnce()
    }
  }, [authLoading])

  const loadSettingsOnce = async () => {
    if (hasLoadedOnce) return

    console.log("🔍 [THEME] Loading settings for the first time...")
    setIsLoadingSettings(true)

    try {
      // Intentar cargar configuración real
      const globalResult = await getGlobalSettings()

      let finalSettings = FIXED_SETTINGS

      if (globalResult?.data && !globalResult.error) {
        finalSettings = {
          ...FIXED_SETTINGS,
          ...globalResult.data,
          // Preservar logo si existe
          company_logo: globalResult.data.company_logo || FIXED_LOGO,
        }
        console.log("✅ [THEME] Real settings loaded successfully")
      } else {
        console.log("⚠️ [THEME] Using fixed settings")
      }

      // Aplicar configuración final
      setSettings(finalSettings)
      applyThemeStyles(finalSettings)

      // Marcar como listo
      setHasLoadedOnce(true)
      setIsLoaded(true)
      setIsSettingsReady(true)
    } catch (error) {
      console.log("⚠️ [THEME] Error loading settings, using fixed ones:", error)

      // Usar configuración fija en caso de error
      setSettings(FIXED_SETTINGS)
      applyThemeStyles(FIXED_SETTINGS)

      // Marcar como listo de todos modos
      setHasLoadedOnce(true)
      setIsLoaded(true)
      setIsSettingsReady(true)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const applyThemeStyles = (settings: UserSettings) => {
    // Usar el color personalizado si existe, sino el del esquema, sino azul por defecto
    let primaryColor = settings.custom_color
    if (!primaryColor || primaryColor === "") {
      primaryColor = colorSchemes[settings.color_scheme as keyof typeof colorSchemes]
    }
    if (!primaryColor || primaryColor === "") {
      primaryColor = "#3b82f6"
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

    // FORZAR estilos adicionales
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

    console.log("✅ [THEME] Styles applied with primary color:", primaryColor)
  }

  const reloadSettings = async () => {
    console.log("🔄 [THEME] Reloading settings...")
    setHasLoadedOnce(false)
    setIsLoaded(false)
    setIsSettingsReady(false)
    await loadSettingsOnce()
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Updating settings:", updates)

    if (isSaving) {
      console.log("⚠️ [THEME] Already saving, ignoring request")
      return
    }

    try {
      setIsSaving(true)

      // Actualizar estado local INMEDIATAMENTE
      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      }
      setSettings(updatedSettings)
      applyThemeStyles(updatedSettings)

      // Si es superadmin, intentar guardar en BD
      const isSuperAdmin = userRole === "superadmin"
      if (isSuperAdmin) {
        console.log("💾 [THEME] Superadmin updating global settings")

        const result = await updateUserSettings(GLOBAL_SETTINGS_ID, updates)
        if (result.error) {
          console.error("❌ [THEME] Error saving to database:", result.error)
          throw new Error("Error al guardar configuración: " + result.error.message)
        }

        console.log("✅ [THEME] Settings saved to database successfully")
      } else if (user && updates.theme) {
        console.log("💾 [THEME] User updating personal theme")

        const result = await updateUserSettings(user.id, { theme: updates.theme })
        if (result.error) {
          console.error("❌ [THEME] Error saving theme:", result.error)
          throw new Error("Error al guardar tema: " + result.error.message)
        }

        console.log("✅ [THEME] Theme saved successfully")
      }

      console.log("✅ [THEME] All settings updated successfully")
    } catch (error) {
      console.error("❌ [THEME] Error updating settings:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTheme = async () => {
    const newTheme = settings.theme === "light" ? "dark" : "light"

    // Actualizar inmediatamente
    const updatedSettings = {
      ...settings,
      theme: newTheme,
    }
    setSettings(updatedSettings)
    applyThemeStyles(updatedSettings)

    // Intentar guardar en background
    try {
      if (user) {
        updateUserSettings(user.id, { theme: newTheme })
          .then(() => console.log("✅ Theme preference saved"))
          .catch(() => console.log("⚠️ Could not save theme preference"))
      }
    } catch (error) {
      console.error("Error saving theme preference:", error)
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
    const newName = name.trim() || "Civet"
    await updateSettings({ project_name: newName })
  }

  const removeLogo = async () => {
    await updateSettings({
      company_logo: FIXED_LOGO,
      company_logo_type: "svg",
    })
  }

  const isDark = settings.theme === "dark"
  const primaryColor =
    settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || "#3b82f6"
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
