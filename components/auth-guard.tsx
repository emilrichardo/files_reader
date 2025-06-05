"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signInWithGoogle, signInWithGitHub } = useAuth()
  const router = useRouter()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    // Esperar a que termine la carga de autenticación
    if (!loading) {
      // Si no hay usuario, mostrar el prompt de login después de un breve retraso
      if (!user) {
        const timer = setTimeout(() => {
          setShowLoginPrompt(true)
        }, 500)
        return () => clearTimeout(timer)
      } else {
        setShowLoginPrompt(false)
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (showLoginPrompt) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Iniciar Sesión Requerido</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a esta sección. Por favor, inicia sesión para continuar.
          </p>
          <div className="space-y-3">
            <Button className="w-full justify-center" onClick={signInWithGoogle}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </Button>
            <Button variant="outline" className="w-full justify-center" onClick={signInWithGitHub}>
              <Github className="h-4 w-4 mr-2" />
              Continuar con GitHub
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard
