"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Plus, Layout, Settings, LogIn, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"

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
  const { user, signIn, signOut } = useAuth()
  const { companyLogo, logoType, primaryColor, isDark, projectName } = useTheme()

  const renderLogo = () => {
    if (companyLogo) {
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
          <img
            src={companyLogo || "/placeholder.svg"}
            alt="Company Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Si hay error cargando la imagen, mostrar el logo por defecto
              console.error("Error loading logo:", e)
            }}
          />
        </div>
      )
    } else {
      // Logo por defecto
      return (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
          <FileText className="w-5 h-5 text-white" />
        </div>
      )
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-lg">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
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
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive ? "text-white shadow-sm" : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                  style={isActive ? { backgroundColor: primaryColor } : {}}
                  onClick={() => setIsOpen(false)}
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
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.user_metadata?.name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={signIn} className="w-full text-white" style={{ backgroundColor: primaryColor }}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Google
              </Button>
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
