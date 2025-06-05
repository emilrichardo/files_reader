"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import {
  FileText,
  LayoutTemplateIcon as Template,
  Users,
  Settings,
  Menu,
  LogOut,
  Home,
} from "lucide-react";

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Plantillas", href: "/templates", icon: Template },
  { name: "Usuarios", href: "/users", icon: Users },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const {
    companyLogo,
    logoType,
    projectName,
    isSettingsReady, // NUEVO: esperar a que los settings estén listos
  } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header con logo y nombre */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          {isSettingsReady && companyLogo ? (
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {isSettingsReady ? projectName.charAt(0).toUpperCase() : "I"}
              </span>
            </div>
          )}

          {/* Nombre del proyecto */}
          <span className="font-semibold text-lg">
            {isSettingsReady ? projectName : "Cargando..."}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        {/* User info and logout */}
        {user && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground px-2">
              {user.email}
            </div>
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
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col  md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
