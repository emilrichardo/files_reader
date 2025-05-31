"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import {
  createDocument,
  getDocuments,
  deleteDocument as deleteDocumentFromDB,
  updateDocument as updateDocumentInDB,
  createDocumentRow,
  deleteDocumentRow as deleteDocumentRowFromDB,
} from "@/lib/database"
import { mockDocuments, mockTemplates } from "@/lib/mock-data"
import type { Document, Template, DocumentRow } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  addDocument: (doc: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => Promise<string>
  getDocument: (id: string) => Document | undefined
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  addRowToDocument: (documentId: string, row: DocumentRow) => Promise<void>
  updateDocumentRow: (documentId: string, rowId: string, data: Record<string, any>) => Promise<void>
  deleteDocumentRow: (documentId: string, rowId: string) => Promise<void>
  addTemplate: (template: Omit<Template, "id" | "created_at">) => string
  deleteTemplate: (id: string) => void
  loading: boolean
  refreshDocuments: () => Promise<void>
}

const AppContext = createContext<AppContextType>({
  documents: [],
  templates: [],
  addDocument: async () => "",
  getDocument: () => undefined,
  updateDocument: async () => {},
  deleteDocument: async () => {},
  addRowToDocument: async () => {},
  updateDocumentRow: async () => {},
  deleteDocumentRow: async () => {},
  addTemplate: () => "",
  deleteTemplate: () => {},
  loading: true,
  refreshDocuments: async () => {},
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [loading, setLoading] = useState(true)

  // Función para refrescar documentos
  const refreshDocuments = async () => {
    if (user) {
      try {
        const { data, error } = await getDocuments(user.id)
        if (error) {
          console.error("Error loading documents:", error)
          setDocuments(mockDocuments)
        } else if (data) {
          console.log("Documents refreshed:", data)
          setDocuments(data)
        }
      } catch (error) {
        console.error("Error in refreshDocuments:", error)
        setDocuments(mockDocuments)
      }
    } else {
      setDocuments(mockDocuments)
    }
  }

  // Cargar documentos cuando el usuario cambia
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      await refreshDocuments()
      setLoading(false)
    }

    loadDocuments()
  }, [user])

  const addDocument = async (docData: Omit<Document, "id" | "created_at" | "updated_at" | "rows">): Promise<string> => {
    const now = new Date().toISOString()

    try {
      if (user) {
        // Guardar en la base de datos
        const { data, error } = await createDocument({
          ...docData,
          user_id: user.id,
        })

        if (error) {
          console.error("Error creating document in database:", error)
          throw error
        }

        if (!data) {
          throw new Error("No data returned from createDocument")
        }

        // Crear el documento con el ID devuelto por la base de datos
        const newDoc: Document = {
          ...data,
          fields: docData.fields,
          rows: [],
          created_at: data.created_at || now,
          updated_at: data.updated_at || now,
        }

        setDocuments((prev) => [newDoc, ...prev])
        console.log("Document created successfully:", newDoc)
        return newDoc.id
      } else {
        // Modo offline/demo
        const newDoc: Document = {
          id: Date.now().toString(),
          created_at: now,
          updated_at: now,
          rows: [],
          ...docData,
        }
        setDocuments((prev) => [newDoc, ...prev])
        return newDoc.id
      }
    } catch (error) {
      console.error("Error in addDocument:", error)
      // Fallback a modo offline
      const newDoc: Document = {
        id: Date.now().toString(),
        created_at: now,
        updated_at: now,
        rows: [],
        ...docData,
      }
      setDocuments((prev) => [newDoc, ...prev])
      return newDoc.id
    }
  }

  const getDocument = (id: string) => {
    return documents.find((doc) => doc.id === id)
  }

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      if (user) {
        // Actualizar en la base de datos
        const { error } = await updateDocumentInDB(id, updates)
        if (error) {
          console.error("Error updating document in database:", error)
          throw error
        }
      }

      // Actualizar en el estado local
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                ...updates,
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
      console.log("Document updated successfully")
    } catch (error) {
      console.error("Error in updateDocument:", error)
      // Actualizar solo en el estado local como fallback
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                ...updates,
                updated_at: new Date().toISOString(),
              }
            : doc,
        ),
      )
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      if (user) {
        // Eliminar de la base de datos
        const { error } = await deleteDocumentFromDB(id)
        if (error) {
          console.error("Error deleting document from database:", error)
          throw error
        }
      }

      // Eliminar del estado local
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      console.log("Document deleted successfully")
    } catch (error) {
      console.error("Error in deleteDocument:", error)
      // Eliminar solo del estado local como fallback
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    }
  }

  const addRowToDocument = async (documentId: string, row: DocumentRow) => {
    try {
      const document = getDocument(documentId)
      if (!document) {
        console.error("Document not found:", documentId)
        return
      }

      let finalRow = { ...row }

      if (user) {
        // Guardar en la base de datos
        const { data, error } = await createDocumentRow({
          ...row,
          document_id: documentId,
        })

        if (error) {
          console.error("Error creating document row in database:", error)
          throw error
        }

        // Usar el ID devuelto por la base de datos
        if (data) {
          finalRow = { ...row, id: data.id }
        }
      }

      // Actualizar en el estado local
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            const updatedDoc = {
              ...doc,
              rows: [...doc.rows, finalRow],
              updated_at: new Date().toISOString(),
            }
            console.log("Row added to document:", updatedDoc)
            return updatedDoc
          }
          return doc
        }),
      )
      console.log("Row added successfully to document:", documentId)
    } catch (error) {
      console.error("Error in addRowToDocument:", error)
      // Actualizar solo en el estado local como fallback
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              rows: [...doc.rows, row],
              updated_at: new Date().toISOString(),
            }
          }
          return doc
        }),
      )
    }
  }

  const updateDocumentRow = async (documentId: string, rowId: string, data: Record<string, any>) => {
    try {
      const document = getDocument(documentId)
      if (!document) return

      if (user) {
        // Actualizar en la base de datos si es necesario
        // Implementar función en lib/database.ts si se requiere
      }

      // Actualizar en el estado local
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              rows: doc.rows.map((row) => (row.id === rowId ? { ...row, data } : row)),
              updated_at: new Date().toISOString(),
            }
          }
          return doc
        }),
      )
      console.log("Row updated successfully")
    } catch (error) {
      console.error("Error in updateDocumentRow:", error)
      // Actualizar solo en el estado local como fallback
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              rows: doc.rows.map((row) => (row.id === rowId ? { ...row, data } : row)),
              updated_at: new Date().toISOString(),
            }
          }
          return doc
        }),
      )
    }
  }

  const deleteDocumentRow = async (documentId: string, rowId: string) => {
    try {
      const document = getDocument(documentId)
      if (!document) return

      if (user) {
        // Eliminar de la base de datos
        const { error } = await deleteDocumentRowFromDB(rowId)
        if (error) {
          console.error("Error deleting document row from database:", error)
          throw error
        }
      }

      // Eliminar del estado local
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              rows: doc.rows.filter((row) => row.id !== rowId),
              updated_at: new Date().toISOString(),
            }
          }
          return doc
        }),
      )
      console.log("Row deleted successfully")
    } catch (error) {
      console.error("Error in deleteDocumentRow:", error)
      // Eliminar solo del estado local como fallback
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              rows: doc.rows.filter((row) => row.id !== rowId),
              updated_at: new Date().toISOString(),
            }
          }
          return doc
        }),
      )
    }
  }

  const addTemplate = (templateData: Omit<Template, "id" | "created_at">) => {
    const now = new Date().toISOString()
    const newTemplate: Template = {
      id: Date.now().toString(),
      created_at: now,
      ...templateData,
    }
    setTemplates((prev) => [newTemplate, ...prev])
    return newTemplate.id
  }

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        templates,
        addDocument,
        getDocument,
        updateDocument,
        deleteDocument,
        addRowToDocument,
        updateDocumentRow,
        deleteDocumentRow,
        addTemplate,
        deleteTemplate,
        loading,
        refreshDocuments,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
