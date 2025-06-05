export const customTheme = {
  primary: "#000000",
  primaryDark: "#1a1a1a",
  primaryLight: "#333333",
  background: "#ffffff",
  backgroundDark: "#0a0a0a",
  surface: "#f8f9fa",
  surfaceDark: "#1a1a1a",
  text: "#1a1a1a",
  textDark: "#ffffff",
  textSecondary: "#6b7280",
  textSecondaryDark: "#9ca3af",
  border: "#e5e7eb",
  borderDark: "#374151",
}

export const getThemeColors = (isDark: boolean) => ({
  primary: customTheme.primary,
  background: isDark ? customTheme.backgroundDark : customTheme.background,
  surface: isDark ? customTheme.surfaceDark : customTheme.surface,
  text: isDark ? customTheme.textDark : customTheme.text,
  textSecondary: isDark ? customTheme.textSecondaryDark : customTheme.textSecondary,
  border: isDark ? customTheme.borderDark : customTheme.border,
})

// Generate CSS variables for theme - SIMPLE VERSION
export function generateCssVariables(config: {
  primaryColor: string
  colorScheme: string
  theme: "light" | "dark"
  styleMode: "flat" | "soft" | "glass"
}): string {
  const { primaryColor } = config
  const actualColor = primaryColor || "#3b82f6"

  return `
  --primary-color: ${actualColor};
  --primary-rgb: ${
    actualColor
      .replace("#", "")
      .match(/.{2}/g)
      ?.map((x) => Number.parseInt(x, 16))
      .join(", ") || "59, 130, 246"
  };
`
}
