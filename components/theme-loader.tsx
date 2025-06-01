"use client"

import { useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"

export function ThemeLoader() {
  const { settings, primaryColor, isDark, isLoaded, projectName, companyLogo, logoType } = useTheme()

  useEffect(() => {
    if (!isLoaded) return

    // Aplicar variables CSS para el tema
    const root = document.documentElement

    // Color primario
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--primary-rgb", primaryColor.replace("#", ""))

    // Modo claro/oscuro
    if (isDark) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }

    // Fuente
    if (settings.font_family) {
      root.style.setProperty("--font-family", `"${settings.font_family}", sans-serif`)

      // Cargar fuente si no está en las fuentes del sistema
      const systemFonts = [
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Times",
        "Courier New",
        "Courier",
        "Verdana",
        "Georgia",
        "Palatino",
        "Garamond",
        "Bookman",
        "Tahoma",
        "Trebuchet MS",
        "Arial Black",
        "Impact",
        "Comic Sans MS",
      ]

      if (!systemFonts.includes(settings.font_family)) {
        const fontLink = document.createElement("link")
        fontLink.rel = "stylesheet"
        fontLink.href = `https://fonts.googleapis.com/css2?family=${settings.font_family.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`
        document.head.appendChild(fontLink)
      }
    }

    // Estilo (flat, etc)
    if (settings.style_mode) {
      document.body.setAttribute("data-style", settings.style_mode)
    }

    // Actualizar título de la página
    if (projectName) {
      document.title = projectName
    }

    // Favicon (si hay logo)
    if (companyLogo && logoType === "svg") {
      const link = document.querySelector("link[rel*='icon']") || document.createElement("link")
      link.type = "image/svg+xml"
      link.rel = "shortcut icon"
      link.href = companyLogo
      document.getElementsByTagName("head")[0].appendChild(link)
    }

    console.log("🎨 Theme loaded:", {
      primaryColor,
      isDark,
      font: settings.font_family,
      style: settings.style_mode,
      projectName,
    })
  }, [isLoaded, primaryColor, isDark, settings.font_family, settings.style_mode, projectName, companyLogo, logoType])

  return null
}
