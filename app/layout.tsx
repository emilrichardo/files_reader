import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context"
import { ThemeLoader } from "@/components/theme-loader"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Invitu",
  description: "Sistema de gestión de documentos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CustomThemeProvider>
              <ThemeLoader>
                <AppProvider>
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 p-6">{children}</main>
                  </div>
                  <Toaster />
                </AppProvider>
              </ThemeLoader>
            </CustomThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
