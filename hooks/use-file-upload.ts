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

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Extraer solo la parte base64 (eliminar el prefijo data:image/jpeg;base64,)
        const base64String = (reader.result as string).split(",")[1]
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const uploadFile = useCallback(
    async (
      file: File,
      existingRows: DocumentRow[],
      fields: DocumentField[],
    ): Promise<{
      metadata: FileMetadata
      apiData?: any
    }> => {
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
            return { metadata, apiData: data }
          } catch (error) {
            console.error("Error calling API:", error)
            const errorResponse = {
              error: "Error al procesar el archivo en el servidor",
              message: "El archivo es demasiado grande para ser procesado (máximo 2MB)",
              warning: "Se ha enviado solo los metadatos del archivo",
            }
            setApiResponse(errorResponse)
            setIsWaitingApiResponse(false)
            return { metadata, apiData: errorResponse }
          }
        }

        // Para archivos de tamaño normal, proceder con la carga completa
        setUploadProgress(10)
        console.log("🔄 Preparando archivo para subir...")

        try {
          // Usar FormData para enviar el archivo
          const formData = new FormData()
          formData.append("file", file)
          formData.append("fields", JSON.stringify(fields))
          formData.append("existing_rows", JSON.stringify(existingRows))

          // Usar el endpoint de proxy para evitar CORS
          const uploadUrl = "/api/upload-proxy"

          // Simular progreso de carga
          setUploadProgress(30)
          console.log("📤 Enviando archivo al proxy...")

          // Enviar al endpoint de proxy
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            headers: {
              "X-Target-URL": settings.api_endpoint,
            },
          })

          setUploadProgress(90)
          console.log(`📡 Respuesta del proxy: ${response.status}`)

          if (!response.ok) {
            const errorText = await response.text()
            console.error("❌ Error del proxy:", errorText)
            throw new Error(`API responded with status ${response.status}`)
          }

          const data = await response.json()
          console.log("✅ API Response:", data)
          setApiResponse(data)
          setUploadProgress(100)
          setIsUploading(false)

          // Crear metadatos del archivo
          const metadata: FileMetadata = {
            name: file.name,
            type: file.type,
            size: file.size,
            last_modified: new Date(file.lastModified).toISOString(),
          }

          return { metadata, apiData: data }
        } catch (error) {
          console.error("Error uploading file:", error)
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

          return { metadata, apiData: errorResponse }
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
