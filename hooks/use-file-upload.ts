"use client"

import { useState } from "react"
import type { FileMetadata } from "@/lib/types"
import { useTheme } from "@/contexts/theme-context"

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<FileMetadata>
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

  const uploadFile = async (file: File): Promise<FileMetadata> => {
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
          console.log("📤 Enviando POST con body: test")

          const response = await fetch(settings.api_endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
            body: "test",
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
