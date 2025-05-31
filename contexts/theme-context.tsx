"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { UserSettings } from "@/lib/types"

interface ThemeContextType {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "docmanager_user_settings"

const defaultSettings: UserSettings = {
  id: "1",
  user_id: "demo-user",
  project_name: "DocManager",
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar configuraciones del localStorage al inicializar
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Asegurar que el project_name existe para configuraciones antiguas
        if (!parsed.project_name) {
          parsed.project_name = "DocManager"
        }
        setSettings(parsed)
      }
    } catch (error) {
      console.error("Error loading theme settings:", error)
    }
    setIsLoaded(true)
  }, [])

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

    // Aplicar color primario (usar color personalizado si existe)
    const primaryColor =
      settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || colorSchemes.black

    // Actualizar variables CSS personalizadas
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--primary-rgb", hexToRgb(primaryColor))

    // Aplicar color de texto óptimo como variable CSS
    const optimalTextColor = getOptimalTextColor(primaryColor)
    root.style.setProperty("--optimal-text-color", optimalTextColor)

    // Aplicar el modo de estilo al elemento raíz
    root.setAttribute("data-style-mode", settings.style_mode)

    // Aplicar variables CSS adicionales para los estilos
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--primary-rgb", hexToRgb(primaryColor))
    root.style.setProperty("--optimal-text-color", optimalTextColor)

    // Actualizar variables CSS de shadcn/ui para el color primario
    if (settings.theme === "dark") {
      root.style.setProperty("--primary", rgbToHsl(hexToRgb(primaryColor)))
      root.style.setProperty("--primary-foreground", "0 0% 98%")
    } else {
      root.style.setProperty("--primary", rgbToHsl(hexToRgb(primaryColor)))
      root.style.setProperty("--primary-foreground", "0 0% 98%")
    }

    // Aplicar fuente
    document.body.style.fontFamily = `"${settings.font_family}", sans-serif`

    // Aplicar estilo visual
    root.setAttribute("data-style-mode", settings.style_mode)

    // Actualizar el título de la página
    document.title = `${settings.project_name} - Document Management System`

    // Cargar la fuente de Google si no es Inter (que ya está incluida)
    if (settings.font_family !== "Inter" && !document.getElementById(`google-font-${settings.font_family}`)) {
      const link = document.createElement("link")
      link.id = `google-font-${settings.font_family}`
      link.rel = "stylesheet"
      link.href = `https://fonts.googleapis.com/css2?family=${settings.font_family.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`
      document.head.appendChild(link)
    }

    // Guardar configuraciones en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, isLoaded])

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    }))
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

      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          // Determinar el tipo de logo basado en el tipo MIME
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

          setSettings((prev) => ({
            ...prev,
            company_logo: result,
            company_logo_type: logoType,
            updated_at: new Date().toISOString(),
          }))
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
    const newName = name.trim() || "DocManager"
    setSettings((prev) => ({
      ...prev,
      project_name: newName,
      updated_at: new Date().toISOString(),
    }))
  }

  const removeLogo = () => {
    setSettings((prev) => ({
      ...prev,
      company_logo: "",
      company_logo_type: undefined,
      updated_at: new Date().toISOString(),
    }))
  }

  const isDark = settings.theme === "dark"
  const primaryColor =
    settings.custom_color || colorSchemes[settings.color_scheme as keyof typeof colorSchemes] || colorSchemes.black
  const companyLogo = settings.company_logo || null
  const logoType = settings.company_logo_type || null
  const projectName = settings.project_name || "DocManager"

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

// Funciones auxiliares para conversión de colores
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "0, 0, 0"

  const r = Number.parseInt(result[1], 16)
  const g = Number.parseInt(result[2], 16)
  const b = Number.parseInt(result[3], 16)

  return `${r}, ${g}, ${b}`
}

function rgbToHsl(rgb: string): string {
  const [r, g, b] = rgb.split(", ").map((x) => Number.parseInt(x) / 255)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Agregar estas funciones auxiliares después de las funciones existentes de conversión de colores

// Función para calcular la luminosidad de un color
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

// Función para determinar si un color es claro u oscuro
function isLightColorFn(hex: string): boolean {
  return getLuminance(hex) > 0.5
}

// Función para obtener el color de texto óptimo basado en el fondo
function getOptimalTextColorFn(backgroundColor: string): string {
  return isLightColorFn(backgroundColor) ? "#000000" : "#ffffff"
}

// Función para obtener un color de contraste
function getContrastColorFn(hex: string, lightColor = "#ffffff", darkColor = "#000000"): string {
  return isLightColorFn(hex) ? darkColor : lightColor
}
