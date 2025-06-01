"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Plus, Layout, Settings, LogOut, Menu, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signInWithGoogle, signOut, loading, isSuperAdmin } = useAuth()
  const { projectName, companyLogo, primaryColor, isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Cerrar el sidebar en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Función auxiliar para determinar si un color es oscuro
  const getOptimalTextColor = (bgColor: string) => {
    // Si no hay color, usar blanco por defecto
    if (!bgColor) return "#ffffff"

    // Convertir hex a RGB
    let r = 0,
      g = 0,
      b = 0

    // Verificar formato #RRGGBB
    if (bgColor.startsWith("#") && bgColor.length === 7) {
      r = Number.parseInt(bgColor.slice(1, 3), 16)
      g = Number.parseInt(bgColor.slice(3, 5), 16)
      b = Number.parseInt(bgColor.slice(5, 7), 16)
    } else {
      // Color por defecto si el formato no es válido
      return "#ffffff"
    }

    // Calcular luminosidad
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Retornar blanco para colores oscuros, negro para colores claros
    return luminance > 0.5 ? "#000000" : "#ffffff"
  }

  const optimalTextColor = getOptimalTextColor(primaryColor)

  const navItems = [
    {
      name: "Inicio",
      href: "/",
      icon: Home,
      requiresAuth: false,
      requiresSuperAdmin: false,
    },
    {
      name: "Documentos",
      href: "/documents",
      icon: FileText,
      requiresAuth: true,
      requiresSuperAdmin: false,
    },
    {
      name: "Crear Documento",
      href: "/documents/create",
      icon: Plus,
      requiresAuth: false,
      requiresSuperAdmin: false,
    },
    {
      name: "Plantillas",
      href: "/templates",
      icon: Layout,
      requiresAuth: true,
      requiresSuperAdmin: false,
    },
    {
      name: "Usuarios",
      href: "/users",
      icon: Users,
      requiresAuth: true,
      requiresSuperAdmin: true,
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      requiresAuth: true,
      requiresSuperAdmin: false,
    },
  ]

  // Filtrar elementos de navegación según el estado de autenticación y permisos
  const filteredNavItems = navItems.filter((item) => {
    // Si requiere autenticación y no hay usuario, no mostrar
    if (item.requiresAuth && !user) return false

    // Si requiere SuperAdmin y no es SuperAdmin, no mostrar
    if (item.requiresSuperAdmin && !isSuperAdmin) return false

    return true
  })

  // Clases dinámicas para dark mode
  const sidebarBg = isDark ? "bg-gray-900" : "bg-white"
  const sidebarBorder = isDark ? "border-gray-700" : "border-gray-200"
  const textColor = isDark ? "text-gray-100" : "text-gray-900"
  const textColorSecondary = isDark ? "text-gray-300" : "text-gray-700"
  const textColorMuted = isDark ? "text-gray-400" : "text-gray-500"
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const activeBg = isDark ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"

  return (
    <>
      {/* Mobile Header - SIEMPRE VISIBLE EN MOBILE */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 h-14 ${sidebarBg} border-b ${sidebarBorder} flex items-center justify-between px-4 z-50`}
      >
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="mr-2"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className={`font-semibold text-lg ${textColor}`}>{projectName}</span>
        </div>

        {!loading && user && (
          <div className="flex items-center">
            <span className={`text-sm mr-2 max-w-[100px] truncate ${textColor}`}>{user.name || user.email}</span>
            <div
              className={`w-8 h-8 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}
            >
              <span className={`text-sm font-medium ${textColor}`}>{user.email?.[0]?.toUpperCase() || "U"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 ${sidebarBg} border-r ${sidebarBorder} z-50 transform transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${sidebarBorder}`}>
          <div className="flex items-center">
            {companyLogo ? (
              <img src={companyLogo || "/placeholder.svg"} alt="Logo" className="h-8 w-8 mr-2" />
            ) : (
              <div
                className="h-8 w-8 rounded-md flex items-center justify-center mr-2 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <FileText className="h-4 w-4" />
              </div>
            )}
            <span className={`font-semibold ${textColor}`}>{projectName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  pathname === item.href ? `${activeBg} font-medium` : `${textColorSecondary} ${hoverBg}`
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
                {item.requiresSuperAdmin && (
                  <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">SA</span>
                )}
              </Link>
            ))}
          </nav>

          <div className={`mt-6 pt-6 border-t ${sidebarBorder}`}>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div
                  className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDark ? "border-gray-100" : "border-gray-900"}`}
                ></div>
              </div>
            ) : user ? (
              <div>
                <div className="flex items-center px-3 py-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center mr-3`}
                  >
                    <span className={`font-medium ${textColor}`}>{user.email?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textColor}`}>{user.name || user.email}</p>
                    <p className={`text-xs ${textColorMuted} truncate`}>{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button
                className="w-full justify-start"
                style={{ backgroundColor: primaryColor, color: optimalTextColor }}
                onClick={() => {
                  signInWithGoogle()
                  setIsOpen(false)
                }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-64 min-h-screen ${sidebarBg} border-r ${sidebarBorder} fixed top-0 left-0`}>
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b ${sidebarBorder}`}>
            <div className="flex items-center">
              {companyLogo ? (
                <img src={companyLogo || "/placeholder.svg"} alt="Logo" className="h-8 w-8 mr-2" />
              ) : (
                <div
                  className="h-8 w-8 rounded-md flex items-center justify-center mr-2 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FileText className="h-4 w-4" />
                </div>
              )}
              <span className={`font-semibold ${textColor}`}>{projectName}</span>
            </div>
          </div>

          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    pathname === item.href ? `${activeBg} font-medium` : `${textColorSecondary} ${hoverBg}`
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.requiresSuperAdmin && (
                    <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">SA</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className={`p-4 border-t ${sidebarBorder}`}>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div
                  className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDark ? "border-gray-100" : "border-gray-900"}`}
                ></div>
              </div>
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center mr-2 flex-shrink-0`}
                  >
                    <span className={`font-medium ${textColor}`}>{user.email?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${textColor}`}>{user.name || user.email}</p>
                    <p className={`text-xs ${textColorMuted} truncate`}>{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-red-600 flex-shrink-0">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full justify-start"
                style={{ backgroundColor: primaryColor, color: optimalTextColor }}
                onClick={signInWithGoogle}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
