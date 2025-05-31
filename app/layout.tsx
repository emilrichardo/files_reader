import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./styles/theme-modes.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"
import { ThemeLoader } from "@/components/theme-loader"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import DebugPanel from "@/components/debug-panel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DocManager - Document Management System",
  description: "A powerful document management and data extraction platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ThemeLoader>
              <AppProvider>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <main className="flex-1 overflow-auto lg:ml-0">
                    <div className="lg:pl-0 pl-0">{children}</div>
                  </main>
                </div>
                <Toaster />
                <DebugPanel />
              </AppProvider>
            </ThemeLoader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
