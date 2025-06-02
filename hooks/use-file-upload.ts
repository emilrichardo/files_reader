"use client"

import { useState } from "react"
import type { FileMetadata, DocumentRow, DocumentField } from "@/lib/types"
import { useTheme } from "@/contexts/theme-context"

interface UseFileUploadReturn {
  uploadFile: (file: File, entries?: DocumentRow[], fieldsStructure?: DocumentField[]) => Promise<FileMetadata>
  isUploading: boolean
  uploadProgress: number
  apiResponse: any
  isWaitingApiResponse: boolean
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isWaitingApiResponse, setIsWaitingApiResponse] = useState(false)
  const { settings } = useTheme()

  const uploadFile = async (
    file: File,
    entries: DocumentRow[] = [],
    fieldsStructure: DocumentField[] = [],
  ): Promise<FileMetadata> => {
    console.log("🚀 Iniciando carga de archivo:", file.name)
    setIsUploading(true)
    setUploadProgress(0)
    setApiResponse(null)

    try {
      // Simular progreso de carga inicial
      setUploadProgress(20)

      // Si hay un endpoint configurado, hacer POST PRIMERO
      if (settings?.api_endpoint) {
        console.log("📡 Endpoint encontrado:", settings.api_endpoint)
        setIsWaitingApiResponse(true)

        try {
          // Convertir archivo a base64
          const fileBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result as string
              resolve(result.split(",")[1]) // Quitar el prefijo data:...;base64,
            }
            reader.readAsDataURL(file)
          })

          const requestBody = {
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              data: fileBase64,
            },
            entries: entries.map((entry) => ({
              id: entry.id,
              data: entry.data,
              created_at: entry.created_at,
              file_metadata: entry.file_metadata,
            })),
            fieldsStructure: fieldsStructure.map((field) => ({
              id: field.id,
              field_name: field.field_name,
              type: field.type,
              description: field.description,
              formats: field.formats,
              variants: field.variants,
              required: field.required,
              order: field.order,
            })),
          }

          console.log("📤 Enviando POST con body:", {
            file: { name: file.name, type: file.type, size: file.size },
            entries: entries.length + " entradas",
            fieldsStructure: fieldsStructure.length + " campos",
          })

          const response = await fetch(settings.api_endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          console.log("📡 Status de respuesta:", response.status)

          if (response.ok) {
            const responseText = await response.text()
            console.log("✅ Respuesta exitosa:", responseText)

            try {
              const responseData = JSON.parse(responseText)
              setApiResponse(responseData)
            } catch {
              setApiResponse({ message: responseText })
            }
          } else {
            console.warn("⚠️ Error en respuesta:", response.status)
            const errorText = await response.text()
            setApiResponse({
              error: `HTTP ${response.status}`,
              message: errorText || "Error desconocido",
            })
          }
        } catch (error) {
          console.error("❌ Error en POST:", error)
          setApiResponse({
            error: "Error de conexión",
            message: error instanceof Error ? error.message : "Error desconocido",
          })
        } finally {
          setIsWaitingApiResponse(false)
        }
      } else {
        console.log("ℹ️ No hay endpoint configurado")
        setApiResponse({ message: "No hay endpoint configurado" })
      }

      // Continuar con el procesamiento del archivo
      setUploadProgress(60)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUploadProgress(100)

      // Crear URL temporal para el archivo
      const fileUrl = URL.createObjectURL(file)

      const fileMetadata: FileMetadata = {
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        upload_date: new Date().toISOString(),
        file_url: fileUrl,
      }

      console.log("✅ Archivo procesado exitosamente:", fileMetadata)
      return fileMetadata
    } catch (error) {
      console.error("💥 Error general:", error)
      throw error
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    apiResponse,
    isWaitingApiResponse,
  }
}
