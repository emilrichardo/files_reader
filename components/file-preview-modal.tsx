"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit2, Save, X } from "lucide-react"
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
  const { apiResponse: hookApiResponse, isWaitingApiResponse: hookIsWaiting } = useFileUpload()
  const [editableData, setEditableData] = useState<Record<string, any>>({})
  const [isEditing, setIsEditing] = useState(false)

  // Actualizar datos editables cuando cambian los datos extraídos
  useEffect(() => {
    console.log("🔄 Modal recibió extractedData:", extractedData)

    // Limpiar datos anteriores
    setEditableData({})

    // Establecer nuevos datos
    if (extractedData && Object.keys(extractedData).length > 0) {
      setEditableData({ ...extractedData })
      console.log("📝 Datos establecidos en el modal:", extractedData)
    } else {
      console.log("⚠️ No hay datos extraídos para mostrar")
    }
  }, [extractedData, isOpen]) // Importante: añadir isOpen como dependencia

  const handleInputChange = (fieldName: string, value: any) => {
    setEditableData({
      ...editableData,
      [fieldName]: value,
    })
  }

  const handleConfirm = () => {
    console.log("💾 Guardando datos:", editableData)
    if (onConfirm) {
      onConfirm(editableData)
    }
    onClose()
  }

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
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
                </Dialog.Title>

                <div className="mt-4">
                  {fileUrl && (
                    <iframe src={fileUrl} title="File Preview" width="100%" height="200px" className="border rounded" />
                  )}

                  {/* Información del archivo */}
                  {fileMetadata && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg border text-sm">
                      <p>
                        <strong>Nombre:</strong> {fileMetadata.name || fileMetadata.filename}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {fileMetadata.type || fileMetadata.file_type}
                      </p>
                      <p>
                        <strong>Tamaño:</strong>{" "}
                        {((fileMetadata.size || fileMetadata.file_size || 0) / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}

                  {/* Datos extraídos editables */}
                  {Object.keys(editableData).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Datos extraídos</h4>
                      <div className="space-y-3">
                        {fields.map((field) => {
                          const fieldValue =
                            editableData[field.field_name] !== undefined ? editableData[field.field_name] : ""

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

                        {/* Campos extraídos que no están en la estructura */}
                        {Object.entries(editableData).map(([key, value]) => {
                          // Solo mostrar campos que no están en la estructura definida
                          if (!fields.some((f) => f.field_name === key)) {
                            return (
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
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Respuesta de la API */}
                  {(apiResponse || hookApiResponse || isWaitingApiResponse || hookIsWaiting) && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Respuesta de la API</h4>
                      {isWaitingApiResponse || hookIsWaiting ? (
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-sm text-gray-600">Esperando respuesta...</span>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg border p-3">
                          <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-32">
                            {JSON.stringify(apiResponse || hookApiResponse, null, 2)}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default FilePreviewModal
