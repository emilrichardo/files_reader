"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DocumentField, FileMetadata } from "@/lib/types"
import { FileText, Edit, Check } from "lucide-react"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: Record<string, any>) => void
  fields: DocumentField[]
  fileMetadata?: FileMetadata
  extractedData?: Record<string, any>
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  fields,
  fileMetadata,
  extractedData = {},
}: FilePreviewModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Solo actualizar formData cuando el modal se abre y hay nuevos datos extraídos
  useEffect(() => {
    if (isOpen && extractedData && Object.keys(extractedData).length > 0) {
      setFormData(extractedData)
    }
  }, [isOpen, extractedData])

  // Resetear formData cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData({})
    }
  }, [isOpen])

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleConfirm = () => {
    onConfirm(formData)
    onClose()
  }

  const handleClose = () => {
    setFormData({})
    onClose()
  }

  // Si no hay fileMetadata, no renderizar el contenido del modal
  if (!fileMetadata) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Vista Previa de Datos Extraídos
          </DialogTitle>
          <DialogDescription>
            Revisa y edita los datos extraídos del archivo: <strong>{fileMetadata?.filename}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del archivo */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información del Archivo</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span> {fileMetadata?.filename}
              </div>
              <div>
                <span className="text-gray-500">Tamaño:</span>{" "}
                {fileMetadata ? (fileMetadata.file_size / 1024).toFixed(1) + " KB" : ""}
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span> {fileMetadata?.file_type}
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>{" "}
                {fileMetadata ? new Date(fileMetadata.upload_date).toLocaleDateString("es-ES") : ""}
              </div>
            </div>
          </div>

          {/* Campos extraídos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Datos Extraídos
              <span className="text-xs text-gray-500 ml-2">(Edita los valores antes de confirmar)</span>
            </h4>
            {fields.map((field) => (
              <div key={field.id} className="group">
                <Label htmlFor={field.field_name} className="flex items-center">
                  {field.field_name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {field.description && (
                    <span className="ml-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ({field.description})
                    </span>
                  )}
                </Label>
                <Input
                  id={field.field_name}
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={formData[field.field_name] || ""}
                  onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                  placeholder={field.description || `Ingresa ${field.field_name}...`}
                  className="mt-1"
                  required={field.required}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-black hover:bg-gray-800 text-white">
            <Check className="w-4 h-4 mr-2" />
            Confirmar y Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
