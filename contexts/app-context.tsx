"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Document, Template } from "@/lib/types"

interface AppContextType {
  documents: Document[]
  templates: Template[]
  addDocument: (doc: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => string
  getDocument: (id: string) => Document | undefined
}

const AppContext = createContext<AppContextType>({
  documents: [],
  templates: [],
  addDocument: () => "",
  getDocument: () => undefined,
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<Template[]>([])

  const addDocument = (docData: Omit<Document, "id" | "created_at" | "updated_at" | "rows">) => {
    const now = new Date().toISOString()
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

  const getDocument = (id: string) => {
    return documents.find((doc) => doc.id === id)
  }

  return (
    <AppContext.Provider value={{ documents, templates, addDocument, getDocument }}>{children}</AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
