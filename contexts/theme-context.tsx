"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getUserSettings, updateUserSettings, getGlobalSettings, getSuperAdminSettings } from "@/lib/database"
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
  loadUserSettings: (userId: string) => Promise<void>
  isLoadingSettings: boolean
  isAdmin: boolean
  forceReload: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultSettings: UserSettings = {
  id: "1",
  user_id: "demo-user",
  project_name: "Invitu",
  api_endpoint: "",
  api_keys: {
    openai: "",
    google_vision: "",
    supabase: "",
  },
  theme: "light",
  color_scheme: "black",
  custom_color: "",
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
  if (!result) return "0, 0, 0"

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
  const { user, isSuperAdmin, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)

  // Initialize
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Cargar configuración cuando el usuario cambie o al inicio
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log("🎨 [THEME] User authenticated, loading settings for:", user.email)
        loadUserSettings(user.id)
      } else {
        console.log("🎨 [THEME] No user, loading global settings")
        loadGlobalSettingsForPublic()
      }
    }
  }, [user, authLoading])

  // Función para cargar configuración global para usuarios públicos
  const loadGlobalSettingsForPublic = async () => {
    if (isLoadingSettings) return

    setIsLoadingSettings(true)
    try {
      console.log("🌍 [THEME] Loading global settings for public user")

      // Usar la nueva función getGlobalSettings que prioriza configuración de superadmin
      const { data: globalSettings } = await getGlobalSettings()

      if (globalSettings) {
        console.log("✅ [THEME] Global settings loaded for public:", globalSettings)
        const mergedSettings = {
          ...defaultSettings,
          ...globalSettings,
          user_id: "public",
        }
        setSettings(mergedSettings)
      } else {
        console.log("⚠️ [THEME] No global settings found, using defaults")
        setSettings({ ...defaultSettings, user_id: "public" })
      }
    } catch (error) {
      console.error("❌ [THEME] Error loading global settings:", error)
      setSettings({ ...defaultSettings, user_id: "public" })
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const loadUserSettings = async (userId: string) => {
    // Permitir carga si no está cargando actualmente
    if (isLoadingSettings) {
      console.log("🎨 [THEME] Settings currently loading, skipping...")
      return
    }

    setIsLoadingSettings(true)

    try {
      console.log("🎨 [THEME] Loading user settings for:", userId, "isSuperAdmin:", isSuperAdmin)

      let settingsData = null

      if (isSuperAdmin) {
        // Si es superadmin, cargar sus propias configuraciones
        console.log("👑 [THEME] Loading superadmin's own settings")
        const { data: userSettings } = await getUserSettings(userId)
        settingsData = userSettings
      } else {
        // Si no es superadmin, cargar configuración de superadmin
        console.log("🌍 [THEME] Loading superadmin settings for regular user")
        const { data: superAdminSettings } = await getSuperAdminSettings()
        if (superAdminSettings) {
          console.log("✅ [THEME] Superadmin settings found:", superAdminSettings)
          settingsData = superAdminSettings
        } else {
          console.log("⚠️ [THEME] No superadmin settings found, trying global settings")
          const { data: globalSettings } = await getGlobalSettings()
          settingsData = globalSettings
        }
      }

      if (settingsData) {
        console.log("✅ [THEME] Settings loaded successfully:", settingsData)
        const mergedSettings = {
          ...defaultSettings,
          ...settingsData,
          api_keys: settingsData.api_keys || {},
          user_id: userId,
        }
        setSettings(mergedSettings)
      } else {
        console.log("⚠️ [THEME] No settings found, using defaults")
        const newSettings = { ...defaultSettings, user_id: userId }
        setSettings(newSettings)
      }
    } catch (error) {
      console.error("❌ [THEME] Error in loadUserSettings:", error)
      setSettings({ ...defaultSettings, user_id: userId })
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const forceReload = () => {
    console.log("🔄 [THEME] Force reload requested")
    setIsLoadingSettings(false)
    if (user) {
      loadUserSettings(user.id)
    } else {
      loadGlobalSettingsForPublic()
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("🔧 [THEME] Attempting to update settings:", updates)
    console.log("🔧 [THEME] Current user:", user?.email, "isSuperAdmin:", isSuperAdmin)

    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Verificar que sea superadmin
      if (!isSuperAdmin) {
        throw new Error("Solo los superadministradores pueden cambiar la configuración")
      }

      console.log("💾 [THEME] Saving settings to database for user:", user.id)

      // Actualizar en la base de datos
      const { data, error } = await updateUserSettings(user.id, updates)

      if (error) {
        console.error("❌ [THEME] Database error:", error)
        throw error
      }

      console.log("✅ [THEME] Settings saved to database successfully:", data)

      // Actualizar estado local después de guardar exitosamente
      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      setSettings(updatedSettings)
      console.log("✅ [THEME] Local settings updated:", updatedSettings)
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
      // Validar tipo de archivo
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]
      if (!allowedTypes.includes(file.type)) {
        reject(new Error("Formato de archivo no soportado. Use JPG, PNG o SVG."))
        return
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        reject(new Error("El archivo es demasiado grande. Máximo 5MB."))
        return
      }

      const reader = new FileReader()

      reader.onload = async (e) => {
        const result = e.target?.result as string
        if (result) {
          // Determinar el tipo de logo
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
      const newName = name.trim() || "Invitu"
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
    settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || colorSchemes.black
  const companyLogo = settings.company_logo || null
  const logoType = settings.company_logo_type || null
  const projectName = settings.project_name || "Invitu"

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
        loadUserSettings,
        isLoadingSettings,
        isAdmin: isSuperAdmin,
        forceReload,
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
