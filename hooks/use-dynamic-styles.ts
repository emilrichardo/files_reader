"use client"

import type React from "react"

import { useTheme } from "@/contexts/theme-context"

export function useDynamicStyles() {
  const { primaryColor, getOptimalTextColor, settings } = useTheme()

  const optimalTextColor = getOptimalTextColor(primaryColor)

  const getPrimaryButtonStyles = () => ({
    backgroundColor: primaryColor,
    color: optimalTextColor,
  })

  const getCardStyles = () => {
    const baseStyles: React.CSSProperties = {}

    switch (settings.style_mode) {
      case "glass":
        return {
          ...baseStyles,
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }
      case "neumorphism":
        return {
          ...baseStyles,
          background: "#f0f0f0",
          boxShadow: "5px 5px 10px #bebebe, -5px -5px 10px #ffffff",
          border: "none",
        }
      case "brutalist":
        return {
          ...baseStyles,
          border: "2px solid black",
          borderRadius: "0",
          boxShadow: "5px 5px 0px 0px rgba(0, 0, 0, 1)",
        }
      case "border":
        return {
          ...baseStyles,
          border: `2px solid ${primaryColor}`,
          borderRadius: "0.75rem",
        }
      default:
        return baseStyles
    }
  }

  const getDataAttributes = (type: "button" | "card" | "input" | "select") => {
    return {
      [`data-${type}`]: "true",
    }
  }

  return {
    primaryColor,
    optimalTextColor,
    getPrimaryButtonStyles,
    getCardStyles,
    getDataAttributes,
    styleMode: settings.style_mode,
  }
}
