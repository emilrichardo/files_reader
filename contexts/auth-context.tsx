"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  supabase,
  signInWithGoogle,
  signInWithGitHub,
  signOut as supabaseSignOut,
  getUserProfile,
} from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session:", session ? "Found" : "Not found")

        if (session?.user) {
          console.log("User found in session:", session.user.email)
          await loadUserProfile(session.user)
        } else {
          console.log("No user in session, checking localStorage")
          // Intentar cargar desde localStorage si no hay sesión
          const localUser = localStorage.getItem("localUser")
          if (localUser) {
            try {
              const parsedUser = JSON.parse(localUser)
              console.log("Found local user:", parsedUser.email)
              setUser(parsedUser)
            } catch (e) {
              console.error("Error parsing local user:", e)
            }
          } else {
            console.log("No local user found")
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        await loadUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing local user")
        localStorage.removeItem("localUser")
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log("Loading user profile for:", authUser.email)
      const { data: profile, error } = await getUserProfile(authUser.id)

      if (error) {
        console.error("Error loading user profile:", error)
        return
      }

      const userData = {
        id: authUser.id,
        email: authUser.email || "usuario@ejemplo.com",
        name: profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Usuario",
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      }

      console.log("User profile loaded:", userData.name)
      setUser(userData)

      // Guardar en localStorage para persistencia
      localStorage.setItem("localUser", JSON.stringify(userData))

      // Load theme settings after user is set
      window.dispatchEvent(new CustomEvent("userLoaded", { detail: { userId: authUser.id } }))
    } catch (error) {
      console.error("Error in loadUserProfile:", error)
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log("Starting Google sign in...")
      const { error } = await signInWithGoogle()
      if (error) {
        console.error("Error signing in with Google:", error)
        throw error
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setLoading(false)
    }
  }

  const handleSignInWithGitHub = async () => {
    try {
      setLoading(true)
      console.log("Starting GitHub sign in...")
      const { error } = await signInWithGitHub()
      if (error) {
        console.error("Error signing in with GitHub:", error)
        throw error
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabaseSignOut()
      if (error) {
        console.error("Error signing out:", error)
        throw error
      }
      localStorage.removeItem("localUser")
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithGitHub: handleSignInWithGitHub,
        signOut: handleSignOut,
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
