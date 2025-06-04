import { createClient } from "@supabase/supabase-js"
import type { Document, Template, DocumentRow } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

const GLOBAL_SETTINGS_ID = "00000000-0000-0000-0000-000000000001"

// Función con retry y timeout mejorados
async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, timeoutMs = 10000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [DB] Attempt ${attempt}/${maxRetries}`)

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Database timeout")), timeoutMs)
      })

      const result = await Promise.race([operation(), timeoutPromise])
      console.log(`✅ [DB] Success on attempt ${attempt}`)
      return result
    } catch (error) {
      console.log(`❌ [DB] Attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        throw error
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error("Max retries exceeded")
}

export async function getUserSettings(userId: string) {
  console.log(`🔍 [DB] Getting user settings for: ${userId}`)

  return executeWithRetry(async () => {
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error) {
      console.log(`⚠️ [DB] Error getting user settings:`, error.message)
      return { data: null, error }
    }

    console.log(`✅ [DB] User settings retrieved successfully`)
    return { data, error: null }
  })
}

export async function getGlobalSettings() {
  console.log(`🌍 [DB] Getting global settings...`)

  return executeWithRetry(async () => {
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", GLOBAL_SETTINGS_ID).single()

    if (error) {
      console.log(`⚠️ [DB] Error getting global settings:`, error.message)
      return { data: null, error }
    }

    console.log(`✅ [DB] Global settings retrieved successfully`)
    console.log(`📋 [DB] - Project name: ${data?.project_name}`)
    console.log(`📋 [DB] - Has logo: ${!!data?.company_logo}`)
    if (data?.company_logo) {
      console.log(`📋 [DB] - Logo length: ${data.company_logo.length}`)
      console.log(`📋 [DB] - Logo type: ${data.company_logo_type}`)
    }

    return { data, error: null }
  })
}

export async function updateUserSettings(userId: string, updates: any) {
  console.log(`💾 [DB] Updating settings for user: ${userId}`)
  console.log(`📝 [DB] Updates:`, Object.keys(updates))

  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.log(`❌ [DB] Error updating settings:`, error.message)
      return { data: null, error }
    }

    console.log(`✅ [DB] Settings updated successfully`)
    return { data, error: null }
  })
}

export async function createUserSettings(userId: string, settings: any) {
  console.log(`🆕 [DB] Creating settings for user: ${userId}`)

  return executeWithRetry(async () => {
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        ...settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.log(`❌ [DB] Error creating settings:`, error.message)
      return { data: null, error }
    }

    console.log(`✅ [DB] Settings created successfully`)
    return { data, error: null }
  })
}

// Resto de funciones sin cambios...
export const getUserRole = async (userId: string) => {
  try {
    console.log("Getting user role for user:", userId)

    const { data, error } = await supabase.from("user_roles").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error getting user role:", error)
      return { data: null, error }
    }

    console.log("User role retrieved successfully:", data?.role || "user")
    return { data, error }
  } catch (error) {
    console.error("Error getting user role:", error)
    return { data: null, error }
  }
}

export const updateUserRole = async (
  userId: string,
  newRole: "admin" | "user" | "premium" | "moderator" | "superadmin",
  assignedBy?: string,
) => {
  try {
    console.log("Updating user role:", userId, "to", newRole)

    const { data, error } = await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: newRole,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()

    if (error) {
      console.error("Error updating user role:", error)
      return { data: null, error }
    }

    console.log("User role updated successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { data: null, error }
  }
}

export const getCurrentUserRole = async (): Promise<"admin" | "user" | "premium" | "moderator" | "superadmin"> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("No user found, returning default role")
      return "user"
    }

    console.log("Getting role for user ID:", user.id, "Email:", user.email)

    // Verificación especial para emilrichardo
    if (user.email === "emilrichardo@gmail.com") {
      console.log("Special handling for emilrichardo - ensuring superadmin role")

      // Asegurar que tenga rol de superadmin
      const { error: roleError } = await supabase.from("user_roles").upsert(
        {
          user_id: user.id,
          role: "superadmin",
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (roleError) {
        console.error("Error ensuring superadmin role for emilrichardo:", roleError)
      }

      return "superadmin"
    }

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

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

// Resto de funciones sin cambios...
export const getTemplates = async (userId: string) => {
  try {
    console.log("Getting templates for user:", userId)

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting templates:", error)
      return { data: null, error }
    }

    console.log("Templates retrieved successfully:", data?.length, "templates")
    return { data, error: null }
  } catch (error) {
    console.error("Error getting templates:", error)
    return { data: null, error }
  }
}

export const createTemplate = async (template: Omit<Template, "id" | "created_at">) => {
  try {
    console.log("Creating template:", template.name)

    const { data, error } = await supabase
      .from("templates")
      .insert({
        name: template.name,
        description: template.description,
        user_id: template.user_id,
        fields: template.fields || [],
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating template:", error)
      return { data: null, error }
    }

    console.log("Template created successfully:", data.id)
    return { data, error: null }
  } catch (error) {
    console.error("Error creating template:", error)
    return { data: null, error }
  }
}

export const updateTemplate = async (id: string, updates: Partial<Template>) => {
  try {
    const { data, error } = await supabase.from("templates").update(updates).eq("id", id).select().single()

    return { data, error }
  } catch (error) {
    console.error("Error updating template:", error)
    return { data: null, error }
  }
}

export const deleteTemplate = async (id: string) => {
  try {
    console.log("Deleting template:", id)

    const { error } = await supabase.from("templates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting template:", error)
      return { error }
    }

    console.log("Template deleted successfully:", id)
    return { error: null }
  } catch (error) {
    console.error("Error deleting template:", error)
    return { error }
  }
}

// Servicios para Documents
export const getDocuments = async (userId: string) => {
  try {
    console.log("Getting documents for user:", userId)

    const { data, error } = await supabase
      .from("documents")
      .select(`
        id,
        name,
        description,
        user_id,
        fields,
        created_at,
        updated_at,
        document_rows (
          id,
          document_id,
          data,
          file_metadata,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error getting documents:", error)
      return { data: null, error }
    }

    // Transformar los datos para que coincidan con el tipo Document
    const documents =
      data?.map((doc) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        user_id: doc.user_id,
        fields: doc.fields || [],
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        rows: (doc.document_rows || []).map((row: any) => ({
          id: row.id,
          document_id: row.document_id,
          data: row.data || {},
          file_metadata: row.file_metadata,
          created_at: row.created_at,
          updated_at: row.updated_at,
        })),
      })) || []

    console.log("Documents retrieved successfully:", documents.length, "documents")
    console.log(
      "Total rows loaded:",
      documents.reduce((acc, doc) => acc + (doc.rows?.length || 0), 0),
    )

    return { data: documents, error: null }
  } catch (error) {
    console.error("Error getting documents:", error)
    return { data: null, error }
  }
}

export const getDocument = async (id: string) => {
  try {
    console.log("Getting single document:", id)

    const { data, error } = await supabase
      .from("documents")
      .select(`
        id,
        name,
        description,
        user_id,
        fields,
        created_at,
        updated_at,
        document_rows (
          id,
          document_id,
          data,
          file_metadata,
          created_at,
          updated_at
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error getting document:", error)
      return { data: null, error }
    }

    // Transformar los datos
    const document = {
      id: data.id,
      name: data.name,
      description: data.description,
      user_id: data.user_id,
      fields: data.fields || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      rows: (data.document_rows || []).map((row: any) => ({
        id: row.id,
        document_id: row.document_id,
        data: row.data || {},
        file_metadata: row.file_metadata,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    }

    console.log("Document retrieved successfully:", document.name, "with", document.rows.length, "rows")
    return { data: document, error: null }
  } catch (error) {
    console.error("Error getting document:", error)
    return { data: null, error }
  }
}

export const createDocument = async (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
  try {
    console.log("Creating document:", document.name)
    console.log("Document data:", document)

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      throw new Error("Usuario no autenticado")
    }

    console.log("User authenticated:", user.email)

    // Crear el documento principal
    const { data, error } = await supabase
      .from("documents")
      .insert({
        name: document.name,
        description: document.description,
        user_id: document.user_id,
        fields: document.fields || [],
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating document:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return { data: null, error }
    }

    console.log("Document created successfully:", data.id)
    return { data, error: null }
  } catch (error) {
    console.error("Exception creating document:", error)
    return { data: null, error }
  }
}

export const updateDocument = async (id: string, updates: Partial<Document>) => {
  try {
    console.log("Updating document:", id, updates)

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.fields !== undefined) updateData.fields = updates.fields

    const { data, error } = await supabase.from("documents").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating document:", error)
      return { data: null, error }
    }

    console.log("Document updated successfully:", data.id)
    return { data, error }
  } catch (error) {
    console.error("Error updating document:", error)
    return { data: null, error }
  }
}

export const deleteDocument = async (id: string) => {
  try {
    console.log("Deleting document:", id)

    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
      console.error("Error deleting document:", error)
      return { error }
    }

    console.log("Document deleted successfully:", id)
    return { error: null }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { error }
  }
}

// Servicios para Document Rows
export const createDocumentRow = async (row: Omit<DocumentRow, "id" | "created_at" | "updated_at">) => {
  try {
    console.log("Creating document row for document:", row.document_id)
    console.log("Row data:", row.data)

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      throw new Error("Usuario no autenticado")
    }

    const { data, error } = await supabase
      .from("document_rows")
      .insert({
        document_id: row.document_id,
        data: row.data || {},
        file_metadata: row.file_metadata || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating document row:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return { data: null, error }
    }

    console.log("Document row created successfully:", data.id)
    return { data, error: null }
  } catch (error) {
    console.error("Exception creating document row:", error)
    return { data: null, error }
  }
}

export const updateDocumentRow = async (id: string, updates: Partial<DocumentRow>) => {
  try {
    console.log("Updating document row:", id, updates)

    const updateData: any = {}
    if (updates.data !== undefined) updateData.data = updates.data
    if (updates.file_metadata !== undefined) updateData.file_metadata = updates.file_metadata

    const { data, error } = await supabase.from("document_rows").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating document row:", error)
      return { data: null, error }
    }

    console.log("Document row updated successfully:", data.id)
    return { data, error }
  } catch (error) {
    console.error("Error updating document row:", error)
    return { data: null, error }
  }
}

export const deleteDocumentRow = async (id: string) => {
  try {
    console.log("Deleting document row:", id)

    const { error } = await supabase.from("document_rows").delete().eq("id", id)

    if (error) {
      console.error("Error deleting document row:", error)
      return { error }
    }

    console.log("Document row deleted successfully:", id)
    return { error: null }
  } catch (error) {
    console.error("Error deleting document row:", error)
    return { error }
  }
}

// Funciones auxiliares simplificadas
export const checkIsAdmin = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (error || !data) return false

    return data.role === "admin" || data.role === "superadmin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export const checkIsSuperAdmin = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (error || !data) return false

    return data.role === "superadmin"
  } catch (error) {
    console.error("Error checking superadmin status:", error)
    return false
  }
}
