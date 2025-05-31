"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Document, Template, DocumentField, DocumentRow } from "@/lib/types"
import { useAuth } from "./auth-context"
import {
  getDocuments,
  createDocument as createDocumentInDB,
  updateDocument as updateDocumentInDB,
  deleteDocument as deleteDocumentFromDB,
  getTemplates,
  createTemplate as createTemplateInDB,
  updateTemplate as updateTemplateInDB,
  deleteTemplate as deleteTemplateFromDB,
  createDocumentRow,
  updateDocumentRow as updateDocumentRowInDB,
  deleteDocumentRow as deleteDocumentRowFromDB,
} from "@/lib/database"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  loading: boolean
  addDocument: (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => Promise<string | null>
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  getDocument: (id: string) => Document | undefined
  addTemplate: (template: Omit<Template, "id" | "created_at">) => Promise<string | null>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  getTemplate: (id: string) => Template | undefined
  addRowToDocument: (documentId: string, row: Omit<DocumentRow, "id" | "created_at">) => Promise<void>
  updateDocumentRow: (documentId: string, rowId: string, data: Record<string, any>) => Promise<void>
  deleteDocumentRow: (documentId: string, rowId: string) => Promise<void>
  updateDocumentFields: (documentId: string, fields: DocumentField[]) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setDocuments([])
      setTemplates([])
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Cargar documentos y plantillas en paralelo
      const [documentsResult, templatesResult] = await Promise.all([getDocuments(user.id), getTemplates(user.id)])

      if (documentsResult.data) {
        setDocuments(documentsResult.data)
      }

      if (templatesResult.data) {
        setTemplates(templatesResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await loadData()
  }

  const addDocument = async (
    documentData: Omit<Document, "id" | "created_at" | "updated_at" | "rows">,
  ): Promise<string | null> => {
    if (!user) return null

    try {
      console.log("Creating document:", documentData)

      const { data, error } = await createDocumentInDB({
        ...documentData,
        user_id: user.id,
      })

      if (error) {
        console.error("Error creating document in DB:", error)
        // Fallback: crear documento localmente
        const localDoc = {
          ...documentData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rows: [],
        }
        setDocuments((prev) => [localDoc, ...prev])
        return localDoc.id
      }

      if (data) {
        const newDocument = { ...data, rows: [] }
        setDocuments((prev) => [newDocument, ...prev])
        return data.id
      }

      return null
    } catch (error) {
      console.error("Error in addDocument:", error)
      // Fallback: crear documento localmente
      const localDoc = {
        ...documentData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rows: [],
      }
      setDocuments((prev) => [localDoc, ...prev])
      return localDoc.id
    }
  }

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      console.log("Updating document:", id, updates)

      // Actualizar en la lista local inmediatamente
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updated_at: new Date().toISOString() } : doc)),
      )

      // Intentar actualizar en la base de datos
      const { error } = await updateDocumentInDB(id, updates)

      if (error) {
        console.error("Error updating document in DB:", error)
        // El estado local ya se actualizó, solo mostrar warning
      }
    } catch (error) {
      console.error("Error in updateDocument:", error)
      // El estado local ya se actualizó
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await deleteDocumentFromDB(id)

      if (error) {
        console.error("Error deleting document:", error)
        return
      }

      // Eliminar de la lista local
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch (error) {
      console.error("Error in deleteDocument:", error)
    }
  }

  const getDocument = (id: string): Document | undefined => {
    return documents.find((doc) => doc.id === id)
  }

  const addTemplate = async (templateData: Omit<Template, "id" | "created_at">): Promise<string | null> => {
    if (!user) return null

    try {
      const { data, error } = await createTemplateInDB({
        ...templateData,
        user_id: user.id,
      })

      if (error || !data) {
        console.error("Error creating template:", error)
        return null
      }

      // Agregar a la lista local
      setTemplates((prev) => [data, ...prev])

      return data.id
    } catch (error) {
      console.error("Error in addTemplate:", error)
      return null
    }
  }

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const { error } = await updateTemplateInDB(id, updates)

      if (error) {
        console.error("Error updating template:", error)
        return
      }

      // Actualizar en la lista local
      setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
    } catch (error) {
      console.error("Error in updateTemplate:", error)
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await deleteTemplateFromDB(id)

      if (error) {
        console.error("Error deleting template:", error)
        return
      }

      // Eliminar de la lista local
      setTemplates((prev) => prev.filter((template) => template.id !== id))
    } catch (error) {
      console.error("Error in deleteTemplate:", error)
    }
  }

  const getTemplate = (id: string): Template | undefined => {
    return templates.find((template) => template.id === id)
  }

  const addRowToDocument = async (documentId: string, rowData: Omit<DocumentRow, "id" | "created_at">) => {
    try {
      const { data, error } = await createDocumentRow({
        ...rowData,
        document_id: documentId,
      })

      if (error || !data) {
        console.error("Error creating document row:", error)
        return
      }

      // Actualizar el documento local
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                rows: [data, ...doc.rows],
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error in addRowToDocument:", error)
    }
  }

  const updateDocumentRow = async (documentId: string, rowId: string, data: Record<string, any>) => {
    try {
      const { error } = await updateDocumentRowInDB(rowId, { data })

      if (error) {
        console.error("Error updating document row:", error)
        return
      }

      // Actualizar en la lista local
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                rows: doc.rows.map((row) => (row.id === rowId ? { ...row, data } : row)),
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error in updateDocumentRow:", error)
    }
  }

  const deleteDocumentRow = async (documentId: string, rowId: string) => {
    try {
      const { error } = await deleteDocumentRowFromDB(rowId)

      if (error) {
        console.error("Error deleting document row:", error)
        return
      }

      // Actualizar en la lista local
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                rows: doc.rows.filter((row) => row.id !== rowId),
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error in deleteDocumentRow:", error)
    }
  }

  const updateDocumentFields = async (documentId: string, fields: DocumentField[]) => {
    try {
      const { error } = await updateDocumentInDB(documentId, { fields })

      if (error) {
        console.error("Error updating document fields:", error)
        return
      }

      // Actualizar en la lista local
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                fields,
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error in updateDocumentFields:", error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        templates,
        loading,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocument,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        addRowToDocument,
        updateDocumentRow,
        deleteDocumentRow,
        updateDocumentFields,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
