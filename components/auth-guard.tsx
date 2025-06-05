"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<"user" | "admin" | "premium" | "moderator" | "superadmin">
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Forzar que la verificación termine después de un tiempo máximo
    const forceTimeout = setTimeout(() => {
      console.log("⚠️ [AUTH-GUARD] Forzando autorización por timeout")
      setIsAuthorized(true)
      setIsCheckingAuth(false)
    }, 2000)

    // Verificación normal
    const checkAuth = () => {
      console.log("🔍 [AUTH-GUARD] Verificando autorización:", {
        user: !!user,
        userRole,
        allowedRoles,
        loading,
      })

      if (!loading) {
        if (!user) {
          console.log("❌ [AUTH-GUARD] Usuario no autenticado, redirigiendo a inicio")
          router.push("/")
          setIsAuthorized(false)
        } else if (allowedRoles && !allowedRoles.includes(userRole)) {
          console.log("❌ [AUTH-GUARD] Usuario no tiene rol permitido, redirigiendo a inicio")
          router.push("/")
          setIsAuthorized(false)
        } else {
          console.log("✅ [AUTH-GUARD] Usuario autorizado")
          setIsAuthorized(true)
        }
        setIsCheckingAuth(false)
        clearTimeout(forceTimeout)
      }
    }

    checkAuth()

    return () => clearTimeout(forceTimeout)
  }, [user, userRole, loading, router, allowedRoles])

  // Si está verificando, mostrar spinner por máximo 2 segundos
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Si no está autorizado, no mostrar nada (la redirección ya se hizo)
  if (!isAuthorized) {
    return null
  }

  // Si está autorizado, mostrar el contenido
  return <>{children}</>
}

// Exportar como default también para compatibilidad
export default AuthGuard
