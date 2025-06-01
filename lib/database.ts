import { supabase } from "./supabase"
import type { Document, Template, DocumentRow, UserSettings } from "./types"

// Servicios para User Settings
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
    } else {
      console.log("User settings updated successfully:", data)
    }

    return { data, error }
  } catch (error) {
    console.error("Error updating user settings:", error)
    return { data: null, error }
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
        *,
        document_rows (
          id,
          document_id,
          data,
          file_metadata,
          created_at
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
        ...doc,
        rows: (doc.document_rows || []).map((row: any) => ({
          id: row.id,
          document_id: row.document_id,
          data: row.data || {},
          file_metadata: row.file_metadata,
          created_at: row.created_at,
        })),
      })) || []

    console.log("Documents retrieved successfully:", documents)
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
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        document_rows (*)
      `)
      .eq("id", id)
      .single()

    if (error) return { data: null, error }

    // Transformar los datos
    const document = {
      ...data,
      rows: data.document_rows || [],
    }

    return { data: document, error: null }
  } catch (error) {
    console.error("Error getting document:", error)
    return { data: null, error }
  }
}

export const createDocument = async (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
  try {
    console.log("Creating document:", document)

    const { data, error } = await supabase.from("documents").insert(document).select().single()

    if (error) {
      console.error("Error creating document:", error)
      return { data: null, error }
    }

    console.log("Document created successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Error creating document:", error)
    return { data: null, error }
  }
}

export const updateDocument = async (id: string, updates: Partial<Document>) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Error updating document:", error)
    return { data: null, error }
  }
}

export const deleteDocument = async (id: string) => {
  try {
    const { error } = await supabase.from("documents").delete().eq("id", id)

    return { error }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { error }
  }
}

// Servicios para Document Rows
export const createDocumentRow = async (row: Omit<DocumentRow, "id" | "created_at">) => {
  try {
    console.log("Creating document row:", row)

    const { data, error } = await supabase.from("document_rows").insert(row).select().single()

    if (error) {
      console.error("Error creating document row:", error)
      return { data: null, error }
    }

    console.log("Document row created successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Error creating document row:", error)
    return { data: null, error }
  }
}

export const updateDocumentRow = async (id: string, updates: Partial<DocumentRow>) => {
  try {
    const { data, error } = await supabase.from("document_rows").update(updates).eq("id", id).select().single()

    return { data, error }
  } catch (error) {
    console.error("Error updating document row:", error)
    return { data: null, error }
  }
}

export const deleteDocumentRow = async (id: string) => {
  try {
    const { error } = await supabase.from("document_rows").delete().eq("id", id)

    return { error }
  } catch (error) {
    console.error("Error deleting document row:", error)
    return { error }
  }
}
