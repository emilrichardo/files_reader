"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  FileText,
  LayoutTemplateIcon as Template,
  Settings,
  Users,
  Menu,
  LogOut,
  Crown,
  Home,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, userRole, isAdmin, isSuperAdmin, loading, signInWithGoogle, signOut, refreshUserRole } = useAuth()
  const { projectName, companyLogo } = useTheme()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleRefreshRole = async () => {
    console.log("🔄 [SIDEBAR] Manual role refresh requested")
    await refreshUserRole()
  }

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Documentos", href: "/documents", icon: FileText },
    { name: "Plantillas", href: "/templates", icon: Template },
    // Solo mostrar configuración para superadmin
    ...(isSuperAdmin ? [{ name: "Configuración", href: "/settings", icon: Settings }] : []),
  ]

  const SidebarContentComponent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {companyLogo ? (
            <img src={companyLogo || "/placeholder.svg"} alt="Logo" className="h-8 w-auto" />
          ) : (
            <FileText className="h-6 w-6" />
          )}
          {projectName}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        {/* Admin/SuperAdmin Menu - Mostrar cuando sea admin o superadmin */}
        {(isAdmin || isSuperAdmin) && (
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors border border-purple-200",
              pathname === "/users"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "text-purple-700 hover:bg-purple-50",
            )}
            onClick={() => setOpen(false)}
          >
            <Users className="h-4 w-4" />
            Usuarios
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs ml-auto">
              {isSuperAdmin ? "SA" : "Admin"}
            </Badge>
          </Link>
        )}
      </nav>

      {/* User Info / Login - Siempre en la parte inferior */}
      <div className="p-4 border-t mt-auto">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {userRole}
                  </Badge>
                  {isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      SA
                    </Badge>
                  )}
                  {/* Debug: Mostrar siempre para emilrichardo */}
                  {user.email === "emilrichardo@gmail.com" && !isSuperAdmin && (
                    <Badge className="bg-red-500 text-white text-xs">DEBUG: Should be SA</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex-1 justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshRole} className="px-2">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={signInWithGoogle} className="w-full justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Iniciar con Google
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SidebarContentComponent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block w-64">
        <SidebarContentComponent />
      </div>
    </>
  )
}
