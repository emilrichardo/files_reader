"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/database"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  userRole: "admin" | "user" | "premium" | "moderator" | "superadmin"
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<"admin" | "user" | "premium" | "moderator" | "superadmin">("user")
  const [loading, setLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (hasInitialized) return

    console.log("🔄 [AUTH] Inicializando autenticación...")
    setHasInitialized(true)

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ [AUTH] Error obteniendo sesión:", error)
        } else if (session?.user) {
          console.log("✅ [AUTH] Sesión encontrada:", session.user.email)
          setUser(session.user)
          await loadUserRole(session.user.id)
        } else {
          console.log("ℹ️ [AUTH] No hay sesión activa")
        }
      } catch (error) {
        console.error("❌ [AUTH] Error en getInitialSession:", error)
      } finally {
        setLoading(false)
        console.log("✅ [AUTH] Inicialización completada")
      }
    }

    // Configurar listener de cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("📊 [AUTH] Cambio de estado:", event, session?.user?.email || "sin usuario")

      if (session?.user) {
        setUser(session.user)
        await loadUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole("user")
      }

      setLoading(false)
    })

    getInitialSession()

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [hasInitialized])

  const loadUserRole = async (userId: string) => {
    try {
      console.log("🔍 [AUTH] Cargando rol para usuario:", userId)
      const role = await getCurrentUserRole()
      console.log("✅ [AUTH] Rol cargado:", role)
      setUserRole(role)
    } catch (error) {
      console.error("❌ [AUTH] Error cargando rol:", error)
      setUserRole("user")
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("🔄 [AUTH] Iniciando sesión con Google...")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("❌ [AUTH] Error con Google:", error)
        throw error
      }
    } catch (error) {
      console.error("❌ [AUTH] Error en signInWithGoogle:", error)
      throw error
    }
  }

  const signInWithGitHub = async () => {
    try {
      console.log("🔄 [AUTH] Iniciando sesión con GitHub...")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("❌ [AUTH] Error con GitHub:", error)
        throw error
      }
    } catch (error) {
      console.error("❌ [AUTH] Error en signInWithGitHub:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("🔄 [AUTH] Cerrando sesión...")
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("❌ [AUTH] Error cerrando sesión:", error)
        throw error
      }

      setUser(null)
      setUserRole("user")
      console.log("✅ [AUTH] Sesión cerrada correctamente")
    } catch (error) {
      console.error("❌ [AUTH] Error en signOut:", error)
      throw error
    }
  }

  // Forzar que loading sea false después de 5 segundos máximo
  useEffect(() => {
    const forceStopLoading = setTimeout(() => {
      if (loading) {
        console.log("⚠️ [AUTH] Forzando fin de loading por timeout")
        setLoading(false)
      }
    }, 5000)

    return () => clearTimeout(forceStopLoading)
  }, [loading])

  console.log("📊 [AUTH] Current auth state:", { user: !!user, userRole, loading })

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
