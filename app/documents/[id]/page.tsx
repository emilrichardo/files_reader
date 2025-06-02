"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Trash2,
  Download,
  FileText,
  Plus,
  Upload,
  Save,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useDynamicStyles } from "@/hooks/use-dynamic-styles"
import { useTheme } from "@/contexts/theme-context"
import FileUploadProgress from "@/components/file-upload-progress"
import FilePreviewModal from "@/components/file-preview-modal"
import type { Document, DocumentRow, DocumentField, FileMetadata } from "@/lib/types"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getDocument,
    deleteDocument,
    addRowToDocument,
    updateDocument,
    deleteDocumentRow,
    templates,
    addTemplate,
    documents,
  } = useApp()
  const { user } = useAuth()
  const { toast } = useToast()
  const { uploadFile, isUploading, uploadProgress, apiResponse, isWaitingApiResponse } = useFileUpload()
  const { getPrimaryButtonStyles } = useDynamicStyles()
  const { settings } = useTheme()

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  // Estados para edición del nombre
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  // Estados para campos
  const [fields, setFields] = useState<DocumentField[]>([])
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [isFieldsCollapsed, setIsFieldsCollapsed] = useState(true)

  // Estados para filas
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [pendingRows, setPendingRows] = useState<DocumentRow[]>([])

  // Estados para archivos
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [extractedData, setExtractedData] = useState<Record<string, any>>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Ref para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    if (doc) {
      setDocument(doc)
      setTempName(doc.name)
      setFields(doc.fields || [])
      setRows(doc.rows || [])
    }
    setLoading(false)
  }, [params.id, getDocument])

  // Agregar después del primer useEffect:
  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    if (doc) {
      setDocument(doc)
      setTempName(doc.name)
      setFields(doc.fields || [])
      setRows(doc.rows || [])
      // Limpiar filas pendientes al recargar
      setPendingRows([])
    }
    setLoading(false)
  }, [params.id, getDocument, documents]) // Agregar 'documents' como dependencia

  // Guardar nombre del documento cuando se quita el mouse
  const saveNameOnBlur = async () => {
    if (!document || !tempName.trim() || tempName.trim() === document.name) return

    try {
      await updateDocument(document.id, { name: tempName.trim() })
      setDocument({ ...document, name: tempName.trim() })
      setIsEditingName(false)
      toast({
        title: "Nombre actualizado",
        description: "El nombre del documento ha sido actualizado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el nombre.",
        variant: "destructive",
      })
    }
  }

  // Guardar nombre del documento
  const saveName = async () => {
    if (!document || !tempName.trim()) return

    try {
      await updateDocument(document.id, { name: tempName.trim() })
      setDocument({ ...document, name: tempName.trim() })
      setIsEditingName(false)
      toast({
        title: "Nombre actualizado",
        description: "El nombre del documento ha sido actualizado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el nombre.",
        variant: "destructive",
      })
    }
  }

  // Funciones para campos
  const addField = () => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      field_name: "",
      type: "text",
      description: "",
      formats: [],
      variants: [],
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

  const saveFields = async () => {
    if (!document) return

    try {
      await updateDocument(document.id, { fields })
      setDocument({ ...document, fields })
      setIsEditingFields(false)
      toast({
        title: "Campos actualizados",
        description: "La estructura de campos ha sido actualizada.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar los campos.",
        variant: "destructive",
      })
    }
  }

  // Cargar plantilla
  const loadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFields(template.fields)
      toast({
        title: "Plantilla cargada",
        description: `Se han cargado ${template.fields.length} campos de la plantilla.`,
      })
    }
  }

  // Guardar como plantilla
  const saveAsTemplate = () => {
    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Debes definir al menos un campo para crear una plantilla.",
        variant: "destructive",
      })
      return
    }

    const templateName = prompt("Nombre de la plantilla:")
    if (templateName && templateName.trim()) {
      addTemplate({
        name: templateName.trim(),
        description: document?.description || "Plantilla creada desde documento",
        user_id: user?.id || "demo-user",
        fields: fields,
      })
      toast({
        title: "Plantilla guardada",
        description: `La plantilla "${templateName}" ha sido creada exitosamente.`,
      })
    }
  }

  // Funciones para filas
  const addRow = () => {
    if (!document) return

    const newRow: DocumentRow = {
      id: `temp-${Date.now()}`,
      document_id: document.id,
      data: {},
      created_at: new Date().toISOString(),
    }
    setPendingRows([...pendingRows, newRow])
  }

  const updateRowData = (rowId: string, fieldName: string, value: any) => {
    // Actualizar en filas guardadas
    setRows(rows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)))

    // Actualizar en filas pendientes
    setPendingRows(
      pendingRows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)),
    )
  }

  // Y modificar la función saveRow para refrescar el documento después de guardar:
  const saveRow = async (row: DocumentRow) => {
    if (!document) return

    try {
      await addRowToDocument(document.id, row)

      // Refrescar el documento desde el contexto
      const updatedDoc = getDocument(document.id)
      if (updatedDoc) {
        setDocument(updatedDoc)
        setRows(updatedDoc.rows || [])
      }

      // Mover de pendientes a guardadas
      setPendingRows(pendingRows.filter((r) => r.id !== row.id))

      toast({
        title: "Fila guardada",
        description: "Los datos han sido guardados exitosamente.",
      })
    } catch (error) {
      console.error("Error saving row:", error)
      toast({
        title: "Error",
        description: "Error al guardar la fila.",
        variant: "destructive",
      })
    }
  }

  const removeRow = async (rowId: string) => {
    if (!document) return

    if (confirm("¿Estás seguro de que quieres eliminar esta fila?")) {
      // Si es una fila pendiente, solo remover del estado
      if (rowId.startsWith("temp-")) {
        setPendingRows(pendingRows.filter((row) => row.id !== rowId))
      } else {
        // Si es una fila guardada, eliminar de la base de datos
        await deleteDocumentRow(document.id, rowId)
        setRows(rows.filter((row) => row.id !== rowId))
      }

      toast({
        title: "Fila eliminada",
        description: "La fila ha sido eliminada exitosamente.",
      })
    }
  }

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

  // Simulación de extracción de datos
  const simulateDataExtraction = useCallback(
    (filename: string, fileType: string): Record<string, any> => {
      const extractedData: Record<string, any> = {}

      fields.forEach((field) => {
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
    [fields],
  )

  // Función mejorada para manejar el click del input de archivo
  const triggerFileInput = () => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      } else {
        console.error("File input ref not available")
        toast({
          title: "Error",
          description: "No se pudo abrir el selector de archivos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error triggering file input:", error)
      toast({
        title: "Error",
        description: "Error al abrir el selector de archivos.",
        variant: "destructive",
      })
    }
  }

  // Manejo de archivos
  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file || !document) return

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Debes definir al menos un campo antes de subir archivos.",
        variant: "destructive",
      })
      return
    }

    // Verificar si hay endpoint configurado
    if (!settings?.api_endpoint) {
      toast({
        title: "Endpoint no configurado",
        description: "Ve a Configuración para establecer un endpoint de API.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Ir a Configuración
          </Button>
        ),
      })
      return
    }

    try {
      setCurrentFile(file)
      console.log("🔄 Iniciando upload desde documento existente...")
      console.log("📊 Rows:", rows.length)
      console.log("📊 Pending rows:", pendingRows.length)
      console.log("🏗️ Fields:", fields.length)

      const metadata = await uploadFile(file, [...rows, ...pendingRows], fields)
      setFileMetadata(metadata)

      // Usar respuesta real del API si está disponible
      const extracted = apiResponse || simulateDataExtraction(file.name, file.type)
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

  const handleConfirmExtractedData = async (data: Record<string, any>) => {
    if (!fileMetadata || !document) return

    const newRow: DocumentRow = {
      id: `file-${Date.now()}`,
      document_id: document.id,
      data,
      file_metadata: fileMetadata,
      created_at: new Date().toISOString(),
    }

    try {
      await addRowToDocument(document.id, newRow)

      // Refrescar el documento desde el contexto
      const updatedDoc = getDocument(document.id)
      if (updatedDoc) {
        setDocument(updatedDoc)
        setRows(updatedDoc.rows || [])
      }

      setShowPreviewModal(false)
      setCurrentFile(null)
      setFileMetadata(null)
      setExtractedData({})

      toast({
        title: "Datos agregados",
        description: "Los datos extraídos han sido agregados al documento.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al agregar los datos extraídos.",
        variant: "destructive",
      })
    }
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
                <Button style={getPrimaryButtonStyles()}>
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

  const allRows = [...rows, ...pendingRows]

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con nombre editable */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/documents">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-2xl font-bold h-auto py-1 px-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName()
                      if (e.key === "Escape") {
                        setTempName(document.name)
                        setIsEditingName(false)
                      }
                    }}
                    onBlur={saveNameOnBlur}
                    autoFocus
                  />
                  <Button size="icon" variant="outline" onClick={saveName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setTempName(document.name)
                      setIsEditingName(false)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">{document.name}</h1>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
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

        {/* Alerta si no hay endpoint configurado */}
        {!settings?.api_endpoint && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Endpoint de API no configurado</p>
                    <p className="text-sm text-orange-600">
                      Para procesar archivos automáticamente, configura un endpoint en Configuración.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/settings")}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8">
          {/* Estructura de campos - Colapsable */}
          <Card>
            <Collapsible open={!isFieldsCollapsed} onOpenChange={(open) => setIsFieldsCollapsed(!open)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    {isFieldsCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <div>
                      <CardTitle>Estructura de Campos</CardTitle>
                      <CardDescription>
                        {fields.length} campos definidos -{" "}
                        {isFieldsCollapsed ? "Click para expandir" : "Click para colapsar"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {templates.length > 0 && (
                      <Select onValueChange={loadTemplate}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Cargar plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.fields.length} campos)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button onClick={saveAsTemplate} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Plantilla
                    </Button>
                    {isEditingFields ? (
                      <div className="flex space-x-2">
                        <Button onClick={saveFields} style={getPrimaryButtonStyles()}>
                          <Check className="w-4 h-4 mr-2" />
                          Guardar Campos
                        </Button>
                        <Button
                          onClick={() => {
                            setFields(document.fields || [])
                            setIsEditingFields(false)
                          }}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setIsEditingFields(true)} variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Campos
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {isEditingFields ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Nombre</th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Tipo</th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                                Descripción
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                                Variantes
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                                Formatos
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                                Requerido
                              </th>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map((field) => (
                              <tr key={field.id}>
                                <td className="border border-gray-200 p-2">
                                  <Input
                                    value={field.field_name}
                                    onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                                    placeholder="nombre_campo"
                                  />
                                </td>
                                <td className="border border-gray-200 p-2">
                                  <Select
                                    value={field.type}
                                    onValueChange={(value: any) => updateField(field.id, { type: value })}
                                  >
                                    <SelectTrigger>
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
                                </td>
                                <td className="border border-gray-200 p-2">
                                  <Input
                                    value={field.description || ""}
                                    onChange={(e) => updateField(field.id, { description: e.target.value })}
                                    placeholder="Descripción..."
                                  />
                                </td>
                                <td className="border border-gray-200 p-2">
                                  <Input
                                    value={field.variants?.join(", ") || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        variants: e.target.value
                                          .split(",")
                                          .map((f) => f.trim())
                                          .filter(Boolean),
                                      })
                                    }
                                    placeholder="variante1, variante2"
                                  />
                                </td>
                                <td className="border border-gray-200 p-2">
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
                                  />
                                </td>
                                <td className="border border-gray-200 p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="rounded"
                                  />
                                </td>
                                <td className="border border-gray-200 p-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeField(field.id)}
                                    disabled={fields.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button onClick={addField} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Campo
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {fields.map((field) => (
                        <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{field.field_name}</h4>
                            <Badge variant="secondary">{field.type}</Badge>
                          </div>
                          {field.description && <p className="text-sm text-gray-600 mb-2">{field.description}</p>}
                          {field.variants && field.variants.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-500">Variantes:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.variants.map((variant, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {variant}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {field.formats && field.formats.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-500">Formatos:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.formats.map((format, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {format}
                                  </Badge>
                                ))}
                              </div>
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
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Tabla de datos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Datos del Documento</CardTitle>
                <CardDescription>
                  {rows.length} entradas guardadas
                  {pendingRows.length > 0 && `, ${pendingRows.length} pendientes de guardar`}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={addRow} style={getPrimaryButtonStyles()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Fila
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
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
                        <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">Estado</th>
                        <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-32">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRows.map((row) => {
                        const isPending = row.id.startsWith("temp-") || row.id.startsWith("file-")
                        return (
                          <tr key={row.id} className={isPending ? "bg-yellow-50" : "hover:bg-gray-50"}>
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
                              {isPending ? (
                                <Badge variant="outline" className="text-yellow-600">
                                  Pendiente
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600">
                                  Guardado
                                </Badge>
                              )}
                            </td>
                            <td className="border border-gray-200 p-2">
                              <div className="flex space-x-1">
                                {isPending && (
                                  <Button size="sm" onClick={() => saveRow(row)} style={getPrimaryButtonStyles()}>
                                    <Save className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => removeRow(row.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {allRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={fields.length + 2}
                            className="border border-gray-200 p-8 text-center text-gray-500"
                          >
                            No hay entradas de datos aún. Agrega una fila para comenzar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Primero define la estructura de campos para poder agregar datos.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de carga de archivos */}
          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Carga de Archivos</CardTitle>
                <CardDescription>Arrastra archivos aquí para extraer datos automáticamente</CardDescription>
              </CardHeader>
              <CardContent>
                {isUploading ? (
                  <FileUploadProgress filename={currentFile?.name || ""} progress={uploadProgress} />
                ) : (
                  <>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onDrop={(e) => {
                        e.preventDefault()
                        handleFileUpload(e.dataTransfer.files)
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={triggerFileInput}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Arrastra archivos aquí</p>
                      <p className="text-gray-500 mb-4">o haz clic para seleccionar archivos</p>
                      <p className="text-sm text-gray-400">Soporta: PDF, JPG, PNG, DOC, DOCX</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </div>

                    {/* Botón para mobile */}
                    <Button
                      onClick={triggerFileInput}
                      className="w-full mt-4 md:hidden"
                      style={getPrimaryButtonStyles()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivo
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de preview */}
        <FilePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleConfirmExtractedData}
          fields={fields}
          fileMetadata={fileMetadata}
          extractedData={extractedData}
          apiResponse={apiResponse}
          isWaitingApiResponse={isWaitingApiResponse}
        />
      </div>
    </div>
  )
}
