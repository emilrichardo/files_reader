"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Plus, Layout, Settings, LogIn, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Create New Document", href: "/documents/create", icon: Plus },
  { name: "Templates", href: "/templates", icon: Layout },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, signInWithGoogle, signInWithGitHub, signOut } = useAuth()
  const { companyLogo, logoType, primaryColor, isDark, projectName, isLightColor, getOptimalTextColor } = useTheme()

  // Calcular el color de texto óptimo
  const optimalTextColor = getOptimalTextColor(primaryColor)

  const renderLogo = () => {
    if (companyLogo) {
      return (
        <div className="w-8 h-8 overflow-hidden flex items-center justify-center bg-white">
          <img
            src={companyLogo || "/placeholder.svg"}
            alt="Company Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error("Error loading logo:", e)
            }}
          />
        </div>
      )
    } else {
      return (
        <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
          <FileText className="w-5 h-5 text-white" />
        </div>
      )
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg"
          data-button="true"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-background transform transition-transform duration-300 ease-in-out sidebar-container
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        data-card="true"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              {renderLogo()}
              <span className="text-xl font-bold text-foreground truncate" title={projectName}>
                {projectName}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                  flex items-center px-3 py-2 text-sm font-medium transition-colors sidebar-item
                  ${
                    isActive
                      ? "sidebar-item-active auto-contrast-text"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                `}
                  style={
                    isActive
                      ? {
                          backgroundColor: primaryColor,
                          color: optimalTextColor,
                          "--optimal-text-color": optimalTextColor,
                        }
                      : {}
                  }
                  onClick={() => setIsOpen(false)}
                  data-button="true"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {user.email?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="w-full" data-button="true">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="w-full auto-contrast-text"
                      style={{
                        backgroundColor: primaryColor,
                        color: optimalTextColor,
                      }}
                      data-button="true"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="center">
                    <DropdownMenuItem onClick={signInWithGoogle} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 bg-red-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        Continuar con Google
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signInWithGitHub} className="cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 bg-gray-900 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        Continuar con GitHub
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
