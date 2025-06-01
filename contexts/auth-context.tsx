"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  userRole: "admin" | "user" | "premium" | "moderator" | "superadmin"
  isAdmin: boolean
  isSuperAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: "user",
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUserRole: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<"admin" | "user" | "premium" | "moderator" | "superadmin">("user")
  const [loading, setLoading] = useState(true)

  const getCurrentUserRole = async (
    userId: string,
  ): Promise<"admin" | "user" | "premium" | "moderator" | "superadmin"> => {
    try {
      console.log("Getting role for user ID:", userId)

      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).single()

      if (error) {
        console.error("Error getting user role:", error)
        return "user"
      }

      if (!data) {
        console.log("No role data found for user, returning default")
        return "user"
      }

      console.log("Role found for user:", data.role)
      return data.role as "admin" | "user" | "premium" | "moderator" | "superadmin"
    } catch (error) {
      console.error("Error getting user role:", error)
      return "user"
    }
  }

  const refreshUserRole = async () => {
    if (user) {
      console.log("Refreshing role for user:", user.email)
      const role = await getCurrentUserRole(user.id)
      console.log("Role retrieved:", role)
      setUserRole(role)
    }
  }

  const ensureUserIsRegistered = async (user: User) => {
    try {
      // Verificar si el usuario ya tiene un rol asignado
      const { data: existingRole } = await supabase.from("user_roles").select("*").eq("user_id", user.id).single()

      // Si no existe, crear un rol por defecto
      if (!existingRole) {
        console.log("Registering new user:", user.email)
        const { error } = await supabase.from("user_roles").insert({
          user_id: user.id,
          role: "user",
          assigned_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error registering new user:", error)
        } else {
          console.log("New user registered successfully:", user.email)
        }
      }
    } catch (error) {
      console.error("Error ensuring user registration:", error)
    }
  }

  useEffect(() => {
    let mounted = true

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session:", session?.user?.email || "No session")

        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            // Obtener rol inmediatamente
            const role = await getCurrentUserRole(session.user.id)
            console.log("Initial role for", session.user.email, ":", role)
            if (mounted) {
              setUserRole(role)
            }
          }
          setLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email || "No user")

      if (mounted) {
        setUser(session?.user ?? null)

        if (session?.user) {
          // Registrar usuario automáticamente si es nuevo
          if (event === "SIGNED_IN") {
            await ensureUserIsRegistered(session.user)
          }

          // Obtener rol del usuario
          const role = await getCurrentUserRole(session.user.id)
          console.log("Role after auth change for", session.user.email, ":", role)
          if (mounted) {
            setUserRole(role)
          }
        } else {
          setUserRole("user")
        }

        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUserRole("user")
    // Forzar recarga de la página para limpiar completamente el estado
    window.location.href = "/"
  }

  const isAdmin = userRole === "admin" || userRole === "superadmin"
  const isSuperAdmin = userRole === "superadmin"

  console.log("Current auth state:", {
    userEmail: user?.email,
    userRole,
    isAdmin,
    isSuperAdmin,
    loading,
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAdmin,
        isSuperAdmin,
        loading,
        signInWithGoogle,
        signOut,
        refreshUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
