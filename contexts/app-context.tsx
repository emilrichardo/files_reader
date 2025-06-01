"use client"

import type React from "react"

import { createContext, useState, useEffect } from "react"
import {
  createDocument,
  getDocuments,
  deleteDocument as deleteDocumentFromDB,
  updateDocument as updateDocumentInDB,
  createDocumentRow,
  getTemplates,
} from "@/lib/database"
import { mockDocuments, mockTemplates } from "@/lib/mock-data"
import type { Document, Template, DocumentRow } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  addDocument: (
    doc:
      | Omit<Document, "id" | "created_at" | "updated_at">
      | Omit<Document, "id" | "created_at" | "updated_at" | "rows">,
  ) => Promise<string>
  getDocument: (id: string) => Document | undefined
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  addRowToDocument: (documentId: string, row: DocumentRow) => Promise<void>
  updateDocumentRow: (documentId: string, rowId: string, data: Record<string, any>) => Promise<void>
  deleteDocumentRow: (documentId: string, rowId: string) => Promise<void>
  addTemplate: (template: Omit<Template, "id" | "created_at">) => Promise<string>
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  loading: boolean
  refreshDocuments: () => Promise<void>
  refreshTemplates: () => Promise<void>
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
  addTemplate: async () => "",
  updateTemplate: async () => {},
  deleteTemplate: async () => {},
  loading: true,
  refreshDocuments: async () => {},
  refreshTemplates: async () => {},
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Función para refrescar documentos
  const refreshDocuments = async () => {
    if (user) {
      try {
        console.log("Refreshing documents for user:", user.id)
        const { data, error } = await getDocuments(user.id)
        if (error) {
          console.error("Error loading documents:", error)
          setDocuments(mockDocuments)
        } else if (data) {
          console.log("Documents refreshed successfully:", data.length, "documents")
          setDocuments(data)
        }
      } catch (error) {
        console.error("Error in refreshDocuments:", error)
        setDocuments(mockDocuments)
      }
    } else {
      console.log("No user, using mock documents")
      setDocuments(mockDocuments)
    }
  }

  // Función para refrescar plantillas
  const refreshTemplates = async () => {
    if (user) {
      try {
        console.log("Refreshing templates for user:", user.id)
        const { data, error } = await getTemplates(user.id)
        if (error) {
          console.error("Error loading templates:", error)
          setTemplates(mockTemplates)
        } else if (data) {
          console.log("Templates refreshed successfully:", data.length, "templates")
          setTemplates(data)
        }
      } catch (error) {
        console.error("Error in refreshTemplates:", error)
        setTemplates(mockTemplates)
      }
    } else {
      console.log("No user, using mock templates")
      setTemplates(mockTemplates)
    }
  }

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([refreshDocuments(), refreshTemplates()])
      setLoading(false)
    }

    loadData()
  }, [user])

  const addDocument = async (docData: any): Promise<string> => {
    const now = new Date().toISOString()

    try {
      if (user) {
        // Separar las filas de los datos del documento
        const { rows = [], ...documentData } = docData

        console.log("Creating document with data:", documentData)

        // Asegurar que los campos tengan la estructura correcta
        const processedFields = (documentData.fields || []).map((field: any, index: number) => ({
          ...field,
          id: field.id || `field-${Date.now()}-${index}`,
          order: index,
          formats: field.formats || [],
          variants: field.variants || [],
        }))

        // Guardar documento en la base de datos
        const { data, error } = await createDocument({
          ...documentData,
          user_id: user.id,
          fields: processedFields,
        })

        if (error) {
          console.error("Error creating document in database:", error)
          throw error
        }

        if (!data) {
          throw new Error("No data returned from createDocument")
        }

        console.log("Document created with ID:", data.id)

        // Crear el documento con el ID devuelto por la base de datos
        const newDoc: Document = {
          ...data,
          fields: processedFields,
          rows: [],
        }

        // Si hay filas, agregarlas una por una
        if (rows.length > 0) {
          console.log("Adding", rows.length, "rows to document")
          for (const row of rows) {
            console.log("Adding row:", row)
            const { data: rowData, error: rowError } = await createDocumentRow({
              document_id: newDoc.id,
              data: row.data || {},
              file_metadata: row.file_metadata,
            })

            if (rowError) {
              console.error("Error creating row:", rowError)
            } else if (rowData) {
              newDoc.rows.push(rowData)
              console.log("Row added successfully:", rowData.id)
            }
          }
        }

        // Refrescar documentos para obtener la versión más actualizada
        await refreshDocuments()
        return newDoc.id
      } else {
        // Modo offline/demo
        const newDoc: Document = {
          id: Date.now().toString(),
          created_at: now,
          updated_at: now,
          rows: docData.rows || [],
          user_id: "demo-user",
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
        rows: docData.rows || [],
        user_id: "demo-user",
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
        console.log("Updating document in database:", id, updates)

        // Procesar campos si están incluidos en las actualizaciones
        const processedUpdates = { ...updates }
        if (updates.fields) {
          processedUpdates.fields = updates.fields.map((field, index) => ({
            ...field,
            order: index,
            formats: field.formats || [],
            variants: field.variants || [],
          }))
        }

        // Actualizar en la base de datos
        const { error } = await updateDocumentInDB(id, processedUpdates)
        if (error) {
          console.error("Error updating document in database:", error)
          throw error
        }
        console.log("Document updated in database successfully")
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
      console.log("Document updated in local state successfully")
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

      console.log("Adding row to document:", documentId)
      console.log("Row data:", row.data)

      let finalRow = { ...row }

      if (user) {
        // Guardar en la base de datos
        const { data, error } = await createDocumentRow({
          document_id: documentId,
          data: finalRow.data || {},
          file_metadata: finalRow.file_metadata,
        })

        if (error) {
          console.error("Error creating document row in database:", error)
          throw error
        }

        if (data) {
          console.log("Row created in database with ID:", data.id)
          finalRow = { ...finalRow, id: data.id, created_at: data.created_at, updated_at: data.updated_at }
        }

        // Refrescar documentos para obtener la versión más actualizada
        await refreshDocuments()
      } else {
        // Modo offline - actualizar estado local
        if (!finalRow.id) {
          finalRow.id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }

        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id === documentId) {
              const updatedDoc = {
                ...doc,
                rows: [...(doc.rows || []), finalRow],
                updated_at: new Date().toISOString(),\
