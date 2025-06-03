"use client"

import { useState, useCallback } from "react"
import { useTheme } from "@/contexts/theme-context"
import type { DocumentRow, DocumentField, FileMetadata } from "@/lib/types"

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isWaitingApiResponse, setIsWaitingApiResponse] = useState(false)
  const { settings } = useTheme()

  // Función para resetear la respuesta del API
  const resetApiResponse = useCallback(() => {
    setApiResponse(null)
    setIsWaitingApiResponse(false)
  }, [])

  const uploadFile = useCallback(
    async (file: File, existingRows: DocumentRow[], fields: DocumentField[]): Promise<FileMetadata> => {
      if (!settings?.api_endpoint) {
        throw new Error("API endpoint not configured")
      }

      setIsUploading(true)
      setUploadProgress(0)
      setApiResponse(null)
      setIsWaitingApiResponse(false)

      try {
        // Verificar tamaño del archivo (máximo 2MB)
        const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
        if (file.size > MAX_FILE_SIZE) {
          console.warn("⚠️ Archivo demasiado grande, enviando solo metadatos")

          // Crear metadatos del archivo
          const metadata: FileMetadata = {
            name: file.name,
            type: file.type,
            size: file.size,
            last_modified: new Date(file.lastModified).toISOString(),
          }

          // Simular progreso
          const simulateProgress = () => {
            let progress = 0
            const interval = setInterval(() => {
              progress += 10
              setUploadProgress(Math.min(progress, 100))
              if (progress >= 100) {
                clearInterval(interval)
                setIsUploading(false)
                setIsWaitingApiResponse(true)
              }
            }, 100)
          }

          simulateProgress()

          // Enviar solo metadatos al API
          const formData = new FormData()
          formData.append("metadata", JSON.stringify(metadata))
          formData.append("fields", JSON.stringify(fields))
          formData.append("existing_rows", JSON.stringify(existingRows))
          formData.append("file_too_large", "true")

          // Esperar un poco para simular procesamiento
          await new Promise((resolve) => setTimeout(resolve, 1500))

          try {
            const response = await fetch(settings.api_endpoint, {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`API responded with status ${response.status}`)
            }

            const data = await response.json()
            setApiResponse(data)
            setIsWaitingApiResponse(false)
            return metadata
          } catch (error) {
            console.error("Error calling API:", error)
            setApiResponse({
              error: "Error al procesar el archivo en el servidor",
              message: "El archivo es demasiado grande para ser procesado (máximo 2MB)",
              warning: "Se ha enviado solo los metadatos del archivo",
            })
            setIsWaitingApiResponse(false)
            return metadata
          }
        }

        // Para archivos de tamaño normal, proceder con la carga completa
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fields", JSON.stringify(fields))
        formData.append("existing_rows", JSON.stringify(existingRows))

        // Usar el endpoint de proxy para evitar CORS
        const uploadUrl = "/api/upload-proxy"

        // Simular progreso de carga
        const simulateProgress = () => {
          let progress = 0
          const interval = setInterval(() => {
            progress += 5
            setUploadProgress(Math.min(progress, 95)) // Máximo 95% hasta que se complete
            if (progress >= 95) {
              clearInterval(interval)
            }
          }, 100)
          return interval
        }

        const progressInterval = simulateProgress()

        try {
          // Enviar al endpoint de proxy
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            headers: {
              "X-Target-URL": settings.api_endpoint,
            },
          })

          clearInterval(progressInterval)
          setUploadProgress(100)

          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`)
          }

          const data = await response.json()
          console.log("✅ API Response:", data)
          setApiResponse(data)

          // Crear metadatos del archivo
          const metadata: FileMetadata = {
            name: file.name,
            type: file.type,
            size: file.size,
            last_modified: new Date(file.lastModified).toISOString(),
          }

          setIsUploading(false)
          return metadata
        } catch (error) {
          console.error("Error uploading file:", error)
          clearInterval(progressInterval)
          setUploadProgress(100)
          setIsUploading(false)

          // Crear metadatos del archivo a pesar del error
          const metadata: FileMetadata = {
            name: file.name,
            type: file.type,
            size: file.size,
            last_modified: new Date(file.lastModified).toISOString(),
          }

          const errorResponse = {
            error: true,
            message: error instanceof Error ? error.message : "Error desconocido",
            details: "Error al procesar el archivo en el servidor",
          }
          console.log("❌ Setting error response:", errorResponse)
          setApiResponse(errorResponse)

          return metadata
        }
      } catch (error) {
        console.error("Error in uploadFile:", error)
        setIsUploading(false)
        setUploadProgress(0)
        throw error
      }
    },
    [settings?.api_endpoint],
  )

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    apiResponse,
    isWaitingApiResponse,
    resetApiResponse,
  }
}
