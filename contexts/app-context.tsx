"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// Define types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
  // Add other profile fields as needed
}

export interface Template {
  id: string
  created_at?: string
  name: string
  content: string
  user_id: string
  // Add other template fields as needed
}

interface AppContextType {
  session: Session | null
  userProfile: UserProfile | null
  templates: Template[]
  loading: boolean
  fetchUserProfile: () => Promise<void>
  fetchTemplates: () => Promise<void>
  createTemplate: (template: Omit<Template, "id" | "created_at" | "user_id">) => Promise<Template | null>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template | null>
  deleteTemplate: (id: string) => Promise<void>
  getTemplateById: (id: string) => Promise<Template | null>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile()
      fetchTemplates()
    } else {
      setUserProfile(null)
      setTemplates([])
    }
    setLoading(false)
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session?.user?.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
      }

      setUserProfile(profile)
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
    }
  }

  const fetchTemplates = async () => {
    if (!session?.user) return

    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching templates:", error)
      }

      setTemplates(data || [])
    } catch (error) {
      console.error("Unexpected error fetching templates:", error)
    }
  }

  const createTemplate = async (template: Omit<Template, "id" | "created_at" | "user_id">) => {
    if (!session?.user) return null

    try {
      const { data, error } = await supabase
        .from("templates")
        .insert([{ ...template, user_id: session.user.id }])
        .select("*")
        .single()

      if (error) {
        console.error("Error creating template:", error)
        return null
      }

      setTemplates((prev) => [data, ...prev])
      return data
    } catch (error) {
      console.error("Unexpected error creating template:", error)
      return null
    }
  }

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const { data, error } = await supabase.from("templates").update(updates).eq("id", id).select("*").single()

      if (error) {
        console.error("Error al actualizar la plantilla:", error)
        throw error
      }

      // Actualizar el estado local
      setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))

      return data
    } catch (error) {
      console.error("Error al actualizar la plantilla:", error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", id)

      if (error) {
        console.error("Error deleting template:", error)
        return
      }

      setTemplates((prev) => prev.filter((template) => template.id !== id))
    } catch (error) {
      console.error("Unexpected error deleting template:", error)
    }
  }

  const getTemplateById = async (id) => {
    try {
      // Primero intentar obtener de la caché local
      const cachedTemplate = templates.find((t) => t.id === id)
      if (cachedTemplate) return cachedTemplate

      // Si no está en caché, obtener de la base de datos
      const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()

      if (error) {
        console.error("Error al obtener la plantilla:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error al obtener la plantilla:", error)
      return null
    }
  }

  const value: AppContextType = {
    session,
    userProfile,
    templates,
    loading,
    fetchUserProfile,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

// Export alias para compatibilidad con el código existente
export const useApp = useAppContext
