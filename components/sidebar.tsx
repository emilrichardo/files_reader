"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Layout, Settings, LogOut, LogIn, Menu, X, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signInWithGoogle, signInWithGitHub, signOut } = useAuth()
  const { projectName, companyLogo, primaryColor, getOptimalTextColor } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Cerrar el sidebar en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden z-50">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">{projectName}</span>
        </div>
        {user ? (
          <div className="flex items-center">
            <span className="text-sm mr-2">{user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAuthOpen(!isAuthOpen)}
              className="rounded-full w-8 h-8 overflow-hidden"
            >
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <span className="text-sm font-medium">{user.name[0]}</span>
              </div>
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthOpen(!isAuthOpen)}
            className="flex items-center text-xs"
          >
            <LogIn className="h-3.5 w-3.5 mr-1" />
            Iniciar Sesión
          </Button>
        )}
      </div>

      {/* Mobile Auth Dropdown */}
      {isAuthOpen && (
        <div className="fixed top-14 right-0 w-64 bg-white border border-gray-200 shadow-lg rounded-bl-lg z-50 lg:hidden">
          <div className="p-4">
            {user ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    signOut()
                    setIsAuthOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    signInWithGoogle()
                    setIsAuthOpen(false)
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    signInWithGitHub()
                    setIsAuthOpen(false)
                  }}
                >
                  <Github className="h-4 w-4 mr-2" />
                  Continuar con GitHub
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 lg:hidden ${
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
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
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
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            {user ? (
              <div>
                <div className="flex items-center px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <span className="font-medium">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
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
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  style={{ backgroundColor: primaryColor, color: optimalTextColor }}
                  onClick={() => {
                    signInWithGoogle()
                    setIsOpen(false)
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    signInWithGitHub()
                    setIsOpen(false)
                  }}
                >
                  <Github className="h-4 w-4 mr-2" />
                  Continuar con GitHub
                </Button>
              </div>
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
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="font-medium">{user.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[120px]">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  style={{ backgroundColor: primaryColor, color: optimalTextColor }}
                  onClick={signInWithGoogle}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={signInWithGitHub}>
                  <Github className="h-4 w-4 mr-2" />
                  Continuar con GitHub
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
