"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { FileText, LayoutTemplateIcon as Template, Users, Settings, Menu, LogOut, Home } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut, signInWithGoogle, userRole } = useAuth()
  const { companyLogo, projectName, primaryColor } = useTheme()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  console.log("🖼️ [SIDEBAR] Rendering with logo:", companyLogo ? "Present" : "Missing")
  console.log("🖼️ [SIDEBAR] Logo preview:", companyLogo?.substring(0, 50))

  // Navegación dinámica basada en el rol del usuario
  const getNavigation = () => {
    const baseNavigation = [
      { name: "Inicio", href: "/", icon: Home },
      { name: "Documentos", href: "/documents", icon: FileText },
      { name: "Plantillas", href: "/templates", icon: Template },
    ]

    if (!user) {
      return baseNavigation
    }

    const authenticatedNavigation = [...baseNavigation]

    if (userRole === "admin" || userRole === "superadmin") {
      authenticatedNavigation.push({ name: "Usuarios", href: "/users", icon: Users })
    }

    authenticatedNavigation.push({ name: "Configuración", href: "/settings", icon: Settings })

    return authenticatedNavigation
  }

  const navigation = getNavigation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header con logo y nombre */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3">
          {/* Logo - FORZAR que se muestre */}
          <div className="h-8 w-8 flex-shrink-0">
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Logo"
              className="h-8 w-8 object-contain"
              onLoad={() => {
                console.log("✅ [SIDEBAR] Logo loaded successfully!")
              }}
              onError={(e) => {
                console.error("❌ [SIDEBAR] Error loading logo")
                // Mostrar fallback
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.style.display = "flex"
                }
              }}
            />
            {/* Fallback siempre presente */}
            <div
              className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: primaryColor, display: "none" }}
            >
              {projectName?.charAt(0)?.toUpperCase() || "C"}
            </div>
          </div>

          {/* Nombre del proyecto */}
          <span className="font-semibold text-lg">{projectName || "Civet"}</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "sidebar-nav-active"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setIsMobileOpen(false)}
                data-sidebar-nav-active={isActive}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        {user ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground px-2">{user.email}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full justify-center bg-black text-white hover:bg-gray-800" onClick={signInWithGoogle}>
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
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
