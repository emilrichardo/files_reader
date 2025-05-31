"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Document, Template, DocumentRow } from "@/lib/types"
import { useAuth } from "./auth-context"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  loading: boolean
  isHydrated: boolean
  addDocument: (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => string
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  getDocument: (id: string) => Document | undefined
  addTemplate: (template: Omit<Template, "id" | "created_at">) => string
  updateTemplate: (id: string, updates: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => Template | undefined
  addRowToDocument: (documentId: string, row: Omit<DocumentRow, "id" | "created_at">) => void
  updateDocumentRow: (documentId: string, rowId: string, data: Record<string, any>) => void
  deleteDocumentRow: (documentId: string, rowId: string) => void
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Función para generar IDs únicos de forma consistente
const generateId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000000)
  return `${timestamp}-${random}`
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Marcar como hidratado después del primer render
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Cargar datos cuando cambia el estado de autenticación y está hidratado
  useEffect(() => {
    if (!authLoading && isHydrated) {
      loadData()
    }
  }, [user, authLoading, isHydrated])

  // Guardar datos cuando cambien (solo si está hidratado)
  useEffect(() => {
    if (isHydrated && !loading) {
      saveToLocalStorage()
    }
  }, [documents, templates, isHydrated, loading])

  const loadData = () => {
    if (typeof window === "undefined") return

    try {
      setLoading(true)

      const key = user ? `_${user.id}` : "_anonymous"

      // Cargar documentos
      const savedDocuments = localStorage.getItem(`app_documents${key}`)
      if (savedDocuments) {
        try {
          const parsedDocs = JSON.parse(savedDocuments)
          setDocuments(Array.isArray(parsedDocs) ? parsedDocs : [])
        } catch (e) {
          console.error("Error parsing saved documents:", e)
          setDocuments([])
        }
      } else {
        setDocuments([])
      }

      // Cargar plantillas
      const savedTemplates = localStorage.getItem(`app_templates${key}`)
      if (savedTemplates) {
        try {
          const parsedTemplates = JSON.parse(savedTemplates)
          setTemplates(Array.isArray(parsedTemplates) ? parsedTemplates : [])
        } catch (e) {
          console.error("Error parsing saved templates:", e)
          setTemplates([])
        }
      } else {
        setTemplates([])
      }

      console.log("Data loaded successfully")
    } catch (error) {
      console.error("Error loading data:", error)
      setDocuments([])
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const saveToLocalStorage = () => {
    if (typeof window === "undefined") return

    try {
      const key = user ? `_${user.id}` : "_anonymous"
      localStorage.setItem(`app_documents${key}`, JSON.stringify(documents))
      localStorage.setItem(`app_templates${key}`, JSON.stringify(templates))
      console.log("Data saved to localStorage")
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  const refreshData = async () => {
    if (isHydrated) {
      loadData()
    }
  }

  // Funciones para documentos
  const addDocument = (documentData: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
    try {
      const now = new Date().toISOString()
      const newDocument: Document = {
        id: generateId(),
        created_at: now,
        updated_at: now,
        rows: [],
        ...documentData,
        user_id: user?.id || "anonymous",
      }

      console.log("Adding document:", newDocument.name)
      setDocuments((prev) => [newDocument, ...prev])

      return newDocument.id
    } catch (error) {
      console.error("Error adding document:", error)
      throw error
    }
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    try {
      console.log("Updating document:", id, updates)
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updated_at: new Date().toISOString() } : doc)),
      )
    } catch (error) {
      console.error("Error updating document:", error)
    }
  }

  const deleteDocument = (id: string) => {
    try {
      console.log("Deleting document:", id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const getDocument = (id: string): Document | undefined => {
    return documents.find((doc) => doc.id === id)
  }

  // Funciones para plantillas
  const addTemplate = (templateData: Omit<Template, "id" | "created_at">) => {
    try {
      const now = new Date().toISOString()
      const newTemplate: Template = {
        id: generateId(),
        created_at: now,
        ...templateData,
        user_id: user?.id || "anonymous",
      }

      console.log("Adding template:", newTemplate.name)
      setTemplates((prev) => [newTemplate, ...prev])

      return newTemplate.id
    } catch (error) {
      console.error("Error adding template:", error)
      throw error
    }
  }

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    try {
      console.log("Updating template:", id)
      setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const deleteTemplate = (id: string) => {
    try {
      console.log("Deleting template:", id)
      setTemplates((prev) => prev.filter((template) => template.id !== id))
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const getTemplate = (id: string): Template | undefined => {
    return templates.find((template) => template.id === id)
  }

  // Funciones para filas de documentos
  const addRowToDocument = (documentId: string, rowData: Omit<DocumentRow, "id" | "created_at">) => {
    try {
      const now = new Date().toISOString()
      const newRow: DocumentRow = {
        id: generateId(),
        created_at: now,
        document_id: documentId,
        ...rowData,
      }

      console.log("Adding row to document:", documentId)
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                rows: [...doc.rows, newRow],
                updated_at: now,
              }
            : doc,
        ),
      )
    } catch (error) {
      console.error("Error adding row to document:", error)
    }
  }

  const updateDocumentRow = (documentId: string, rowId: string, data: Record<string, any>) => {
    try {
      console.log("Updating document row:", documentId, rowId)
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
      console.error("Error updating document row:", error)
    }
  }

  const deleteDocumentRow = (documentId: string, rowId: string) => {
    try {
      console.log("Deleting document row:", documentId, rowId)
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
      console.error("Error deleting document row:", error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        templates,
        loading,
        isHydrated,
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
