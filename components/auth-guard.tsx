"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<"user" | "admin" | "premium" | "moderator" | "superadmin">
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, userRole, loading, signInWithGoogle, signInWithGitHub } = useAuth()

  console.log("🔍 [AUTH-GUARD] Estado:", { user: !!user, userRole, loading, allowedRoles })

  // Si está cargando, mostrar spinner SOLO por 3 segundos máximo
  if (loading) {
    // Forzar que deje de cargar después de 3 segundos
    setTimeout(() => {
      if (loading) {
        console.log("⚠️ [AUTH-GUARD] Forzando fin de carga por timeout")
      }
    }, 3000)

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Si no hay usuario, mostrar login
  if (!user) {
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
          </div>
        </div>
      </div>
    )
  }

  // Si hay roles permitidos y el usuario no tiene el rol correcto
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Tu rol actual es: {userRole}
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}

export default AuthGuard
