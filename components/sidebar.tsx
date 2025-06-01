"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
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
  LogIn,
  Crown,
  Home,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Sidebar as Root,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Plantillas", href: "/templates", icon: Template },
  { name: "Configuración", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const {
    user,
    userRole,
    isAdmin: isSuperAdmin,
    isSuperAdmin: isReallySuperAdmin,
    loading,
    signInWithGoogle,
    signOut,
  } = useAuth()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const SidebarContentComponent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6" />
          Invitu
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b p-4">
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
                  {isReallySuperAdmin && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      SA
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">No autenticado</p>
            <Button variant="default" size="sm" onClick={signInWithGoogle} className="w-full justify-start gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Button>
          </div>
        )}
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

        {/* SuperAdmin Menu */}
        {isSuperAdmin && (
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
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs ml-auto">SA</Badge>
          </Link>
        )}
      </nav>
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

export default function AppSidebar() {
  const pathname = usePathname()

  // Determinar si el usuario es admin (esto debería venir de tu contexto de autenticación)
  const isAdmin = true // Reemplazar con tu lógica real

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Documentos",
      icon: FileText,
      href: "/documents",
    },
    {
      title: "Plantillas",
      icon: FileText,
      href: "/templates",
    },
    {
      title: "Estadísticas",
      icon: BarChart2,
      href: "/stats",
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/settings",
    },
  ]

  // Agregar el ítem de Usuarios solo para administradores
  if (isAdmin) {
    navItems.push({
      title: "Usuarios",
      icon: Users,
      href: "/users",
    })
  }

  return (
    <Root>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Root>
  )
}
