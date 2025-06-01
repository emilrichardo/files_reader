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

// Función simplificada para obtener configuración global sin verificar roles
export const getGlobalSettings = async () => {
  try {
    console.log("Getting global settings (public access)")

    // Buscar configuración más reciente que tenga configuración de tema/diseño
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .not("project_name", "is", null)
      .not("color_scheme", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error && error.code !== "PGRST116") {
      console.error("Error getting global settings:", error)
      return { data: null, error }
    }

    if (data && data.length > 0) {
      console.log("Global settings retrieved successfully:", data[0])
      return { data: data[0], error: null }
    } else {
      console.log("No global settings found")
      return { data: null, error: null }
    }
  } catch (error) {
    console.error("Error getting global settings:", error)
    return { data: null, error }
  }
}

// Función específica para obtener configuración de superadmin (solo para usuarios autenticados)
export const getSuperAdminSettings = async () => {
  try {
    console.log("Getting superadmin settings (authenticated access)")

    // Verificar que hay un usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("No authenticated user, cannot access superadmin settings")
      return { data: null, error: null }
    }

    // Primero obtener todos los usuarios con rol superadmin
    const { data: superAdmins, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "superadmin")

    if (roleError) {
      console.error("Error getting superadmin users:", roleError)
      return { data: null, error: roleError }
    }

    if (!superAdmins || superAdmins.length === 0) {
      console.log("No superadmin users found")
      return { data: null, error: null }
    }

    // Obtener los user_ids de los superadmins
    const superAdminIds = superAdmins.map((admin) => admin.user_id)
    console.log("Found superadmin IDs:", superAdminIds)

    // Buscar configuración de cualquier superadmin
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .in("user_id", superAdminIds)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (settingsError) {
      console.error("Error getting superadmin settings:", settingsError)
      return { data: null, error: settingsError }
    }

    if (settings && settings.length > 0) {
      console.log("Superadmin settings retrieved successfully:", settings[0])
      return { data: settings[0], error: null }
    } else {
      console.log("No superadmin settings found")
      return { data: null, error: null }
    }
  } catch (error) {
    console.error("Error getting superadmin settings:", error)
    return { data: null, error }
  }
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    console.log("Updating user settings for user:", userId, settings)

    // Verificar si el usuario es superadmin
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).single()

    const isSuperAdmin = roleData?.role === "superadmin"
    console.log("User role check - isSuperAdmin:", isSuperAdmin, "role:", roleData?.role)

    // Preparar configuración para guardar
    const finalSettings = {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    }

    console.log("Final settings to save:", finalSettings)

    // Usar upsert para crear o actualizar según sea necesario
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(finalSettings, {
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

// Mejorar la función getCurrentUserRole
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

// Servicios para Templates
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
