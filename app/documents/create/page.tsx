"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, Trash2, Upload, FileText, Edit, Check, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useFileUpload } from "@/hooks/use-file-upload"
import FileUploadProgress from "@/components/file-upload-progress"
import FilePreviewModal from "@/components/file-preview-modal"
import { Textarea } from "@/components/ui/textarea"
import type { DocumentField, DocumentRow, FileMetadata } from "@/lib/types"

export default function CreateDocumentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addDocument, templates, addTemplate } = useApp()
  const { user, signInWithGoogle } = useAuth()
  const { uploadFile, isUploading, uploadProgress, apiResponse, isWaitingApiResponse } = useFileUpload()

  // Estados principales
  const [documentTitle, setDocumentTitle] = useState("Nuevo Documento")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(documentTitle)
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<DocumentField[]>([
    {
      id: "1",
      field_name: "document_title",
      type: "text",
      description: "Título del documento",
      formats: [],
      variants: [],
      required: true,
      order: 0,
    },
  ])
  const [rows, setRows] = useState<DocumentRow[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [extractedData, setExtractedData] = useState<Record<string, any>>({})
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Funciones para el título
  const handleTitleSave = () => {
    setDocumentTitle(tempTitle)
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTempTitle(documentTitle)
    setIsEditingTitle(false)
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

  // Funciones para filas
  const addRow = () => {
    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: "temp",
      data: {},
      created_at: new Date().toISOString(),
    }
    setRows([...rows, newRow])
  }

  const updateRowData = (rowId: string, fieldName: string, value: any) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)))
  }

  const removeRow = (rowId: string) => {
    setRows(rows.filter((row) => row.id !== rowId))
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
        description: description || "Plantilla creada desde documento",
        user_id: user?.id || "demo-user",
        fields: fields,
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
      const extractedData: Record<string, any> = {}

      fields.forEach((field) => {
        const fieldName = field.field_name.toLowerCase()

        // Lógica de extracción basada en el nombre del campo y tipo de archivo
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

  // Manejo de archivos
  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validar que hay campos definidos
    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Debes definir al menos un campo antes de subir archivos.",
        variant: "destructive",
      })
      return
    }

    // Validar que el documento tiene nombre
    if (!documentTitle.trim() || documentTitle === "Nuevo Documento") {
      toast({
        title: "Error",
        description: "Debes darle un nombre al documento antes de subir archivos.",
        variant: "destructive",
      })
      return
    }

    try {
      setCurrentFile(file)
      const metadata = await uploadFile(file, rows, fields)
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

  const handleConfirmExtractedData = (data: Record<string, any>) => {
    if (!fileMetadata) return

    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: "temp",
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

  // Guardar documento
  const saveDocument = async () => {
    if (isSaving || isSaved) return

    // Verificar si el usuario está autenticado
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    // Validaciones
    if (!documentTitle.trim() || documentTitle === "Nuevo Documento") {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre válido para el documento.",
        variant: "destructive",
      })
      return
    }

    const invalidFields = fields.filter((field) => !field.field_name.trim())
    if (invalidFields.length > 0) {
      toast({
        title: "Error",
        description: "Todos los campos deben tener un nombre.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Asegurarse de que todos los campos tengan IDs válidos
      const processedFields = fields.map((field, index) => ({
        ...field,
        id: field.id || Date.now().toString() + index,
        order: index,
      }))

      // Crear el documento completo con las filas
      const documentData = {
        name: documentTitle,
        description,
        user_id: user.id,
        fields: processedFields,
        rows: rows, // Incluir las filas directamente
      }

      console.log("Creating document with complete data:", documentData)

      const documentId = await addDocument(documentData)

      console.log("Document created successfully with ID:", documentId)

      toast({
        title: "Documento creado",
        description: "El documento ha sido creado exitosamente.",
      })

      setIsSaved(true)

      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push(`/documents/${documentId}`)
      }, 1000)
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error",
        description: "Error al guardar el documento.",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
      setShowLoginPrompt(false)
      // Después del login, intentar guardar automáticamente
      setTimeout(() => {
        saveDocument()
      }, 1000)
    } catch (error) {
      console.error("Error logging in:", error)
      toast({
        title: "Error",
        description: "Error al iniciar sesión.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con título editable */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            {isEditingTitle ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-2xl font-bold h-auto py-1 px-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave()
                    if (e.key === "Escape") handleTitleCancel()
                  }}
                  autoFocus
                />
                <Button size="icon" variant="outline" onClick={handleTitleSave}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={handleTitleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-gray-900">{documentTitle}</h1>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-600">Define la estructura y carga archivos para extraer datos automáticamente</p>
        </div>

        <div className="grid gap-8">
          {/* Plantillas */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Usar Plantilla</CardTitle>
                <CardDescription>Carga una estructura predefinida de campos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => {
                        setFields(template.fields)
                        toast({
                          title: "Plantilla cargada",
                          description: `Se han cargado ${template.fields.length} campos de la plantilla.`,
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

          {/* Definición de campos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estructura de Campos</CardTitle>
                <CardDescription>Define los campos que contendrá tu documento</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveAsTemplate} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar como Plantilla
                </Button>
                <Button onClick={addField} className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Nombre</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Tipo</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Descripción</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Variantes</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Formatos</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Requerido</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">Acciones</th>
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
                          <Textarea
                            value={field.description || ""}
                            onChange={(e) => updateField(field.id, { description: e.target.value })}
                            placeholder="Descripción..."
                            className="min-h-[60px]"
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            value={field.variants?.join(", ") || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              const variants = value
                                ? value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter((v) => v.length > 0)
                                : []
                              updateField(field.id, { variants })
                            }}
                            placeholder="variante1, variante2"
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            value={field.formats?.join(", ") || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              const formats = value
                                ? value
                                    .split(",")
                                    .map((f) => f.trim())
                                    .filter((f) => f.length > 0)
                                : []
                              updateField(field.id, { formats })
                            }}
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
            </CardContent>
          </Card>

          {/* Entrada manual de datos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Datos del Documento</CardTitle>
                <CardDescription>Agrega datos manualmente o desde archivos procesados</CardDescription>
              </div>
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Fila
              </Button>
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
                        <th className="border border-gray-200 p-3 text-left font-medium text-gray-900 w-20">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
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
                            No hay datos aún. Agrega una fila manualmente o sube un archivo.
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
                <>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDrop={(e) => {
                      e.preventDefault()
                      handleFileUpload(e.dataTransfer.files)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => {
                      const input = document.getElementById("file-upload") as HTMLInputElement
                      if (input) input.click()
                    }}
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

                  {/* Botón para mobile */}
                  <Button
                    onClick={() => {
                      const input = document.getElementById("file-upload") as HTMLInputElement
                      if (input) input.click()
                    }}
                    className="w-full mt-4 md:hidden"
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push("/documents")}>
              Cancelar
            </Button>
            <Button
              onClick={saveDocument}
              disabled={isSaving || isSaved}
              className="bg-black hover:bg-gray-800 text-white min-w-[150px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : isSaved ? "Guardado" : "Guardar Documento"}
            </Button>
          </div>
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

        {/* Modal de login prompt */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión Requerido
                </CardTitle>
                <CardDescription>
                  Necesitas iniciar sesión para guardar el documento. Tus datos se mantendrán seguros.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Iniciar Sesión con Google
                </Button>
                <Button variant="outline" onClick={() => setShowLoginPrompt(false)} className="w-full">
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
