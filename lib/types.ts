export interface DocumentField {
  id: string
  field_name: string
  type: string
  required: boolean
  description?: string
  formats?: string[]
  variants?: string[]
  order?: number
}

export interface DocumentRow {
  id?: string
  document_id?: string
  data: Record<string, any>
  file_metadata?: {
    name?: string
    type?: string
    size?: number
    url?: string
  }
  created_at?: string
  updated_at?: string
}

export interface Document {
  id: string
  name: string
  description?: string
  user_id: string
  fields: DocumentField[]
  rows: DocumentRow[]
  created_at: string
  updated_at?: string
}

export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  user_id?: string
  fields: DocumentField[]
  created_at: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: string
}

export interface ThemeSettings {
  mode?: "light" | "dark" | "system"
  primaryColor?: string
  accentColor?: string
  fontFamily?: string
  borderRadius?: string
  customCss?: string
}
