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

// UUID fijo para configuración global
const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001"

// Settings por defecto MÍNIMOS
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
  color_scheme: "blue", // Cambiar a azul por defecto
  custom_color: "#3b82f6", // Azul por defecto
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

// Funciones auxiliares
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "59, 130, 246" // RGB para azul por defecto

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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [settingsInitialized, setSettingsInitialized] = useState(false)
  const [isSettingsReady, setIsSettingsReady] = useState(false)

  // Initialize
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Cargar configuración automáticamente
  useEffect(() => {
    if (settingsInitialized || authLoading) {
      return
    }

    setSettingsInitialized(true)
    loadGlobalSettings()
  }, [authLoading, settingsInitialized])

  const loadGlobalSettings = async () => {
    setIsLoadingSettings(true)
    setIsSettingsReady(false)

    try {
      console.log("🎨 [THEME] Loading global configuration...")

      // Cargar configuración global
      const { data: globalSettings, error } = await getGlobalSettings()

      if (error) {
        console.log("⚠️ [THEME] Error loading global settings:", error.message)
      }

      if (globalSettings && !error) {
        console.log("✅ [THEME] Global settings loaded successfully:")
        console.log("🎨 [THEME] - Project name:", globalSettings.project_name)
        console.log("🎨 [THEME] - Color scheme:", globalSettings.color_scheme)
        console.log("🎨 [THEME] - Custom color:", globalSettings.custom_color)
        console.log("🖼️ [THEME] - Company logo:", globalSettings.company_logo ? "Present" : "Not found")
      } else {
        console.log("⚠️ [THEME] No global settings found, using defaults")
      }

      // Cargar tema personal si hay usuario autenticado
      let personalTheme = globalSettings?.theme || defaultSettings.theme

      if (user) {
        try {
          console.log("🎨 [THEME] Loading personal theme for user:", user.id)
          const { data: userSettings } = await getUserSettings(user.id)

          if (userSettings?.theme) {
            personalTheme = userSettings.theme
            console.log("✅ [THEME] Personal theme loaded:", personalTheme)
          }
        } catch (error) {
          console.log("⚠️ [THEME] Error loading personal theme, using global/default")
        }
      }

      // Combinar configuraciones con valores por defecto seguros
      const finalSettings: UserSettings = {
        ...defaultSettings,
        ...(globalSettings || {}),
        theme: personalTheme,
        user_id: user?.id || "public",
        // Asegurar valores por defecto seguros
        project_name: globalSettings?.project_name || defaultSettings.project_name,
        api_endpoint: globalSettings?.api_endpoint || defaultSettings.api_endpoint,
        color_scheme: globalSettings?.color_scheme || defaultSettings.color_scheme,
        custom_color: globalSettings?.custom_color || defaultSettings.custom_color,
        company_logo: globalSettings?.company_logo || "",
        company_logo_type: globalSettings?.company_logo_type || undefined,
      }

      console.log("✅ [THEME] Final settings applied:")
      console.log("🏢 [THEME] - Project Name:", finalSettings.project_name)
      console.log("🎨 [THEME] - Color Scheme:", finalSettings.color_scheme)
      console.log("🎨 [THEME] - Custom Color:", finalSettings.custom_color)
      console.log("🖼️ [THEME] - Company Logo:", finalSettings.company_logo ? "Present" : "Not found")

      setSettings(finalSettings)
      applyThemeStyles(finalSettings)
      setIsSettingsReady(true)
      setIsLoadingSettings(false)

      console.log("✅ [THEME] Settings ready and applied")
    } catch (error) {
      console.error("❌ [THEME] Error loading settings:", error)

      // En caso de error, usar configuración por defecto
      const fallbackSettings = {
        ...defaultSettings,
        user_id: user?.id || "public",
      }
      setSettings(fallbackSettings)
      applyThemeStyles(fallbackSettings)
      setIsSettingsReady(true)
      setIsLoadingSettings(false)
    }
  }

  // Función para aplicar estilos CSS dinámicamente
  const applyThemeStyles = (settings: UserSettings) => {
    // Determinar color primario con fallback seguro
    let primaryColor = settings.custom_color

    if (!primaryColor) {
      primaryColor = colorSchemes[settings.color_scheme as keyof typeof colorSchemes]
    }

    if (!primaryColor) {
      primaryColor = colorSchemes.blue // Fallback final
    }

    console.log("🎨 [THEME] Applying CSS styles:")
    console.log("🎨 [THEME] - Custom color:", settings.custom_color)
    console.log("🎨 [THEME] - Color scheme:", settings.color_scheme)
    console.log("🎨 [THEME] - Final primary color:", primaryColor)

    // Aplicar variables CSS al documento
    const root = document.documentElement
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--font-family", settings.font_family || "Inter")

    // Aplicar clase de tema
    if (settings.theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }

    // Aplicar estilos específicos
    const style = document.getElementById("dynamic-theme-styles") || document.createElement("style")
    style.id = "dynamic-theme-styles"
    style.textContent = `
      :root {
        --primary: ${primaryColor};
        --primary-rgb: ${hexToRgb(primaryColor)};
      }

      /* Elementos de navegación activos en sidebar */
      .sidebar-nav-active,
      [data-sidebar-nav-active="true"] {
        background-color: ${primaryColor} !important;
        color: ${getOptimalTextColor(primaryColor)} !important;
      }

      /* Botones primarios específicos */
      .btn-primary, 
      button[data-primary="true"],
      .button-primary,
      .settings-save-button {
        background-color: ${primaryColor} !important;
        color: ${getOptimalTextColor(primaryColor)} !important;
        border-color: ${primaryColor} !important;
      }

      .settings-save-button:hover {
        background-color: ${primaryColor}dd !important;
      }

      /* Enlaces que específicamente deben usar el color primario */
      .link-primary {
        color: ${primaryColor} !important;
      }

      /* Elementos con clase específica para color primario */
      .text-primary-custom { 
        color: ${primaryColor} !important; 
      }
      
      .bg-primary-custom { 
        background-color: ${primaryColor} !important; 
        color: ${getOptimalTextColor(primaryColor)} !important;
      }

      .border-primary-custom { 
        border-color: ${primaryColor} !important; 
      }

      /* Elementos activos específicos */
      .nav-item-active {
        background-color: ${primaryColor} !important;
        color: ${getOptimalTextColor(primaryColor)} !important;
      }
    `

    if (!document.head.contains(style)) {
      document.head.appendChild(style)
    }

    console.log("✅ [THEME] CSS styles applied with color:", primaryColor)
  }

  const reloadSettings = async () => {
    console.log("🔄 [THEME] Manually reloading settings...")
    setSettingsInitialized(false)
    await loadGlobalSettings()
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Updating settings:", updates)

    try {
      const isSuperAdmin = userRole === "superadmin"
      console.log("🔍 [THEME] User role:", userRole, "Is superadmin:", isSuperAdmin)

      if (isSuperAdmin) {
        console.log("💾 [THEME] Superadmin updating global settings")

        // Guardar configuración global
        const { data, error } = await updateUserSettings(GLOBAL_SETTINGS_ID, updates)

        if (error) {
          console.error("❌ [THEME] Error saving global settings:", error)
          throw new Error("Error al guardar la configuración global")
        }

        console.log("✅ [THEME] Global settings saved successfully:", data)

        // Actualizar estado local inmediatamente
        const updatedSettings = {
          ...settings,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        applyThemeStyles(updatedSettings)

        // Recargar después de un breve delay
        setTimeout(() => {
          reloadSettings()
        }, 500)
      } else if (user) {
        // Usuario normal solo puede cambiar su tema personal
        const personalUpdates = { theme: updates.theme }
        console.log("💾 [THEME] User updating personal theme:", personalUpdates)

        const { data, error } = await updateUserSettings(user.id, personalUpdates)

        if (error) {
          throw new Error("Error al guardar el tema personal")
        }

        console.log("✅ [THEME] Personal theme saved successfully:", data)

        // Actualizar estado local
        const updatedSettings = {
          ...settings,
          ...personalUpdates,
          updated_at: new Date().toISOString(),
        }
        setSettings(updatedSettings)
        applyThemeStyles(updatedSettings)
      } else {
        // Usuario público solo puede cambiar tema localmente
        console.log("💾 [THEME] Public user updating theme locally")
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

      const maxSize = 5 * 1024 * 1024 // 5MB
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

  // Calcular color primario con fallback seguro
  const primaryColor =
    settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || colorSchemes.blue

  const companyLogo = settings.company_logo || null
  const logoType = settings.company_logo_type || null
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
