"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Download, FileText, Plus, Upload, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useFileUpload } from "@/hooks/use-file-upload"
import FileUploadProgress from "@/components/file-upload-progress"
import FilePreviewModal from "@/components/file-preview-modal"
import type { Document, DocumentRow, FileMetadata } from "@/lib/types"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getDocument,
    deleteDocument,
    addRowToDocument,
    updateDocumentRow,
    deleteDocumentRow,
    templates,
    addTemplate,
  } = useApp()
  const { user } = useAuth()
  const { toast } = useToast()
  const { uploadFile, isUploading, uploadProgress } = useFileUpload()

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [extractedData, setExtractedData] = useState<Record<string, any>>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    if (doc) {
      setDocument(doc)
      setRows(doc.rows || [])
    }
    setLoading(false)
  }, [params.id, getDocument])

  const handleDelete = () => {
    if (!document) return

    if (confirm(`¿Estás seguro de que quieres eliminar el documento "${document.name}"?`)) {
      deleteDocument(document.id)
      toast({
        title: "Documento eliminado",
        description: `El documento "${document.name}" ha sido eliminado exitosamente.`,
      })
      router.push("/documents")
    }
  }

  const exportDocument = (format: "csv" | "pdf" | "excel") => {
    toast({
      title: "Exportación iniciada",
      description: `Preparando descarga en formato ${format.toUpperCase()}...`,
    })
  }

  // Funciones para manejo de filas
  const addRow = () => {
    if (!document) return

    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: document.id,
      data: {},
      created_at: new Date().toISOString(),
    }
    setRows([...rows, newRow])
  }

  const updateRowData = (rowId: string, fieldName: string, value: any) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)))
  }

  const removeRow = async (rowId: string) => {
    if (!document) return

    if (confirm("¿Estás seguro de que quieres eliminar esta fila?")) {
      await deleteDocumentRow(document.id, rowId)
      setRows(rows.filter((row) => row.id !== rowId))
      toast({
        title: "Fila eliminada",
        description: "La fila ha sido eliminada exitosamente.",
      })
    }
  }

  const saveRow = async (row: DocumentRow) => {
    if (!document) return

    try {
      if (row.id.startsWith("local-") || !rows.find((r) => r.id === row.id)) {
        // Nueva fila
        await addRowToDocument(document.id, row)
      } else {
        // Actualizar fila existente
        await updateDocumentRow(document.id, row.id, row.data)
      }

      toast({
        title: "Datos guardados",
        description: "Los datos han sido guardados exitosamente.",
      })
    } catch (error) {
      console.error("Error saving row:", error)
      toast({
        title: "Error",
        description: "Error al guardar los datos.",
        variant: "destructive",
      })
    }
  }

  // Guardar como plantilla
  const saveAsTemplate = () => {
    if (!document) return

    const templateName = prompt("Nombre de la plantilla:")
    if (templateName && templateName.trim()) {
      addTemplate({
        name: templateName.trim(),
        description: document.description || "Plantilla creada desde documento",
        user_id: user?.id || "demo-user",
        fields: document.fields,
      })
      toast({
        title: "Plantilla guardada",
        description: `La plantilla "${templateName}" ha sido creada exitosamente.`,
      })
    }
  }

  // Simulación de extracción de datos
  const simulateDataExtraction = useCallback(
    (filename: string, fileType: string): Record<string, any> => {
      if (!document) return {}

      const extractedData: Record<string, any> = {}

      document.fields.forEach((field) => {
        const fieldName = field.field_name.toLowerCase()

        if (fieldName.includes("title") || fieldName.includes("titulo")) {
          extractedData[field.field_name] = `Documento extraído de ${filename}`
        } else if (fieldName.includes("date") || fieldName.includes("fecha")) {
          extractedData[field.field_name] = new Date().toISOString().split("T")[0]
        } else if (fieldName.includes("amount") || fieldName.includes("monto") || fieldName.includes("total")) {
          extractedData[field.field_name] = (Math.random() * 1000 + 100).toFixed(2)
        } else if (fieldName.includes("number") || fieldName.includes("numero")) {
          extractedData[field.field_name] = `DOC-${Math.floor(Math.random() * 10000)}`
        } else if (fieldName.includes("name") || fieldName.includes("nombre")) {
          extractedData[field.field_name] = "Empresa Ejemplo S.A."
        } else if (fieldName.includes("email") || fieldName.includes("correo")) {
          extractedData[field.field_name] = "contacto@empresa.com"
        } else if (field.type === "text") {
          extractedData[field.field_name] = `Valor extraído para ${field.field_name}`
        } else if (field.type === "number") {
          extractedData[field.field_name] = Math.floor(Math.random() * 1000)
        } else if (field.type === "date") {
          extractedData[field.field_name] = new Date().toISOString().split("T")[0]
        }
      })

      return extractedData
    },
    [document],
  )

  // Manejo de archivos
  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file || !document) return

    try {
      setCurrentFile(file)
      const metadata = await uploadFile(file)
      setFileMetadata(metadata)

      // Simular extracción de datos
      const extracted = simulateDataExtraction(file.name, file.type)
      setExtractedData(extracted)

      // Mostrar modal de preview
      setShowPreviewModal(true)

      toast({
        title: "Archivo procesado",
        description: `Se han extraído ${Object.keys(extracted).length} campos del archivo.`,
      })
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Error al procesar el archivo.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmExtractedData = (data: Record<string, any>) => {
    if (!fileMetadata || !document) return

    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: document.id,
      data,
      file_metadata: fileMetadata,
      created_at: new Date().toISOString(),
    }

    setRows([...rows, newRow])
    setShowPreviewModal(false)
    setCurrentFile(null)
    setFileMetadata(null)
    setExtractedData({})

    toast({
      title: "Datos agregados",
      description: "Los datos extraídos han sido agregados al documento.",
    })
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Documento no encontrado</h3>
              <p className="text-gray-600 mb-6">El documento que buscas no existe o ha sido eliminado.</p>
              <Link href="/documents">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Documentos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/documents">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
              {document.description && <p className="text-gray-600 mt-1">{document.description}</p>}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={saveAsTemplate} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Guardar como Plantilla
            </Button>
            <Link href={`/documents/${document.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button variant="outline" onClick={() => exportDocument("csv")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Plantillas disponibles */}
        {templates.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Usar Plantilla</CardTitle>
              <CardDescription>Carga campos desde una plantilla existente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => {
                      // Aquí podrías implementar la lógica para aplicar la plantilla
                      toast({
                        title: "Plantilla aplicada",
                        description: `Se han aplicado los campos de la plantilla "${template.name}".`,
                      })
                    }}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.fields.length} campos</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estructura de campos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Estructura de Campos</CardTitle>
            <CardDescription>Campos definidos para este documento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {document.fields.map((field) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{field.field_name}</h4>
                    <Badge variant="secondary">{field.type}</Badge>
                  </div>
                  {field.description && <p className="text-sm text-gray-600 mb-2">{field.description}</p>}
                  {field.formats && field.formats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {field.formats.map((format, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {field.required && (
                    <Badge variant="destructive" className="text-xs mt-2">
                      Obligatorio
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de datos */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Datos del Documento</CardTitle>
              <CardDescription>Información extraída y entradas manuales</CardDescription>
            </div>
            <Button onClick={addRow} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Fila
            </Button>
          </CardHeader>
          <CardContent>
            {document.fields.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      {document.fields.map((field) => (
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
                        {document.fields.map((field) => (
                          <td key={field.id} className="border border-gray-200 p-2">
                            <Input
                              value={row.data[field.field_name] || ""}
                              onChange={(e) => updateRowData(row.id, field.field_name, e.target.value)}
                              placeholder={`Ingresa ${field.field_name}...`}
                              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                              onBlur={() => saveRow(row)}
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
                          colSpan={document.fields.length + 2}
                          className="border border-gray-200 p-8 text-center text-gray-500"
                        >
                          No hay entradas de datos aún. Agrega una fila para comenzar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zona de carga de archivos */}
        <Card>
          <CardHeader>
            <CardTitle>Carga de Archivos</CardTitle>
            <CardDescription>Arrastra archivos aquí o haz clic para seleccionar</CardDescription>
          </CardHeader>
          <CardContent>
            {isUploading ? (
              <FileUploadProgress filename={currentFile?.name || ""} progress={uploadProgress} />
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileUpload(e.dataTransfer.files)
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Arrastra archivos aquí</p>
                <p className="text-gray-500 mb-4">o haz clic para seleccionar archivos</p>
                <p className="text-sm text-gray-400">Soporta: PDF, JPG, PNG, DOC, DOCX</p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de preview */}
        <FilePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleConfirmExtractedData}
          fields={document.fields}
          fileMetadata={fileMetadata}
          extractedData={extractedData}
        />
      </div>
    </div>
  )
}
