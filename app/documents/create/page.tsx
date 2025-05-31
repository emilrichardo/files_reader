"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload, Save, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useFileUpload } from "@/hooks/use-file-upload"
import FileUploadProgress from "@/components/file-upload-progress"
import FilePreviewModal from "@/components/file-preview-modal"
import type { DocumentField, DocumentRow, FileMetadata } from "@/lib/types"

export default function CreateDocumentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addDocument, addRowToDocument } = useApp()
  const { user } = useAuth()
  const { uploadFile, isUploading, uploadProgress } = useFileUpload()

  const [documentName, setDocumentName] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [fields, setFields] = useState<DocumentField[]>([
    {
      id: "1",
      field_name: "document_title",
      type: "text",
      description: "Título del documento",
      formats: [],
      required: true,
      order: 0,
    },
  ])
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    fileMetadata?: FileMetadata
    extractedData?: Record<string, any>
  }>({
    isOpen: false,
  })

  const addField = () => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      field_name: "",
      type: "text",
      description: "",
      formats: [],
      required: false,
      order: fields.length,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<DocumentField>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const addRow = () => {
    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: currentDocumentId || "temp",
      data: {},
      created_at: new Date().toISOString(),
    }
    setRows([...rows, newRow])
  }

  const updateRowData = (rowId: string, fieldName: string, value: any) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)))
  }

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id))
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [fields],
  )

  const handleFiles = async (files: FileList) => {
    if (!documentName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre para el documento antes de subir archivos.",
        variant: "destructive",
      })
      return
    }

    // Crear documento si no existe
    if (!currentDocumentId) {
      const docId = addDocument({
        name: documentName,
        description: documentDescription,
        user_id: user?.id || "demo-user",
        fields,
        rows: [],
      })
      setCurrentDocumentId(docId)
    }

    for (const file of Array.from(files)) {
      try {
        setUploadingFile(file.name)
        const fileMetadata = await uploadFile(file)

        // Simular extracción de datos basada en los campos definidos
        const extractedData = simulateDataExtraction(file, fields)

        // Asegurarse de que fileMetadata existe antes de abrir el modal
        if (fileMetadata) {
          setPreviewModal({
            isOpen: true,
            fileMetadata,
            extractedData,
          })
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Error",
          description: `Error al procesar el archivo ${file.name}`,
          variant: "destructive",
        })
      } finally {
        setUploadingFile(null)
      }
    }
  }

  const simulateDataExtraction = (file: File, fields: DocumentField[]): Record<string, any> => {
    const extractedData: Record<string, any> = {}

    // Simular extracción de datos basada en el nombre del archivo y campos
    fields.forEach((field) => {
      switch (field.field_name.toLowerCase()) {
        case "document_title":
        case "titulo":
        case "title":
          extractedData[field.field_name] = file.name.replace(/\.[^/.]+$/, "")
          break
        case "fecha":
        case "date":
          extractedData[field.field_name] = new Date().toISOString().split("T")[0]
          break
        case "numero_factura":
        case "invoice_number":
          extractedData[field.field_name] = `FAC-${Math.floor(Math.random() * 10000)}`
          break
        case "monto":
        case "amount":
        case "total":
          extractedData[field.field_name] = (Math.random() * 1000 + 100).toFixed(2)
          break
        case "cliente":
        case "customer":
        case "client":
          const clientes = ["Empresa ABC S.A.", "Corporación XYZ", "TechCorp Solutions", "Innovate Ltd."]
          extractedData[field.field_name] = clientes[Math.floor(Math.random() * clientes.length)]
          break
        default:
          if (field.type === "number") {
            extractedData[field.field_name] = Math.floor(Math.random() * 100)
          } else if (field.type === "date") {
            extractedData[field.field_name] = new Date().toISOString().split("T")[0]
          } else {
            extractedData[field.field_name] = `Valor extraído para ${field.field_name}`
          }
      }
    })

    return extractedData
  }

  const handlePreviewConfirm = (data: Record<string, any>) => {
    if (currentDocumentId && previewModal.fileMetadata) {
      addRowToDocument(currentDocumentId, {
        document_id: currentDocumentId,
        data,
        file_metadata: previewModal.fileMetadata,
      })

      // Agregar la fila a la vista local también
      const newRow: DocumentRow = {
        id: Date.now().toString(),
        document_id: currentDocumentId,
        data,
        file_metadata: previewModal.fileMetadata,
        created_at: new Date().toISOString(),
      }
      setRows((prev) => [newRow, ...prev])

      toast({
        title: "Archivo procesado",
        description: `Los datos de ${previewModal.fileMetadata.filename} han sido agregados exitosamente.`,
      })
    }
  }

  const saveDocument = () => {
    if (!documentName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre para el documento.",
        variant: "destructive",
      })
      return
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, define al menos un campo.",
        variant: "destructive",
      })
      return
    }

    try {
      let docId = currentDocumentId

      if (!docId) {
        docId = addDocument({
          name: documentName,
          description: documentDescription,
          user_id: user?.id || "demo-user",
          fields,
          rows,
        })
      }

      toast({
        title: "Documento guardado",
        description: "El documento ha sido guardado exitosamente.",
      })

      router.push(`/documents/${docId}`)
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error",
        description: "Error al guardar el documento.",
        variant: "destructive",
      })
    }
  }

  const exportDocument = (format: "csv" | "pdf" | "excel") => {
    console.log(`Exportando documento como ${format}`)
    toast({
      title: "Exportación iniciada",
      description: `Preparando descarga en formato ${format.toUpperCase()}...`,
    })
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Documento</h1>
          <p className="text-gray-600">Define tu estructura de datos y comienza a extraer información de documentos.</p>
        </div>

        {/* Document Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información del Documento</CardTitle>
            <CardDescription>Información básica sobre tu proyecto de documento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Proyecto</Label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Ingresa el nombre del proyecto..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Describe tu proyecto..."
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fields Configuration */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campos de Datos</CardTitle>
              <CardDescription>Define la estructura de tu extracción de datos</CardDescription>
            </div>
            <Button onClick={addField} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Campo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Nombre del Campo *</Label>
                      <Input
                        value={field.field_name}
                        onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                        placeholder="nombre_campo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select value={field.type} onValueChange={(value: any) => updateField(field.id, { type: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="date">Fecha</SelectItem>
                          <SelectItem value="boolean">Booleano</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Formatos</Label>
                      <Input
                        value={field.formats?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            formats: e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="formato1, formato2"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeField(field.id)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Descripción</Label>
                    <Input
                      value={field.description || ""}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      placeholder="Descripción del campo..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Entradas de Datos</CardTitle>
              <CardDescription>Entradas manuales e información extraída</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Fila
              </Button>
              <Select onValueChange={exportDocument}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      {fields.map((field) => (
                        <th key={field.id} className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                          {field.field_name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </th>
                      ))}
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">Archivo</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {fields.map((field) => (
                          <td key={field.id} className="border border-gray-200 p-2">
                            <Input
                              value={row.data[field.field_name] || ""}
                              onChange={(e) => updateRowData(row.id, field.field_name, e.target.value)}
                              placeholder={`Ingresa ${field.field_name}...`}
                              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 p-2">
                          {row.file_metadata && (
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-600 truncate max-w-20">
                                {row.file_metadata.filename}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Button variant="outline" size="icon" onClick={() => removeRow(row.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={fields.length + 2}
                          className="border border-gray-200 p-8 text-center text-gray-500"
                        >
                          No hay entradas de datos aún. Agrega una fila o sube archivos para comenzar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subir Documentos</CardTitle>
            <CardDescription>
              Sube archivos para extraer datos automáticamente basándose en tus campos definidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress indicator */}
            {uploadingFile && (
              <div className="mb-4">
                <FileUploadProgress filename={uploadingFile} progress={uploadProgress} />
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-black bg-black/5" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Arrastra archivos aquí o haz clic para subir</h3>
              <p className="text-gray-600 mb-4">Soporta archivos PDF, JPG, PNG, DOC, DOCX</p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button className="bg-black hover:bg-gray-800 text-white" disabled={isUploading}>
                  {isUploading ? "Procesando..." : "Elegir Archivos"}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Guardar como Plantilla</Button>
          <Button onClick={saveDocument} className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar Documento
          </Button>
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false })}
          onConfirm={handlePreviewConfirm}
          fields={fields}
          fileMetadata={previewModal.fileMetadata}
          extractedData={previewModal.extractedData}
        />
      </div>
    </div>
  )
}
