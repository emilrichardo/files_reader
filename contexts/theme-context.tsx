"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { updateUserSettings } from "@/lib/database"
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

// Logo SVG por defecto
const DEFAULT_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzYjgyZjYiIHJ4PSIxMiIgcnk9IjEyIi8+PHRleHQgeD0iMzIiIHk9IjQyIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+QzwvdGV4dD48L3N2Zz4="

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

  // Configuración por defecto INMEDIATA
  const [settings, setSettings] = useState<UserSettings>({
    id: "1",
    user_id: "global",
    project_name: "Civet",
    api_endpoint: "",
    api_keys: { openai: "", google_vision: "", supabase: "" },
    theme: "light",
    color_scheme: "blue",
    custom_color: "#3b82f6",
    font_family: "Inter",
    style_mode: "flat",
    company_logo: DEFAULT_LOGO,
    company_logo_type: "svg",
    updated_at: new Date().toISOString(),
  })

  const [isLoaded, setIsLoaded] = useState(true) // SIEMPRE listo
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSettingsReady, setIsSettingsReady] = useState(true) // SIEMPRE listo
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false)

  // Aplicar estilos inmediatamente
  useEffect(() => {
    applyThemeStyles(settings)
  }, [])

  // Cargar configuración desde BD SOLO UNA VEZ cuando el auth esté listo
  useEffect(() => {
    if (authLoading || hasLoadedFromDB) return

    const loadSettingsFromDB = async () => {
      try {
        console.log("🔄 [THEME] Cargando configuración desde BD...")

        const { createClient } = await import("@/lib/supabase")
        const supabase = createClient()

        // Cargar configuración global
        const { data: globalData } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", GLOBAL_SETTINGS_ID)
          .single()

        if (globalData) {
          console.log("✅ [THEME] Configuración global encontrada:", {
            projectName: globalData.project_name,
            customColor: globalData.custom_color,
            hasLogo: !!globalData.company_logo,
          })

          const loadedSettings: UserSettings = {
            id: globalData.id || "1",
            user_id: globalData.user_id || "global",
            project_name: globalData.project_name || "Civet",
            api_endpoint: globalData.api_endpoint || "",
            api_keys: globalData.api_keys || { openai: "", google_vision: "", supabase: "" },
            theme: globalData.theme || "light",
            color_scheme: globalData.color_scheme || "blue",
            custom_color: globalData.custom_color || "#3b82f6",
            font_family: globalData.font_family || "Inter",
            style_mode: globalData.style_mode || "flat",
            company_logo: globalData.company_logo || DEFAULT_LOGO,
            company_logo_type: globalData.company_logo_type || "svg",
            updated_at: globalData.updated_at || new Date().toISOString(),
          }

          setSettings(loadedSettings)
          applyThemeStyles(loadedSettings)
          console.log("🖼️ [THEME] Logo actualizado:", loadedSettings.company_logo ? "Presente" : "Usando default")
        } else {
          console.log("⚠️ [THEME] No se encontró configuración global, usando defaults")
        }
      } catch (error) {
        console.error("❌ [THEME] Error cargando configuración:", error)
      } finally {
        setHasLoadedFromDB(true)
        console.log("✅ [THEME] Carga de BD completada")
      }
    }

    // Pequeño delay para evitar conflictos con auth
    const timer = setTimeout(loadSettingsFromDB, 500)
    return () => clearTimeout(timer)
  }, [authLoading, hasLoadedFromDB])

  const applyThemeStyles = (settings: UserSettings) => {
    const primaryColor = settings.custom_color || "#3b82f6"

    console.log("🎨 [THEME] Aplicando estilos con color:", primaryColor)

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

    // FORZAR estilos con el color real
    const style = document.getElementById("dynamic-theme-styles") || document.createElement("style")
    style.id = "dynamic-theme-styles"
    style.textContent = `
    /* FORZAR COLOR REAL */
    button[type="submit"],
    .settings-save-button,
    button.bg-blue-600,
    button.bg-primary,
    .btn-primary,
    button[class*="bg-blue"],
    button[class*="bg-primary"] {
      background-color: ${primaryColor} !important;
      background: ${primaryColor} !important;
      color: #ffffff !important;
      border-color: ${primaryColor} !important;
    }
    
    button[type="submit"]:hover,
    .settings-save-button:hover,
    button.bg-blue-600:hover,
    button.bg-primary:hover,
    .btn-primary:hover,
    button[class*="bg-blue"]:hover,
    button[class*="bg-primary"]:hover {
      background-color: ${primaryColor}dd !important;
      background: ${primaryColor}dd !important;
      color: #ffffff !important;
    }
    
    /* Navegación activa */
    .sidebar-nav-active,
    [data-sidebar-nav-active="true"] {
      background-color: ${primaryColor} !important;
      color: white !important;
    }
    
    /* Iconos en botones */
    button[type="submit"] svg,
    .settings-save-button svg,
    button.bg-blue-600 svg,
    button.bg-primary svg,
    .btn-primary svg {
      color: #ffffff !important;
    }
  `

    if (!document.head.contains(style)) {
      document.head.appendChild(style)
    }

    console.log("✅ [THEME] Estilos aplicados")
  }

  const reloadSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const { createClient } = await import("@/lib/supabase")
      const supabase = createClient()

      const { data: globalData } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", GLOBAL_SETTINGS_ID)
        .single()

      if (globalData) {
        const loadedSettings: UserSettings = {
          id: globalData.id || "1",
          user_id: globalData.user_id || "global",
          project_name: globalData.project_name || "Civet",
          api_endpoint: globalData.api_endpoint || "",
          api_keys: globalData.api_keys || { openai: "", google_vision: "", supabase: "" },
          theme: globalData.theme || "light",
          color_scheme: globalData.color_scheme || "blue",
          custom_color: globalData.custom_color || "#3b82f6",
          font_family: globalData.font_family || "Inter",
          style_mode: globalData.style_mode || "flat",
          company_logo: globalData.company_logo || DEFAULT_LOGO,
          company_logo_type: globalData.company_logo_type || "svg",
          updated_at: globalData.updated_at || new Date().toISOString(),
        }
        setSettings(loadedSettings)
        applyThemeStyles(loadedSettings)
      }
    } catch (error) {
      console.error("Error recargando configuración:", error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Actualizando configuración:", updates)

    try {
      // Actualizar estado local inmediatamente
      const updatedSettings = { ...settings, ...updates }
      setSettings(updatedSettings)
      applyThemeStyles(updatedSettings)

      // Guardar en BD si es superadmin
      const isSuperAdmin = userRole === "superadmin"
      if (isSuperAdmin && user?.id) {
        await updateUserSettings(user.id, updates)
        console.log("✅ [THEME] Configuración guardada en BD")
      }
    } catch (error) {
      console.error("❌ [THEME] Error actualizando configuración:", error)
    }
  }

  const toggleTheme = async () => {
    const newTheme = settings.theme === "light" ? "dark" : "light"
    await updateSettings({ theme: newTheme })
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
      company_logo: DEFAULT_LOGO,
      company_logo_type: "svg",
    })
  }

  const isDark = settings.theme === "dark"
  const primaryColor = settings.custom_color || "#3b82f6"
  const companyLogo = settings.company_logo || DEFAULT_LOGO
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
