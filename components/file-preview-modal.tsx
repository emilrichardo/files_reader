"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit2, Save, X, AlertTriangle, Settings } from "lucide-react"
import type { DocumentField, FileMetadata } from "@/lib/types"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl?: string | null
  extractedData: any
  apiResponse?: any
  isWaitingApiResponse?: boolean
  fields?: DocumentField[]
  fileMetadata?: FileMetadata | null
  onConfirm?: (data: Record<string, any>) => void
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  extractedData,
  apiResponse,
  isWaitingApiResponse,
  fields = [],
  fileMetadata,
  onConfirm,
}) => {
  const [editableData, setEditableData] = useState<Record<string, any>>({})
  const [isEditing, setIsEditing] = useState(false)

  // Actualizar datos editables cuando cambian los datos extraídos o la respuesta de la API
  useEffect(() => {
    console.log("🔄 Modal - extractedData:", extractedData)
    console.log("🔄 Modal - apiResponse:", apiResponse)

    // Limpiar datos anteriores
    setEditableData({})

    // Priorizar apiResponse sobre extractedData
    let dataToUse = {}

    if (apiResponse && typeof apiResponse === "object" && !apiResponse.error) {
      console.log("✅ Usando datos de apiResponse")
      dataToUse = { ...apiResponse }
    } else if (extractedData && typeof extractedData === "object" && Object.keys(extractedData).length > 0) {
      console.log("⚠️ Usando datos de extractedData como fallback")
      dataToUse = { ...extractedData }
    }

    console.log("📝 Datos finales para el modal:", dataToUse)

    if (Object.keys(dataToUse).length > 0) {
      setEditableData(dataToUse)
    } else {
      console.log("⚠️ No hay datos para mostrar")
    }
  }, [extractedData, apiResponse, isOpen])

  const handleInputChange = (fieldName: string, value: any) => {
    setEditableData({
      ...editableData,
      [fieldName]: value,
    })
  }

  const handleConfirm = () => {
    console.log("💾 Guardando datos:", editableData)

    // Limpiar datos vacíos antes de guardar
    const cleanedData = Object.fromEntries(
      Object.entries(editableData).filter(([key, value]) => value && value.toString().trim() !== ""),
    )

    console.log("💾 Datos limpiados:", cleanedData)

    if (onConfirm) {
      onConfirm(cleanedData)
    }
    onClose()
  }

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const hasError = apiResponse?.error || apiResponse?.needsConfiguration

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Vista previa del archivo</span>
            <Button variant="outline" size="sm" onClick={toggleEditing} className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  <span>Editar</span>
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>Revisa y edita los datos extraídos del archivo antes de guardarlos.</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {fileUrl && (
            <iframe src={fileUrl} title="File Preview" width="100%" height="200px" className="border rounded" />
          )}

          {/* Información del archivo */}
          {fileMetadata && (
            <div className="mt-4 bg-gray-50 p-3 rounded-lg border text-sm">
              <p>
                <strong>Nombre:</strong> {fileMetadata.filename || fileMetadata.name || "Archivo sin nombre"}
              </p>
              <p>
                <strong>Tipo:</strong> {fileMetadata.file_type || fileMetadata.type || "Tipo desconocido"}
              </p>
              <p>
                <strong>Tamaño:</strong> {((fileMetadata.file_size || fileMetadata.size || 0) / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Mensaje de error si hay uno */}
          {hasError && (
            <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200 text-sm flex items-start">
              {apiResponse?.needsConfiguration ? (
                <Settings className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-red-700">
                  {apiResponse?.needsConfiguration ? "Configuración requerida" : "Error en el procesamiento"}
                </p>
                <p className="text-red-600">{apiResponse?.message || "Error al procesar el archivo"}</p>
                {apiResponse?.needsConfiguration && (
                  <p className="text-xs text-orange-600 mt-1">
                    Ve a Configuración → Avanzado para configurar el endpoint de la API.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Datos extraídos editables */}
          {Object.keys(editableData).length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Datos extraídos</h4>
              <div className="space-y-3">
                {/* Primero mostrar campos que coinciden con la estructura */}
                {fields.map((field) => {
                  const fieldValue = editableData[field.field_name] !== undefined ? editableData[field.field_name] : ""

                  return (
                    <div key={field.id} className="flex flex-col">
                      <label className="text-xs font-medium text-gray-700 mb-1">
                        {field.field_name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {isEditing ? (
                        <Input
                          value={fieldValue}
                          onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          className="text-sm"
                          placeholder={`Ingrese ${field.field_name}...`}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-md border p-2 text-sm">
                          {fieldValue || <span className="text-gray-400">No disponible</span>}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Luego mostrar campos adicionales que no están en la estructura */}
                {Object.entries(editableData)
                  .filter(([key, value]) => {
                    // Solo mostrar campos que no están en la estructura definida
                    return !fields.some((f) => f.field_name === key)
                  })
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-xs font-medium text-gray-700 mb-1">
                        {key} <span className="text-blue-500 text-xs">(campo adicional)</span>
                      </label>

                      {isEditing ? (
                        <Input
                          value={value || ""}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="text-sm"
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-md border p-2 text-sm">
                          {value || <span className="text-gray-400">No disponible</span>}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border text-center">
              <p className="text-gray-500">No se pudieron extraer datos del archivo.</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasError
                  ? "Configura el endpoint de la API para procesar archivos automáticamente."
                  : "Puedes agregar datos manualmente haciendo clic en 'Editar'."}
              </p>
            </div>
          )}

          {/* Respuesta de la API */}
          {(apiResponse || isWaitingApiResponse) && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Respuesta de la API</h4>
              {isWaitingApiResponse ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-sm text-gray-600">Esperando respuesta...</span>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg border p-3">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="button" onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar datos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FilePreviewModal
