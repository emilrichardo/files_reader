import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/theme-modes.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/sidebar"
import { GlobalLoader } from "@/components/global-loader"
import { ThemeLoader } from "@/components/theme-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Civet - Sistema de Gestión Documental",
  description: "Sistema de gestión documental para empresas",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style>{`
          /* Estilos críticos para botones */
          button.bg-blue-600, 
          button.bg-primary, 
          button.settings-save-button,
          button[type="submit"]:not([variant="ghost"]):not([variant="outline"]) {
            background-color: #000000 !important;
            color: white !important;
          }
          
          button.bg-blue-600:hover, 
          button.bg-primary:hover, 
          button.settings-save-button:hover,
          button[type="submit"]:not([variant="ghost"]):not([variant="outline"]):hover {
            background-color: #333333 !important;
          }
          
          /* Navegación activa */
          .sidebar-nav-active, [data-sidebar-nav-active="true"] {
            background-color: #3b82f6 !important;
            color: white !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <ThemeLoader />
              <GlobalLoader />
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 md:ml-64">{children}</main>
              </div>
              <Toaster />
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
