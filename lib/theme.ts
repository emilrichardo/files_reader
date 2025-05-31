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
