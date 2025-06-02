"use client"

import { useState } from "react"
import type { FileMetadata } from "@/lib/types"
import { useTheme } from "@/contexts/theme-context"

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<FileMetadata>
  isUploading: boolean
  uploadProgress: number
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { settings } = useTheme()

  const uploadFile = async (file: File): Promise<FileMetadata> => {
    console.log("Iniciando carga de archivo:", file.name)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Si hay un endpoint configurado, hacer POST
      if (settings.api_endpoint) {
        try {
          console.log("📡 Enviando POST a:", settings.api_endpoint)
          const response = await fetch(settings.api_endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "test" }),
          })

          console.log("📡 Respuesta del endpoint:", response.status)
          if (response.ok) {
            console.log("✅ POST enviado exitosamente")
          } else {
            console.warn("⚠️ POST falló con status:", response.status)
          }
        } catch (endpointError) {
          console.error("❌ Error enviando POST al endpoint:", endpointError)
          // No fallar la carga del archivo si el endpoint falla
        }
      } else {
        console.log("ℹ️ No hay endpoint configurado, saltando POST")
      }

      // Simular tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1500))

      clearInterval(progressInterval)
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

      console.log("Archivo procesado exitosamente:", fileMetadata)
      return fileMetadata
    } catch (error) {
      console.error("Error al procesar el archivo:", error)
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  }
}
