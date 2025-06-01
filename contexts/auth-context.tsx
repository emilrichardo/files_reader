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
      console.log("🔍 [AUTH] Getting role for user ID:", userId)

      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).single()

      if (error) {
        console.error("❌ [AUTH] Error getting user role:", error)
        return "user"
      }

      if (!data) {
        console.log("⚠️ [AUTH] No role data found for user, returning default")
        return "user"
      }

      console.log("✅ [AUTH] Role found for user:", data.role)
      return data.role as "admin" | "user" | "premium" | "moderator" | "superadmin"
    } catch (error) {
      console.error("💥 [AUTH] Error getting user role:", error)
      return "user"
    }
  }

  const refreshUserRole = async () => {
    if (user) {
      console.log("🔄 [AUTH] Refreshing role for user:", user.email)
      const role = await getCurrentUserRole(user.id)
      console.log("🎯 [AUTH] Role retrieved:", role)
      setUserRole(role)
    }
  }

  const ensureUserIsRegistered = async (user: User) => {
    try {
      console.log("👤 [AUTH] Checking if user is registered:", user.email)

      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ [AUTH] Error checking existing role:", checkError)
        return
      }

      if (!existingRole) {
        console.log("📝 [AUTH] Registering new user:", user.email)
        const { error } = await supabase.from("user_roles").insert({
          user_id: user.id,
          role: "user",
          assigned_at: new Date().toISOString(),
        })

        if (error) {
          console.error("❌ [AUTH] Error registering new user:", error)
        } else {
          console.log("✅ [AUTH] New user registered successfully:", user.email)
        }
      } else {
        console.log("✅ [AUTH] User already registered with role:", existingRole.role)
      }
    } catch (error) {
      console.error("💥 [AUTH] Error ensuring user registration:", error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("🚀 [AUTH] Initializing auth...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ [AUTH] Error getting session:", error)
          if (mounted) setLoading(false)
          return
        }

        console.log("📋 [AUTH] Initial session:", session?.user?.email || "No session")

        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            console.log("👤 [AUTH] User set, getting role...")

            await ensureUserIsRegistered(session.user)

            const role = await getCurrentUserRole(session.user.id)
            console.log("🎯 [AUTH] Initial role for", session.user.email, ":", role)

            if (mounted) {
              setUserRole(role)
              setLoading(false)
            }
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("💥 [AUTH] Error initializing auth:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 [AUTH] Auth state change:", event, session?.user?.email || "No user")

      if (mounted) {
        setUser(session?.user ?? null)

        if (session?.user) {
          if (event === "SIGNED_IN") {
            console.log("🔐 [AUTH] User signed in, ensuring registration...")
            await ensureUserIsRegistered(session.user)
          }

          console.log("🔍 [AUTH] Getting role after auth change...")
          const role = await getCurrentUserRole(session.user.id)
          console.log("🎯 [AUTH] Role after auth change for", session.user.email, ":", role)

          if (mounted) {
            setUserRole(role)
            setLoading(false)
          }
        } else {
          setUserRole("user")
          setLoading(false)
        }
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
    setLoading(false)
    window.location.href = "/"
  }

  const isAdmin = userRole === "admin" || userRole === "superadmin"
  const isSuperAdmin = userRole === "superadmin"

  // Log detallado del estado actual
  console.log("📊 [AUTH] Current auth state:", {
    userEmail: user?.email,
    userId: user?.id,
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
