import { supabase } from "./supabase"
import type { Document, Template, DocumentRow, UserSettings } from "./types"

// Servicios para User Settings (solo configuraciones)
export const getUserSettings = async (userId: string) => {
  try {
    console.log("Getting user settings for user:", userId)

    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Supabase error getting user settings:", error)
    } else if (!error) {
      console.log("User settings retrieved successfully:", data)
    }

    return { data, error }
  } catch (error) {
    console.error("Error getting user settings:", error)
    return { data: null, error }
  }
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    console.log("Updating user settings for user:", userId, settings)

    // Asegurarse de que el objeto de configuración tenga la estructura correcta
    const settingsToUpdate = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    }

    // Usar upsert para crear o actualizar según sea necesario
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(settingsToUpdate, {
        onConflict: "user_id",
      })
      .select()

    if (error) {
      console.error("Supabase error updating user settings:", error)
      throw error
    } else {
      console.log("User settings updated successfully:", data)
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error
  }
}

// Servicios para User Roles
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

// Servicios para gestión de usuarios (solo admins)
export const getAllUsersWithRoles = async () => {
  try {
    console.log("Getting all users with roles (admin only)")

    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        role,
        assigned_at,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting all users with roles:", error)
      return { data: null, error }
    }

    console.log("All users with roles retrieved successfully:", data?.length, "users")
    return { data, error: null }
  } catch (error) {
    console.error("Error getting all users with roles:", error)
    return { data: null, error }
  }
}

export const logUserManagement = async (userId: string, action: string, details: Record<string, any> = {}) => {
  try {
    console.log("Logging user management action:", action, "for user:", userId)

    const { data, error } = await supabase
      .from("user_management")
      .insert({
        user_id: userId,
        managed_by: (await supabase.auth.getUser()).data.user?.id,
        action,
        details,
      })
      .select()

    if (error) {
      console.error("Error logging user management:", error)
      return { data: null, error }
    }

    console.log("User management logged successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Error logging user management:", error)
    return { data: null, error }
  }
}

// Función para verificar si el usuario actual es admin o superadmin
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

// Función para verificar si el usuario actual es superadmin
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

// Función para obtener el rol del usuario actual - MEJORADA
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

// Servicios para Templates
export const getTemplates = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Error getting templates:", error)
    return { data: null, error }
  }
}

export const createTemplate = async (template: Omit<Template, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase.from("templates").insert(template).select().single()

    return { data, error }
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
    const { error } = await supabase.from("templates").delete().eq("id", id)

    return { error }
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
      return { data: null, error }
    }

    console.log("Document created successfully:", data.id)
    return { data, error: null }
  } catch (error) {
    console.error("Error creating document:", error)
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
      return { data: null, error }
    }

    console.log("Document row created successfully:", data.id)
    return { data, error: null }
  } catch (error) {
    console.error("Error creating document row:", error)
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
