import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/theme-modes.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { ThemeLoader } from "@/components/theme-loader"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import DebugPanel from "@/components/debug-panel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Invitu - Document Management",
  description: "Extrae datos de documentos con IA",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <ThemeLoader>
                <div className="flex min-h-screen">
                  {/* Sidebar */}
                  <Sidebar />

                  {/* Main Content */}
                  <div className="flex-1 lg:ml-64">
                    <main className="min-h-screen">{children}</main>
                  </div>
                </div>

                {/* Toast notifications */}
                <Toaster />

                {/* Debug panel (only in development) */}
                <DebugPanel />
              </ThemeLoader>
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
