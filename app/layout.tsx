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
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* ESTILOS CRÍTICOS ULTRA FORZADOS */
            * {
              box-sizing: border-box;
            }
            
            /* TODOS LOS BOTONES PRIMARIOS */
            button[type="submit"],
            .settings-save-button,
            button.bg-blue-600,
            button.bg-primary,
            .btn-primary,
            button[class*="bg-blue"],
            button[class*="bg-primary"],
            .bg-blue-600,
            .bg-primary {
              background-color: #3b82f6 !important;
              background: #3b82f6 !important;
              color: #ffffff !important;
              border-color: #3b82f6 !important;
              border: 1px solid #3b82f6 !important;
            }
            
            button[type="submit"]:hover,
            .settings-save-button:hover,
            button.bg-blue-600:hover,
            button.bg-primary:hover,
            .btn-primary:hover,
            button[class*="bg-blue"]:hover,
            button[class*="bg-primary"]:hover,
            .bg-blue-600:hover,
            .bg-primary:hover {
              background-color: #2563eb !important;
              background: #2563eb !important;
              color: #ffffff !important;
            }
            
            /* FORZAR CLASES DE TAILWIND */
            .bg-blue-600 {
              background-color: #3b82f6 !important;
            }
            
            .hover\\:bg-blue-700:hover {
              background-color: #2563eb !important;
            }
            
            .text-white {
              color: #ffffff !important;
            }
            
            /* Iconos en botones */
            button[type="submit"] svg,
            .settings-save-button svg,
            button.bg-blue-600 svg,
            button.bg-primary svg,
            .btn-primary svg {
              color: #ffffff !important;
            }
            
            /* Navegación activa */
            .sidebar-nav-active,
            [data-sidebar-nav-active="true"] {
              background-color: #3b82f6 !important;
              color: white !important;
            }
            
            /* Asegurar que no hay loading infinito */
            .loading-overlay {
              display: none !important;
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
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
