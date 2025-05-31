"use client"

import { useState } from "react"
import type { FileMetadata } from "@/lib/types"

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<FileMetadata>
  isUploading: boolean
  uploadProgress: number
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFile = async (file: File): Promise<FileMetadata> => {
    setIsUploading(true)
    setUploadProgress(0)

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

    setIsUploading(false)
    setUploadProgress(0)

    return fileMetadata
  }

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  }
}
