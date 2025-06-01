"use client"

import type React from "react"

import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from "react"
import { type Session, type SupabaseClient, useSession, useSupabaseClient } from "@supabase/auth-helpers-react"

import type { Database } from "@/lib/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Role = Database["public"]["Tables"]["roles"]["Row"]

interface AuthContextType {
  supabaseClient: SupabaseClient<Database> | null
  session: Session | null
  user: User | null
  role: Role | null
  isLoading: boolean
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  supabaseClient: null,
  session: null,
  user: null,
  role: null,
  isLoading: true,
  refreshUserRole: async () => {},
})

interface Props {
  children: ReactNode
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const supabaseClient = useSupabaseClient<Database>()
  const session = useSession()

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const ensureUserRegistered = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        return
      }

      const { data: existingUser, error: userError } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user:", userError)
        return
      }

      if (existingUser) {
        console.log("✅ [AUTH] User already registered")
        return
      }

      console.log("👤 [AUTH] User not found, registering...")

      const { data: newUser, error: newUserError } = await supabaseClient
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name,
          avatar_url: session.user.user_metadata.avatar_url,
        })
        .select("*")
        .single()

      if (newUserError) {
        console.error("Error creating user:", newUserError)
        return
      }

      if (!newUser) {
        console.error("Error creating user: No user returned")
        return
      }

      console.log("✅ [AUTH] User registered:", newUser)

      // En la función ensureUserRegistered, agregar verificación especial para emilrichardo
      if (session.user.email === "emilrichardo@gmail.com") {
        console.log("🔧 [AUTH] Special handling for emilrichardo - ensuring superadmin role")
        const { error: roleError } = await updateUserRole(session.user.id, "superadmin", session.user.id)
        if (roleError) {
          console.error("Error setting superadmin role for emilrichardo:", roleError)
        } else {
          console.log("✅ [AUTH] Superadmin role set for emilrichardo")
        }
      }
    },
    [supabaseClient],
  )

  const updateUserRole = useCallback(
    async (userId: string, roleName: string, updatedBy: string) => {
      console.log(`👤 [AUTH] Updating user role to ${roleName}...`)

      const { data: existingRole, error: existingRoleError } = await supabaseClient
        .from("roles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (existingRoleError && existingRoleError.message.includes("No rows")) {
        console.log("ℹ️ [AUTH] No role found, creating...")
        const { data, error } = await supabaseClient
          .from("roles")
          .insert({
            user_id: userId,
            role: roleName,
            updated_by: updatedBy,
          })
          .select("*")
          .single()

        if (error) {
          console.error("Error creating role:", error)
          return { error }
        }

        console.log("✅ [AUTH] Role created:", data)
        return { data }
      }

      if (existingRoleError) {
        console.error("Error fetching role:", existingRoleError)
        return { error: existingRoleError }
      }

      const { data, error } = await supabaseClient
        .from("roles")
        .update({ role: roleName, updated_by: updatedBy })
        .eq("user_id", userId)
        .select("*")
        .single()

      if (error) {
        console.error("Error updating role:", error)
        return { error }
      }

      console.log("✅ [AUTH] Role updated:", data)
      return { data }
    },
    [supabaseClient],
  )

  const refreshUserRole = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }

    console.log("🔄 [AUTH] Refreshing user and role...")

    const { data: user, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      setIsLoading(false)
      return
    }

    setUser(user)

    const { data: role, error: roleError } = await supabaseClient
      .from("roles")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    if (roleError) {
      // Handle the case where the user doesn't have a role yet.
      console.warn("User has no role assigned:", roleError)
      setRole(null) // Set role to null to indicate no role.
    } else {
      setRole(role)
    }

    setIsLoading(false)
    console.log("✅ [AUTH] User and role refreshed")
  }, [session, supabaseClient])

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      await ensureUserRegistered(session)
      // Después de ensureUserRegistered, forzar refresh del rol
      await refreshUserRole()
    }

    initializeAuth()
  }, [session, ensureUserRegistered, refreshUserRole])

  const value = {
    supabaseClient,
    session,
    user,
    role,
    isLoading,
    refreshUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export { AuthProvider, useAuth }
