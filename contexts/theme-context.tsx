"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getUserSettings, updateUserSettings } from "@/lib/database"
import type { UserSettings } from "@/lib/types"

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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Function to load user settings
  const loadUserSettings = async (userId: string) => {
    try {
      console.log("Loading user settings for:", userId)
      const { data, error } = await getUserSettings(userId)

      if (error) {
        console.error("Error loading user settings:", error)
        // Para usuarios autenticados, usar configuraciones por defecto
        setSettings({ ...defaultSettings, user_id: userId })
      } else if (data) {
        console.log("User settings loaded from database:", data)
        const mergedSettings = {
          ...defaultSettings,
          ...data,
          api_keys: data.api_keys || {},
        }
        setSettings(mergedSettings)
      } else {
        // No hay configuraciones, crear las por defecto
        const newSettings = { ...defaultSettings, user_id: userId }
        try {
          await updateUserSettings(userId, newSettings)
          setSettings(newSettings)
        } catch (createError) {
          console.error("Error creating default settings:", createError)
          setSettings(newSettings)
        }
      }
    } catch (error) {
      console.error("Error in loadUserSettings:", error)
      setSettings({ ...defaultSettings, user_id: userId })
    }
  }

  // Aplicar tema cuando cambie
  useEffect(() => {
    if (!isLoaded) return

    const root = document.documentElement

    // Aplicar tema oscuro/claro
    if (settings.theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Aplicar color primario
    const primaryColor =
      settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || colorSchemes.black

    // Actualizar variables CSS personalizadas
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--primary-rgb", hexToRgb(primaryColor))

    // Aplicar color de texto óptimo
    const optimalTextColor = getOptimalTextColor(primaryColor)
    root.style.setProperty("--optimal-text-color", optimalTextColor)

    // Aplicar el modo de estilo
    root.setAttribute("data-style-mode", settings.style_mode)

    // Aplicar fuente
    document.body.style.fontFamily = `"${settings.font_family}", sans-serif`

    // Actualizar el título de la página
    document.title = `${settings.project_name} - Document Management System`

    // Cargar la fuente de Google si no es Inter
    if (settings.font_family !== "Inter" && !document.getElementById(`google-font-${settings.font_family}`)) {
      const link = document.createElement("link")
      link.id = `google-font-${settings.font_family}`
      link.rel = "stylesheet"
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font_family.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`
      document.head.appendChild(link)
    }

    console.log("Settings applied:", settings)
  }, [settings, isLoaded])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    console.log("Updating settings:", updates)
    const updatedSettings = { ...settings, ...updates, updated_at: new Date().toISOString() }

    // Actualizar estado local inmediatamente
    setSettings(updatedSettings)

    // Solo guardar en la base de datos si hay usuario autenticado
    if (settings.user_id && settings.user_id !== "demo-user") {
      try {
        console.log("Saving settings to database for user:", settings.user_id)
        const { error } = await updateUserSettings(settings.user_id, updates)
        if (error) {
          console.error("Error updating settings in database:", error)
        } else {
          console.log("Settings saved to database successfully")
        }
      } catch (error) {
        console.error("Error updating settings:", error)
      }
    } else {
      console.log("No authenticated user, settings not persisted")
    }
  }

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === "light" ? "dark" : "light",
    })
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

          await updateSettings({
            company_logo: result,
            company_logo_type: logoType,
          })
          resolve()
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

  const updateProjectName = (name: string) => {
    const newName = name.trim() || "Invitu"
    updateSettings({ project_name: newName })
  }

  const removeLogo = () => {
    updateSettings({
      company_logo: "",
      company_logo_type: undefined,
    })
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
