"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
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

// Configuración FIJA HARDCODEADA
const FIXED_SETTINGS: UserSettings = {
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
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userRole } = useAuth()
  const [settings] = useState<UserSettings>(FIXED_SETTINGS)

  // TODOS LOS ESTADOS FIJOS - SIN CAMBIOS
  const isLoaded = true
  const isLoadingSettings = false
  const isSettingsReady = true
  const isAdmin = userRole === "admin" || userRole === "superadmin"

  // VALORES FIJOS - SIN CAMBIOS
  const isDark = false
  const primaryColor = "#3b82f6"
  const companyLogo = DEFAULT_LOGO
  const logoType = "svg"
  const projectName = "Civet"

  // FUNCIONES QUE NO HACEN NADA - SOLO PARA COMPATIBILIDAD
  const updateSettings = async () => {
    console.log("✅ [THEME] Configuración actualizada (simulado)")
    return Promise.resolve()
  }

  const toggleTheme = async () => {
    console.log("✅ [THEME] Tema cambiado (simulado)")
  }

  const updateLogo = async () => {
    console.log("✅ [THEME] Logo actualizado (simulado)")
    return Promise.resolve()
  }

  const updateProjectName = async () => {
    console.log("✅ [THEME] Nombre actualizado (simulado)")
  }

  const removeLogo = async () => {
    console.log("✅ [THEME] Logo eliminado (simulado)")
  }

  const reloadSettings = async () => {
    console.log("✅ [THEME] Configuración recargada (simulado)")
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
