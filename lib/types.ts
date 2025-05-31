export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Document {
  id: string
  name: string
  description?: string
  user_id: string
  fields: DocumentField[]
  rows: DocumentRow[]
  created_at: string
  updated_at: string
}

export interface DocumentField {
  id: string
  field_name: string
  type: "text" | "date" | "number" | "boolean" | "email" | "url"
  description?: string
  formats?: string[]
  required: boolean
  order: number
}

export interface DocumentRow {
  id: string
  document_id: string
  data: Record<string, any>
  file_metadata?: FileMetadata
  created_at: string
}

export interface FileMetadata {
  filename: string
  file_size: number
  file_type: string
  upload_date: string
  file_url?: string
}

export interface Template {
  id: string
  name: string
  description?: string
  user_id: string
  fields: DocumentField[]
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  project_name: string // Nuevo campo para el nombre del proyecto
  api_endpoint?: string
  api_keys: Record<string, string>
  theme: "light" | "dark"
  color_scheme: string
  company_logo?: string
  company_logo_type?: "jpg" | "png" | "svg" // Nuevo campo para el tipo de logo
  updated_at: string
}
