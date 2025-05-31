"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Plus, Layout, Settings, LogOut, LogIn, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signInWithGoogle, signOut, loading } = useAuth()
  const { projectName, companyLogo, primaryColor } = useTheme()
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
    },
    {
      name: "Documentos",
      href: "/documents",
      icon: FileText,
      requiresAuth: true,
    },
    {
      name: "Crear Documento",
      href: "/documents/create",
      icon: Plus,
      requiresAuth: false,
    },
    {
      name: "Plantillas",
      href: "/templates",
      icon: Layout,
      requiresAuth: true,
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      requiresAuth: true,
    },
  ]

  // Filtrar elementos de navegación según el estado de autenticación
  const filteredNavItems = navItems.filter((item) => !item.requiresAuth || user !== null)

  return (
    <>
      {/* Mobile Header - SIEMPRE VISIBLE EN MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
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
          <span className="font-semibold text-lg">{projectName}</span>
        </div>

        {!loading && user && (
          <div className="flex items-center">
            <span className="text-sm mr-2 max-w-[100px] truncate">{user.name || user.email}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">{user.email?.[0]?.toUpperCase() || "U"}</span>
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
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
            <span className="font-semibold">{projectName}</span>
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
                  pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : user ? (
              <div>
                <div className="flex items-center px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium">{user.email?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen bg-white border-r border-gray-200 fixed top-0 left-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
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
              <span className="font-semibold">{projectName}</span>
            </div>
          </div>

          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="font-medium">{user.email?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
