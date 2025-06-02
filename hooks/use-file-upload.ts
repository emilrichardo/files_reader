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

  // Función para comprimir imágenes
  const compressImage = async (file: File, maxSizeInMB = 1): Promise<File> => {
    // Si no es una imagen, devolver el archivo original
    if (!file.type.startsWith("image/")) {
      console.log("📄 No es una imagen, no se comprime:", file.type)
      return file
    }

    console.log("🖼️ Comprimiendo imagen:", file.name, file.size)

    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
          const img = new Image()
          img.src = event.target?.result as string

          img.onload = () => {
            const canvas = document.createElement("canvas")

            // Calcular el factor de compresión basado en el tamaño del archivo
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024
            let quality = 0.7 // Calidad inicial

            if (file.size > maxSizeInBytes) {
              // Reducir calidad proporcionalmente al exceso de tamaño
              quality = Math.max(0.1, 0.7 * (maxSizeInBytes / file.size))
            }

            // Reducir dimensiones si la imagen es muy grande
            let width = img.width
            let height = img.height

            const MAX_DIMENSION = 1200
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              if (width > height) {
                height = Math.round(height * (MAX_DIMENSION / width))
                width = MAX_DIMENSION
              } else {
                width = Math.round(width * (MAX_DIMENSION / height))
                height = MAX_DIMENSION
              }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext("2d")
            ctx?.drawImage(img, 0, 0, width, height)

            // Convertir a blob con la calidad ajustada
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Error al comprimir la imagen"))
                  return
                }

                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })

                console.log(
                  `✅ Imagen comprimida: ${file.size} -> ${compressedFile.size} bytes (${Math.round((compressedFile.size / file.size) * 100)}%)`,
                )
                resolve(compressedFile)
              },
              file.type,
              quality,
            )
          }

          img.onerror = () => {
            console.error("❌ Error al cargar la imagen")
            reject(new Error("Error al cargar la imagen"))
          }
        }

        reader.onerror = () => {
          console.error("❌ Error al leer el archivo")
          reject(new Error("Error al leer el archivo"))
        }
      } catch (error) {
        console.error("❌ Error al comprimir la imagen:", error)
        reject(error)
      }
    })
  }

  // Función para enviar solo metadatos del archivo
  const sendFileMetadataOnly = async (
    file: File,
    entries: DocumentRow[] = [],
    fieldsStructure: DocumentField[] = [],
  ): Promise<any> => {
    console.log("📤 Enviando solo metadatos del archivo (sin contenido)")

    const requestBody = {
      fileMetadata: {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
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
        formats: field.formats || [],
        variants: field.variants || [],
        required: field.required,
        order: field.order,
      })),
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        documentCount: entries.length,
        fieldCount: fieldsStructure.length,
        mode: "metadata_only",
      },
    }

    // Usar el proxy interno
    const proxyUrl = "/api/upload-proxy"

    console.log("🔄 Usando proxy interno para enviar metadatos")
    console.log("🎯 Target endpoint:", settings?.api_endpoint)

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-target-endpoint": settings?.api_endpoint || "",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("📡 Status de respuesta del proxy (metadatos):", response.status)

    if (response.ok) {
      const responseText = await response.text()
      console.log("✅ Respuesta exitosa del proxy (metadatos):", responseText)

      try {
        return JSON.parse(responseText)
      } catch (parseError) {
        return { message: responseText }
      }
    } else {
      const errorText = await response.text()
      console.warn("⚠️ Error en respuesta del proxy (metadatos):", response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  }

  const uploadFile = async (
    file: File,
    entries: DocumentRow[] = [],
    fieldsStructure: DocumentField[] = [],
  ): Promise<FileMetadata> => {
    console.log("🚀 Iniciando carga de archivo:", file.name)
    console.log("📊 Entries:", entries.length)
    console.log("🏗️ Fields Structure:", fieldsStructure.length)
    console.log("⚙️ Settings:", settings)

    setIsUploading(true)
    setUploadProgress(0)
    setApiResponse(null)

    try {
      // Simular progreso de carga inicial
      setUploadProgress(10)

      // Verificar si hay endpoint configurado
      if (!settings?.api_endpoint) {
        console.log("⚠️ No hay endpoint configurado en settings")
        setApiResponse({
          warning: "No hay endpoint configurado",
          message: "Ve a Configuración para establecer un endpoint de API",
        })
      } else {
        console.log("📡 Endpoint encontrado:", settings.api_endpoint)
        setIsWaitingApiResponse(true)

        try {
          // Verificar tamaño del archivo
          const MAX_SIZE_MB = 2
          const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

          setUploadProgress(20)

          // Comprimir imagen si es necesario
          let processedFile = file
          if (file.type.startsWith("image/") && file.size > MAX_SIZE_BYTES) {
            console.log("🖼️ Archivo es una imagen grande, intentando comprimir...")
            try {
              processedFile = await compressImage(file, 1) // Comprimir a ~1MB
              console.log("✅ Imagen comprimida exitosamente")
            } catch (compressError) {
              console.warn("⚠️ No se pudo comprimir la imagen:", compressError)
              // Continuar con el archivo original
            }
          }

          setUploadProgress(30)

          // Si el archivo sigue siendo demasiado grande, enviar solo metadatos
          if (processedFile.size > MAX_SIZE_BYTES) {
            console.warn(
              `⚠️ Archivo demasiado grande (${(processedFile.size / 1024 / 1024).toFixed(2)}MB), enviando solo metadatos`,
            )

            try {
              const metadataResponse = await sendFileMetadataOnly(processedFile, entries, fieldsStructure)
              console.log("✅ Metadatos enviados exitosamente:", metadataResponse)
              setApiResponse({
                ...metadataResponse,
                warning: "Archivo demasiado grande",
                message: `El archivo es demasiado grande (${(processedFile.size / 1024 / 1024).toFixed(2)}MB). Se enviaron solo los metadatos.`,
              })

              setUploadProgress(90)
            } catch (metadataError) {
              console.error("❌ Error al enviar metadatos:", metadataError)
              setApiResponse({
                error: "Error al enviar metadatos",
                message: metadataError instanceof Error ? metadataError.message : "Error desconocido",
              })
            }
          } else {
            // El archivo tiene un tamaño aceptable, proceder con el envío completo
            console.log("📤 Archivo de tamaño aceptable, enviando contenido completo")

            // Convertir archivo a base64
            console.log("🔄 Convirtiendo archivo a base64...")
            const fileBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                try {
                  const result = reader.result as string
                  const base64Data = result.split(",")[1] // Quitar el prefijo data:...;base64,
                  console.log("✅ Archivo convertido a base64, tamaño:", base64Data.length)
                  resolve(base64Data)
                } catch (error) {
                  console.error("❌ Error al procesar base64:", error)
                  reject(error)
                }
              }
              reader.onerror = () => {
                console.error("❌ Error al leer archivo")
                reject(new Error("Error al leer archivo"))
              }
              reader.readAsDataURL(processedFile)
            })

            setUploadProgress(50)

            const requestBody = {
              file: {
                name: processedFile.name,
                type: processedFile.type,
                size: processedFile.size,
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
                formats: field.formats || [],
                variants: field.variants || [],
                required: field.required,
                order: field.order,
              })),
              metadata: {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                documentCount: entries.length,
                fieldCount: fieldsStructure.length,
                mode: "full_content",
              },
            }

            console.log("📤 Enviando POST con body:", {
              file: { name: processedFile.name, type: processedFile.type, size: processedFile.size },
              entries: entries.length + " entradas",
              fieldsStructure: fieldsStructure.length + " campos",
              bodySize: JSON.stringify(requestBody).length + " bytes",
              endpoint: settings.api_endpoint,
            })

            setUploadProgress(60)

            // Usar el proxy interno en lugar del endpoint directo
            const proxyUrl = "/api/upload-proxy"

            console.log("🔄 Usando proxy interno para evitar CORS")
            console.log("🎯 Target endpoint:", settings.api_endpoint)

            const response = await fetch(proxyUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-target-endpoint": settings.api_endpoint, // Pasar el endpoint real como header
              },
              body: JSON.stringify(requestBody),
            })

            console.log("📡 Status de respuesta del proxy:", response.status)
            console.log("📡 Headers de respuesta:", Object.fromEntries(response.headers.entries()))

            setUploadProgress(80)

            if (response.ok) {
              const responseText = await response.text()
              console.log("✅ Respuesta exitosa del proxy:", responseText)

              try {
                const responseData = JSON.parse(responseText)
                console.log("📋 Datos parseados:", responseData)
                setApiResponse(responseData)
              } catch (parseError) {
                console.log("⚠️ No se pudo parsear JSON, usando texto plano")
                setApiResponse({ message: responseText })
              }
            } else {
              console.warn("⚠️ Error en respuesta del proxy:", response.status)
              const errorText = await response.text()
              console.warn("⚠️ Error text:", errorText)

              // Manejar errores específicos
              let errorMessage = errorText || "Error desconocido"
              if (response.status === 413) {
                errorMessage =
                  "El archivo es demasiado grande para el servidor. Intenta con un archivo más pequeño o comprimido."

                // Intentar enviar solo metadatos como fallback
                console.log("🔄 Intentando enviar solo metadatos como fallback...")
                try {
                  const metadataResponse = await sendFileMetadataOnly(processedFile, entries, fieldsStructure)
                  console.log("✅ Metadatos enviados exitosamente como fallback:", metadataResponse)
                  setApiResponse({
                    ...metadataResponse,
                    warning: "Archivo demasiado grande",
                    message: `El archivo es demasiado grande. Se enviaron solo los metadatos como alternativa.`,
                    originalError: errorMessage,
                  })
                } catch (metadataError) {
                  console.error("❌ Error al enviar metadatos como fallback:", metadataError)
                  setApiResponse({
                    error: "Error al procesar el archivo",
                    message: errorMessage,
                    details: errorText,
                  })
                }
              } else if (response.status === 404) {
                errorMessage = "El endpoint no fue encontrado. Verifica la URL en configuración."
                setApiResponse({
                  error: `HTTP ${response.status}`,
                  message: errorMessage,
                  details: errorText,
                })
              } else if (response.status === 500) {
                errorMessage = "Error interno del servidor. Verifica que el webhook esté funcionando correctamente."
                setApiResponse({
                  error: `HTTP ${response.status}`,
                  message: errorMessage,
                  details: errorText,
                })
              } else {
                setApiResponse({
                  error: `HTTP ${response.status}`,
                  message: errorMessage,
                  details: errorText,
                })
              }
            }
          }
        } catch (error) {
          console.error("❌ Error en POST:", error)
          setApiResponse({
            error: "Error de conexión",
            message: error instanceof Error ? error.message : "Error desconocido",
            details: error,
          })
        } finally {
          setIsWaitingApiResponse(false)
        }
      }

      // Continuar con el procesamiento del archivo
      setUploadProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 500))

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
