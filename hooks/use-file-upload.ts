"use client"

import { useState } from "react"
import type { DocumentRow, DocumentField, FileMetadata } from "@/lib/types"
import { useTheme } from "@/contexts/theme-context"

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isWaitingApiResponse, setIsWaitingApiResponse] = useState(false)
  const { settings } = useTheme()

  // Función para comprimir imágenes
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Calcular dimensiones máximas basadas en el tamaño del archivo
        const maxDimension = file.size > 1024 * 1024 ? 800 : 1200 // Más agresivo para archivos grandes

        let { width, height } = img

        // Redimensionar manteniendo proporción
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Configurar contexto para mejor calidad
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, width, height)

          // Determinar calidad basada en el tamaño original
          let quality = 0.7
          if (file.size > 2 * 1024 * 1024)
            quality = 0.5 // Muy agresivo para archivos > 2MB
          else if (file.size > 1024 * 1024) quality = 0.6 // Agresivo para archivos > 1MB

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
                console.log(`🗜️ Imagen comprimida: ${file.size} → ${compressedFile.size} bytes`)
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            "image/jpeg",
            quality,
          )
        } else {
          resolve(file)
        }
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Función principal para subir archivos
  const uploadFile = async (
    file: File,
    existingRows: DocumentRow[] = [],
    fields: DocumentField[] = [],
    retryCount = 0,
  ): Promise<FileMetadata> => {
    const maxRetries = 2
    const maxFileSize = 2 * 1024 * 1024 // 2MB

    try {
      setIsUploading(true)
      setUploadProgress(10)
      setApiResponse(null)

      console.log(`📤 Intento ${retryCount + 1} de subida para: ${file.name}`)

      // Verificar tamaño antes de procesar
      if (file.size > maxFileSize) {
        console.log(
          `⚠️ Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxFileSize / 1024 / 1024}MB`,
        )

        // Si es una imagen, intentar comprimir
        if (file.type.startsWith("image/")) {
          console.log("🗜️ Intentando comprimir imagen...")
          file = await compressImage(file)

          // Si después de comprimir sigue siendo muy grande
          if (file.size > maxFileSize) {
            throw new Error(`Archivo demasiado grande después de compresión: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
          }
        } else {
          // Para otros tipos de archivo, solo enviar metadatos
          console.log("📋 Archivo demasiado grande, enviando solo metadatos")

          const metadata: FileMetadata = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            error: "FILE_TOO_LARGE",
            warning: `El archivo excede el límite de ${maxFileSize / 1024 / 1024}MB y no puede ser procesado automáticamente.`,
          }

          setUploadProgress(100)
          setIsUploading(false)
          return metadata
        }
      }

      setUploadProgress(30)

      // Convertir a base64
      console.log("🔄 Convirtiendo archivo a base64...")
      const base64 = await fileToBase64(file)
      console.log(`✅ Archivo convertido a base64, tamaño: ${base64.length}`)

      setUploadProgress(50)

      // Preparar datos para enviar al API
      const body = {
        filename: file.name,
        content: base64,
        size: file.size,
        type: file.type,
        timestamp: Date.now(),
        fields: fields.map((f) => ({
          name: f.field_name,
          type: f.type,
          variants: f.variants || [],
          formats: f.formats || [],
        })),
        existingData: existingRows.map((row) => row.data),
        retryCount,
      }

      console.log("📤 Enviando POST con body:", {
        filename: body.filename,
        size: body.size,
        type: body.type,
        contentLength: body.content.length,
        fieldsCount: body.fields.length,
        existingDataCount: body.existingData.length,
        retryCount: body.retryCount,
      })

      // Usar el proxy interno para evitar CORS
      console.log("🔄 Usando proxy interno para evitar CORS")
      console.log(
        "🎯 Target endpoint:",
        settings?.api_endpoint || "https://cibet.app.n8n.cloud/webhook-test/uploadfile",
      )

      setIsWaitingApiResponse(true)

      const response = await fetch("/api/upload-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      setUploadProgress(80)

      console.log(`📡 Status de respuesta del proxy: ${response.status}`)
      console.log("📡 Headers de respuesta:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`⚠️ Error en respuesta del proxy: ${response.status}`)
        console.log("⚠️ Error text:", errorText)

        // Si es error 413 y no hemos agotado los reintentos, intentar con archivo más pequeño
        if (response.status === 413 && retryCount < maxRetries) {
          console.log("🔄 Reintentando con compresión más agresiva...")

          if (file.type.startsWith("image/")) {
            // Comprimir aún más agresivamente
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()

            return new Promise((resolve, reject) => {
              img.onload = async () => {
                const maxDim = 600 // Muy pequeño para reintentos
                let { width, height } = img

                if (width > height) {
                  if (width > maxDim) {
                    height = (height * maxDim) / width
                    width = maxDim
                  }
                } else {
                  if (height > maxDim) {
                    width = (width * maxDim) / height
                    height = maxDim
                  }
                }

                canvas.width = width
                canvas.height = height

                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height)
                  canvas.toBlob(
                    async (blob) => {
                      if (blob) {
                        const veryCompressedFile = new File([blob], file.name, {
                          type: "image/jpeg",
                          lastModified: Date.now(),
                        })
                        try {
                          const result = await uploadFile(veryCompressedFile, existingRows, fields, retryCount + 1)
                          resolve(result)
                        } catch (error) {
                          reject(error)
                        }
                      } else {
                        reject(new Error("No se pudo comprimir más el archivo"))
                      }
                    },
                    "image/jpeg",
                    0.3,
                  ) // Calidad muy baja
                }
              }
              img.crossOrigin = "anonymous"
              img.src = URL.createObjectURL(file)
            })
          } else {
            throw new Error(`Error ${response.status}: ${errorText}`)
          }
        } else {
          throw new Error(`Error ${response.status}: ${errorText}`)
        }
      }

      const result = await response.json()
      console.log("✅ Archivo procesado exitosamente:", result)

      setApiResponse(result)
      setUploadProgress(100)

      // Crear metadata del archivo
      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
        processingResult: result,
      }

      return metadata
    } catch (error) {
      console.error("❌ Error en uploadFile:", error)

      // Si es un error de red y no hemos agotado los reintentos
      if (retryCount < maxRetries && (error as Error).message.includes("fetch")) {
        console.log(`🔄 Reintentando por error de red... (${retryCount + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1))) // Esperar más tiempo en cada reintento
        return uploadFile(file, existingRows, fields, retryCount + 1)
      }

      setApiResponse({
        error: true,
        message: (error as Error).message,
      })

      // Devolver metadata con error
      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        error: "UPLOAD_ERROR",
        errorMessage: (error as Error).message,
      }

      return metadata
    } finally {
      setIsUploading(false)
      setIsWaitingApiResponse(false)
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
