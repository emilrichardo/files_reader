"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Document, Template, DocumentRow } from "@/lib/types"
import { useAuth } from "./auth-context"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  loading: boolean
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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Marcar como montado
  useEffect(() => {
    setMounted(true)
    setLoading(false)
  }, [])

  // Cargar datos cuando el usuario cambie y esté montado
  useEffect(() => {
    if (mounted && !authLoading) {
      loadData()
    }
  }, [user, mounted, authLoading])

  const loadData = () => {
    if (typeof window === "undefined") return

    try {
      const storageKey = user ? `app_data_${user.id}` : "app_data_anonymous"
      const savedData = localStorage.getItem(storageKey)

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          setDocuments(parsed.documents || [])
          setTemplates(parsed.templates || [])
        } catch (e) {
          console.error("Error parsing saved data:", e)
          setDocuments([])
          setTemplates([])
        }
      } else {
        setDocuments([])
        setTemplates([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setDocuments([])
      setTemplates([])
    }
  }

  const saveData = () => {
    if (typeof window === "undefined" || !mounted) return

    try {
      const storageKey = user ? `app_data_${user.id}` : "app_data_anonymous"
      const dataToSave = { documents, templates }
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  // Guardar datos cuando cambien
  useEffect(() => {
    if (mounted) {
      saveData()
    }
  }, [documents, templates, mounted])

  const addDocument = (documentData: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
    const now = new Date().toISOString()
    const newDocument: Document = {
      id: generateId(),
      created_at: now,
      updated_at: now,
      rows: [],
      user_id: user?.id || "anonymous",
      ...documentData,
    }

    setDocuments((prev) => [newDocument, ...prev])
    return newDocument.id
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updated_at: new Date().toISOString() } : doc)),
    )
  }

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getDocument = (id: string) => {
    return documents.find((doc) => doc.id === id)
  }

  const addTemplate = (templateData: Omit<Template, "id" | "created_at">) => {
    const newTemplate: Template = {
      id: generateId(),
      created_at: new Date().toISOString(),
      user_id: user?.id || "anonymous",
      ...templateData,
    }

    setTemplates((prev) => [newTemplate, ...prev])
    return newTemplate.id
  }

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
  }

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id))
  }

  const getTemplate = (id: string) => {
    return templates.find((template) => template.id === id)
  }

  const addRowToDocument = (documentId: string, rowData: Omit<DocumentRow, "id" | "created_at">) => {
    const newRow: DocumentRow = {
      id: generateId(),
      created_at: new Date().toISOString(),
      document_id: documentId,
      ...rowData,
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              rows: [...doc.rows, newRow],
              updated_at: new Date().toISOString(),
            }
          : doc,
      ),
    )
  }

  const updateDocumentRow = (documentId: string, rowId: string, data: Record<string, any>) => {
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
  }

  const deleteDocumentRow = (documentId: string, rowId: string) => {
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
