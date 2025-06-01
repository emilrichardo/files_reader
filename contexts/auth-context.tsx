"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { getCurrentUserRole } from "@/lib/database"

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

  const refreshUserRole = async () => {
    if (user) {
      const role = await getCurrentUserRole()
      setUserRole(role)
      console.log("User role refreshed:", role)
    }
  }

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Obtener rol del usuario cuando se autentica
      if (session?.user) {
        // Registrar usuario automáticamente si es nuevo
        if (event === "SIGNED_IN") {
          await ensureUserIsRegistered(session.user)
        }

        const role = await getCurrentUserRole()
        setUserRole(role)
        console.log("User authenticated with role:", role)
      } else {
        setUserRole("user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Obtener rol cuando el usuario cambia
  useEffect(() => {
    if (user) {
      refreshUserRole()
    }
  }, [user])

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

  const isAdmin = userRole === "admin" || userRole === "superadmin"
  const isSuperAdmin = userRole === "superadmin"

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
