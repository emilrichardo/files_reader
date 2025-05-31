"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/contexts/auth-context"
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument as deleteDocumentDB,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate as deleteTemplateDB,
} from "@/lib/database"
import type { Document, Template, DocumentRow } from "@/lib/types"
import { mockDocuments, mockTemplates } from "@/lib/mock-data"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  loading: boolean
  addDocument: (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => string
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  addDocumentRow: (documentId: string, row: Omit<DocumentRow, "id" | "created_at">) => string
  updateDocumentRow: (documentId: string, rowId: string, updates: Partial<DocumentRow>) => void
  deleteDocumentRow: (documentId: string, rowId: string) => void
  addTemplate: (template: Omit<Template, "id" | "created_at">) => string
  updateTemplate: (id: string, updates: Partial<Template>) => void
  deleteTemplate: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Cargar datos cuando cambia el usuario
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        if (user) {
          console.log("Loading data for authenticated user:", user.email)
          // Usuario autenticado: cargar desde la base de datos
          await loadUserData(user.id)
        } else {
          console.log("Loading data for anonymous user")
          // Usuario anónimo: cargar desde localStorage o usar datos de ejemplo
          loadLocalData()
        }
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback a datos locales en caso de error
        loadLocalData()
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    loadData()
  }, [user])

  // Guardar datos localmente cuando cambian
  useEffect(() => {
    if (initialized) {
      saveLocalData()
    }
  }, [documents, templates, initialized])

  const loadUserData = async (userId: string) => {
    try {
      // Cargar documentos
      const { data: docsData, error: docsError } = await getDocuments(userId)
      if (docsError) {
        console.error("Error loading documents:", docsError)
        // Intentar cargar desde localStorage como fallback
        const localDocs = localStorage.getItem("documents")
        if (localDocs) {
          setDocuments(JSON.parse(localDocs))
        } else {
          setDocuments(mockDocuments)
        }
      } else {
        setDocuments(docsData || [])
      }

      // Cargar plantillas
      const { data: templatesData, error: templatesError } = await getTemplates(userId)
      if (templatesError) {
        console.error("Error loading templates:", templatesError)
        // Intentar cargar desde localStorage como fallback
        const localTemplates = localStorage.getItem("templates")
        if (localTemplates) {
          setTemplates(JSON.parse(localTemplates))
        } else {
          setTemplates(mockTemplates)
        }
      } else {
        setTemplates(templatesData || [])
      }
    } catch (error) {
      console.error("Error in loadUserData:", error)
      loadLocalData() // Fallback a datos locales
    }
  }

  const loadLocalData = () => {
    try {
      // Intentar cargar documentos desde localStorage
      const localDocs = localStorage.getItem("documents")
      if (localDocs) {
        setDocuments(JSON.parse(localDocs))
      } else {
        setDocuments(mockDocuments)
      }

      // Intentar cargar plantillas desde localStorage
      const localTemplates = localStorage.getItem("templates")
      if (localTemplates) {
        setTemplates(JSON.parse(localTemplates))
      } else {
        setTemplates(mockTemplates)
      }
    } catch (error) {
      console.error("Error loading local data:", error)
      // Usar datos de ejemplo como último recurso
      setDocuments(mockDocuments)
      setTemplates(mockTemplates)
    }
  }

  const saveLocalData = () => {
    try {
      localStorage.setItem("documents", JSON.stringify(documents))
      localStorage.setItem("templates", JSON.stringify(templates))
    } catch (error) {
      console.error("Error saving local data:", error)
    }
  }

  // Funciones para documentos
  const addDocument = (document: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
    const now = new Date().toISOString()
    const newDocument: Document = {
      id: uuidv4(),
      created_at: now,
      updated_at: now,
      rows: [],
      ...document,
    }

    setDocuments((prev) => [newDocument, ...prev])

    // Si el usuario está autenticado, guardar en la base de datos
    if (user) {
      createDocument({
        name: newDocument.name,
        description: newDocument.description,
        user_id: newDocument.user_id,
        fields: newDocument.fields,
      }).catch((error) => {
        console.error("Error creating document in database:", error)
      })
    }

    return newDocument.id
  }

  const updateDocumentState = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          return {
            ...doc,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        }
        return doc
      }),
    )
  }

  const handleUpdateDocument = (id: string, updates: Partial<Document>) => {
    updateDocumentState(id, updates)

    // Si el usuario está autenticado, actualizar en la base de datos
    if (user) {
      updateDocument(id, updates).catch((error) => {
        console.error("Error updating document in database:", error)
      })
    }
  }

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))

    // Si el usuario está autenticado, eliminar de la base de datos
    if (user) {
      deleteDocumentDB(id).catch((error) => {
        console.error("Error deleting document from database:", error)
      })
    }
  }

  // Funciones para filas de documentos
  const addDocumentRow = (documentId: string, row: Omit<DocumentRow, "id" | "created_at">) => {
    const now = new Date().toISOString()
    const newRow: DocumentRow = {
      id: uuidv4(),
      created_at: now,
      ...row,
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            rows: [...doc.rows, newRow],
            updated_at: now,
          }
        }
        return doc
      }),
    )

    return newRow.id
  }

  const updateDocumentRow = (documentId: string, rowId: string, updates: Partial<DocumentRow>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            rows: doc.rows.map((row) => {
              if (row.id === rowId) {
                return {
                  ...row,
                  ...updates,
                }
              }
              return row
            }),
            updated_at: new Date().toISOString(),
          }
        }
        return doc
      }),
    )
  }

  const deleteDocumentRow = (documentId: string, rowId: string) => {
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

  // Funciones para plantillas
  const addTemplate = (template: Omit<Template, "id" | "created_at">) => {
    const now = new Date().toISOString()
    const newTemplate: Template = {
      id: uuidv4(),
      created_at: now,
      ...template,
    }

    setTemplates((prev) => [newTemplate, ...prev])

    // Si el usuario está autenticado, guardar en la base de datos
    if (user) {
      createTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        user_id: newTemplate.user_id,
        fields: newTemplate.fields,
      }).catch((error) => {
        console.error("Error creating template in database:", error)
      })
    }

    return newTemplate.id
  }

  const handleUpdateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id === id) {
          return {
            ...template,
            ...updates,
          }
        }
        return template
      }),
    )

    // Si el usuario está autenticado, actualizar en la base de datos
    if (user) {
      updateTemplate(id, updates).catch((error) => {
        console.error("Error updating template in database:", error)
      })
    }
  }

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id))

    // Si el usuario está autenticado, eliminar de la base de datos
    if (user) {
      deleteTemplateDB(id).catch((error) => {
        console.error("Error deleting template from database:", error)
      })
    }
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        templates,
        loading,
        addDocument,
        updateDocument: handleUpdateDocument,
        deleteDocument,
        addDocumentRow,
        updateDocumentRow,
        deleteDocumentRow,
        addTemplate,
        updateTemplate: handleUpdateTemplate,
        deleteTemplate,
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
