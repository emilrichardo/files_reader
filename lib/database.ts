import { supabase } from "./supabase"
import type { Document, Template, DocumentRow, UserSettings } from "./types"

// Servicios para User Settings
export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    return { data, error }
  } catch (error) {
    console.error("Error getting user settings:", error)
    return { data: null, error }
  }
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

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
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        document_rows (*)
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) return { data: null, error }

    // Transformar los datos para que coincidan con el tipo Document
    const documents =
      data?.map((doc) => ({
        ...doc,
        rows: doc.document_rows || [],
      })) || []

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
    const { data, error } = await supabase.from("documents").insert(document).select().single()

    return { data, error }
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
    const { data, error } = await supabase.from("document_rows").insert(row).select().single()

    return { data, error }
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
