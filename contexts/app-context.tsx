"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Document, Template, DocumentField, DocumentRow } from "@/lib/types"
import { mockDocuments, mockTemplates } from "@/lib/mock-data"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  addDocument: (document: Omit<Document, "id" | "created_at" | "updated_at">) => string
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
  updateDocumentFields: (documentId: string, fields: DocumentField[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  DOCUMENTS: "docmanager_documents",
  TEMPLATES: "docmanager_templates",
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES)

      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments))
      } else {
        // Si no hay datos guardados, usar datos mock
        setDocuments(mockDocuments)
      }

      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates))
      } else {
        // Si no hay datos guardados, usar datos mock
        setTemplates(mockTemplates)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      setDocuments(mockDocuments)
      setTemplates(mockTemplates)
    }
    setIsLoaded(true)
  }, [])

  // Guardar documentos en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
    }
  }, [documents, isLoaded])

  // Guardar plantillas en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
    }
  }, [templates, isLoaded])

  const addDocument = (documentData: Omit<Document, "id" | "created_at" | "updated_at">): string => {
    const newDocument: Document = {
      ...documentData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setDocuments((prev) => [newDocument, ...prev])
    return newDocument.id
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
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

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getDocument = (id: string): Document | undefined => {
    return documents.find((doc) => doc.id === id)
  }

  const addTemplate = (templateData: Omit<Template, "id" | "created_at">): string => {
    const newTemplate: Template = {
      ...templateData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
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

  const getTemplate = (id: string): Template | undefined => {
    return templates.find((template) => template.id === id)
  }

  const addRowToDocument = (documentId: string, rowData: Omit<DocumentRow, "id" | "created_at">) => {
    const newRow: DocumentRow = {
      ...rowData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              rows: [newRow, ...doc.rows],
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

  const updateDocumentFields = (documentId: string, fields: DocumentField[]) => {
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
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        templates,
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
