"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload, Save, FileText, Layout, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useFileUpload } from "@/hooks/use-file-upload"
import FileUploadProgress from "@/components/file-upload-progress"
import FilePreviewModal from "@/components/file-preview-modal"
import type { DocumentField, DocumentRow, FileMetadata } from "@/lib/types"

// Clave para almacenar las configuraciones en localStorage
const DOCUMENT_DRAFT_KEY = "docmanager_document_draft"

export default function CreateDocumentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addDocument, addRowToDocument, templates, addTemplate } = useApp()
  const { user } = useAuth()
  const { uploadFile, isUploading, uploadProgress } = useFileUpload()

  const [documentName, setDocumentName] = useState("Nuevo Documento")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
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
  const [saveTemplateModal, setSaveTemplateModal] = useState<{
    isOpen: boolean
  }>({ isOpen: false })
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")

  // Cargar borrador guardado al iniciar
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DOCUMENT_DRAFT_KEY)
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)
        setDocumentName(draft.name || "Nuevo Documento")
        setDocumentDescription(draft.description || "")
        setFields(draft.fields || [])
        setRows(draft.rows || [])
        setCurrentDocumentId(draft.currentDocumentId || null)

        toast({
          title: "Borrador cargado",
          description: "Se ha cargado un borrador guardado anteriormente.",
        })
      }
    } catch (error) {
      console.error("Error loading draft:", error)
    }
  }, [toast])

  // Guardar borrador automáticamente cuando cambian los datos
  useEffect(() => {
    const saveDraft = () => {
      try {
        const draft = {
          name: documentName,
          description: documentDescription,
          fields,
          rows,
          currentDocumentId,
          lastUpdated: new Date().toISOString(),
        }
        localStorage.setItem(DOCUMENT_DRAFT_KEY, JSON.stringify(draft))
      } catch (error) {
        console.error("Error saving draft:", error)
      }
    }

    // Guardar borrador cada vez que cambian los datos principales
    const timeoutId = setTimeout(saveDraft, 1000)
    return () => clearTimeout(timeoutId)
  }, [documentName, documentDescription, fields, rows, currentDocumentId])

  const handleTitleClick = useCallback(() => {
    setIsEditingTitle(true)
  }, [])

  const handleTitleSave = useCallback(() => {
    setIsEditingTitle(false)
    if (!documentName.trim()) {
      setDocumentName("Nuevo Documento")
    }
  }, [documentName])

  const handleTitleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSave()
      } else if (e.key === "Escape") {
        setDocumentName("Nuevo Documento")
        setIsEditingTitle(false)
      }
    },
    [handleTitleSave],
  )

  const loadTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        const newFields = template.fields.map((field) => ({
          ...field,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        }))
        setFields(newFields)
        toast({
          title: "Plantilla cargada",
          description: `Se han cargado ${newFields.length} campos de la plantilla "${template.name}".`,
        })
      }
    },
    [templates, toast],
  )

  const saveAsTemplate = useCallback(() => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre para la plantilla.",
        variant: "destructive",
      })
      return
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "No hay campos para guardar en la plantilla.",
        variant: "destructive",
      })
      return
    }

    try {
      addTemplate({
        name: templateName,
        description: templateDescription,
        user_id: user?.id || "demo-user",
        fields: fields.map((field, index) => ({ ...field, order: index })),
      })

      toast({
        title: "Plantilla guardada",
        description: `La plantilla "${templateName}" ha sido guardada exitosamente.`,
      })

      setSaveTemplateModal({ isOpen: false })
      setTemplateName("")
      setTemplateDescription("")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Error al guardar la plantilla.",
        variant: "destructive",
      })
    }
  }, [templateName, templateDescription, fields, user, addTemplate, toast])

  const addField = useCallback(() => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      field_name: "",
      type: "text",
      description: "",
      formats: [],
      required: false,
      order: fields.length,
    }
    setFields((prev) => [...prev, newField])
  }, [fields.length])

  const updateField = useCallback((id: string, updates: Partial<DocumentField>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }, [])

  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id))
  }, [])

  const addRow = useCallback(() => {
    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: currentDocumentId || "temp",
      data: {},
      created_at: new Date().toISOString(),
    }
    setRows((prev) => [...prev, newRow])
  }, [currentDocumentId])

  const updateRowData = useCallback((rowId: string, fieldName: string, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)),
    )
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Agregar esta función auxiliar para generar valores por defecto según el tipo
  const generateDefaultValue = (type: string, fieldName: string): any => {
    switch (type) {
      case "number":
        return Math.floor(Math.random() * 100)
      case "date":
        return new Date().toISOString().split("T")[0]
      case "boolean":
        return Math.random() > 0.5
      case "email":
        const domains = ["gmail.com", "outlook.com", "empresa.com", "example.com"]
        return `usuario${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`
      case "url":
        return `https://example.com/page${Math.floor(Math.random() * 100)}`
      default: // text
        if (fieldName.includes("nombre") || fieldName.includes("name")) {
          const nombres = ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Roberto Fernández"]
          return nombres[Math.floor(Math.random() * nombres.length)]
        } else if (fieldName.includes("direccion") || fieldName.includes("address")) {
          const direcciones = ["Calle Principal 123", "Av. Central 456", "Plaza Mayor 789", "Ruta 8 Km 45"]
          return direcciones[Math.floor(Math.random() * direcciones.length)]
        } else if (fieldName.includes("telefono") || fieldName.includes("phone")) {
          return `+${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000000000)}`
        } else {
          return `Valor extraído para ${fieldName}`
        }
    }
  }

  // Move this entire block before handleFiles
  const simulateDataExtraction = useCallback((file: File, fields: DocumentField[]): Record<string, any> => {
    const extractedData: Record<string, any> = {}

    // Generar datos más realistas basados en el nombre del archivo
    const fileName = file.name.toLowerCase()
    const isInvoice = fileName.includes("factura") || fileName.includes("invoice")
    const isContract = fileName.includes("contrato") || fileName.includes("contract")
    const isInventory = fileName.includes("inventario") || fileName.includes("inventory")

    // Fecha actual formateada
    const currentDate = new Date().toISOString().split("T")[0]

    // Simular extracción de datos basada en el nombre del archivo y campos
    fields.forEach((field) => {
      const fieldNameLower = field.field_name.toLowerCase()

      // Datos específicos según el tipo de documento detectado
      if (isInvoice) {
        switch (fieldNameLower) {
          case "document_title":
          case "titulo":
          case "title":
            extractedData[field.field_name] = `Factura ${Math.floor(Math.random() * 10000)}`
            break
          case "fecha":
          case "date":
            extractedData[field.field_name] = currentDate
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
            extractedData[field.field_name] = generateDefaultValue(field.type, fieldNameLower)
        }
      } else if (isContract) {
        switch (fieldNameLower) {
          case "document_title":
          case "titulo":
          case "title":
            extractedData[field.field_name] = `Contrato de Servicios ${Math.floor(Math.random() * 1000)}`
            break
          case "fecha":
          case "date":
          case "fecha_inicio":
          case "start_date":
            extractedData[field.field_name] = currentDate
            break
          case "numero_contrato":
          case "contract_number":
            extractedData[field.field_name] = `CONT-${Math.floor(Math.random() * 10000)}`
            break
          case "duracion":
          case "duration":
            extractedData[field.field_name] = `${Math.floor(Math.random() * 24) + 1} meses`
            break
          case "cliente":
          case "customer":
          case "client":
            const clientes = ["Empresa ABC S.A.", "Corporación XYZ", "TechCorp Solutions", "Innovate Ltd."]
            extractedData[field.field_name] = clientes[Math.floor(Math.random() * clientes.length)]
            break
          default:
            extractedData[field.field_name] = generateDefaultValue(field.type, fieldNameLower)
        }
      } else if (isInventory) {
        switch (fieldNameLower) {
          case "document_title":
          case "titulo":
          case "title":
            extractedData[field.field_name] = `Inventario ${new Date().toLocaleDateString()}`
            break
          case "codigo_producto":
          case "product_code":
            extractedData[field.field_name] = `PROD-${Math.floor(Math.random() * 10000)}`
            break
          case "nombre":
          case "name":
          case "producto":
          case "product":
            const productos = ["Laptop HP", "Monitor Dell", "Teclado Logitech", "Mouse Inalámbrico", "Impresora Epson"]
            extractedData[field.field_name] = productos[Math.floor(Math.random() * productos.length)]
            break
          case "cantidad":
          case "quantity":
            extractedData[field.field_name] = Math.floor(Math.random() * 100) + 1
            break
          case "precio":
          case "price":
            extractedData[field.field_name] = (Math.random() * 500 + 50).toFixed(2)
            break
          default:
            extractedData[field.field_name] = generateDefaultValue(field.type, fieldNameLower)
        }
      } else {
        // Documento genérico
        extractedData[field.field_name] = generateDefaultValue(field.type, fieldNameLower)
      }
    })

    return extractedData
  }, [])

  // Actualizar la función handleFiles para mejorar el procesamiento de documentos
  // y asegurar que el modal de vista previa se muestre correctamente
  const handleFiles = useCallback(
    async (files: FileList) => {
      console.log("Procesando archivos:", files.length)

      if (!documentName.trim() || documentName === "Nuevo Documento") {
        toast({
          title: "Error",
          description: "Por favor, cambia el nombre del documento antes de subir archivos.",
          variant: "destructive",
        })
        return
      }

      // Verificar que haya campos definidos
      if (fields.length === 0) {
        toast({
          title: "Error",
          description: "Por favor, define al menos un campo antes de subir archivos.",
          variant: "destructive",
        })
        return
      }

      // Crear documento si no existe
      let docId = currentDocumentId
      if (!docId) {
        try {
          docId = addDocument({
            name: documentName,
            description: documentDescription,
            user_id: user?.id || "demo-user",
            fields,
            rows: [],
          })
          setCurrentDocumentId(docId)
          toast({
            title: "Documento creado",
            description: "Se ha creado un nuevo documento para procesar los archivos.",
          })
        } catch (error) {
          console.error("Error creating document:", error)
          toast({
            title: "Error",
            description: "Error al crear el documento.",
            variant: "destructive",
          })
          return
        }
      }

      // Procesar solo el primer archivo por ahora para simplificar
      if (files.length > 0) {
        const file = files[0]
        try {
          setUploadingFile(file.name)

          // Mostrar notificación de inicio de procesamiento
          toast({
            title: "Procesando archivo",
            description: `Iniciando procesamiento de ${file.name}...`,
          })

          const fileMetadata = await uploadFile(file)
          console.log("Archivo procesado:", fileMetadata)

          // Simular extracción de datos basada en los campos definidos
          const extractedData = simulateDataExtraction(file, fields)
          console.log("Datos extraídos:", extractedData)

          toast({
            title: "Archivo procesado",
            description: `Se han extraído datos de ${file.name}. Revise y confirme la información.`,
          })

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
    },
    [
      documentName,
      documentDescription,
      fields,
      currentDocumentId,
      user,
      addDocument,
      uploadFile,
      simulateDataExtraction,
      toast,
    ],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        console.log("Archivos arrastrados:", e.dataTransfer.files.length)
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handlePreviewConfirm = useCallback(
    (data: Record<string, any>) => {
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
    },
    [currentDocumentId, previewModal.fileMetadata, addRowToDocument, toast],
  )

  const closePreviewModal = useCallback(() => {
    setPreviewModal({ isOpen: false })
  }, [])

  const saveDocument = useCallback(() => {
    if (!documentName.trim() || documentName === "Nuevo Documento") {
      toast({
        title: "Error",
        description: "Por favor, cambia el nombre del documento.",
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

      // Limpiar el borrador después de guardar exitosamente
      localStorage.removeItem(DOCUMENT_DRAFT_KEY)

      router.push(`/documents/${docId}`)
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error",
        description: "Error al guardar el documento.",
        variant: "destructive",
      })
    }
  }, [documentName, documentDescription, fields, rows, currentDocumentId, user, addDocument, toast, router])

  const exportDocument = useCallback(
    (format: "csv" | "pdf" | "excel") => {
      console.log(`Exportando documento como ${format}`)
      toast({
        title: "Exportación iniciada",
        description: `Preparando descarga en formato ${format.toUpperCase()}...`,
      })
    },
    [toast],
  )

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Editable Title */}
        <div className="mb-8">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                onBlur={handleTitleSave}
                className="text-3xl font-bold border-none p-0 h-auto text-gray-900 focus:ring-0"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleTitleSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setDocumentName("Nuevo Documento")
                  setIsEditingTitle(false)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <h1
              className="text-3xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={handleTitleClick}
            >
              {documentName}
            </h1>
          )}
          <p className="text-gray-600">Define tu estructura de datos y comienza a extraer información de documentos.</p>

          {/* Description */}
          <div className="mt-4">
            <Textarea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Agrega una descripción opcional para tu documento..."
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Fields Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Campos de Datos</CardTitle>
                <CardDescription>Define la estructura de tu extracción de datos</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {templates.length > 0 && (
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Cargar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <Layout className="w-4 h-4" />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSaveTemplateModal({ isOpen: true })}
                  disabled={fields.length === 0}
                >
                  <Layout className="w-4 h-4 mr-2" />
                  Guardar Plantilla
                </Button>
                <Button onClick={addField} className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Campo
                </Button>
              </div>
            </div>
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
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`required-${field.id}`} className="text-sm">
                      Campo obligatorio
                    </Label>
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
              <Button
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isUploading}
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      handleFiles(files)
                    }
                  }
                  input.click()
                }}
              >
                {isUploading ? "Procesando..." : "Elegir Archivos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.push("/documents")}>
            Cancelar
          </Button>
          <Button onClick={saveDocument} className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar Documento
          </Button>
        </div>

        {/* Save Template Modal */}
        <Dialog open={saveTemplateModal.isOpen} onOpenChange={(open) => setSaveTemplateModal({ isOpen: open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guardar como Plantilla</DialogTitle>
              <DialogDescription>
                Guarda la estructura actual de campos como una plantilla reutilizable
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ej: Plantilla de Facturas"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Descripción</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe para qué se usará esta plantilla..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Campos incluidos ({fields.length}):</h4>
                <div className="flex flex-wrap gap-1">
                  {fields.map((field) => (
                    <Badge key={field.id} variant="secondary" className="text-xs">
                      {field.field_name || "Sin nombre"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveTemplateModal({ isOpen: false })}>
                Cancelar
              </Button>
              <Button
                onClick={saveAsTemplate}
                disabled={!templateName.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Guardar Plantilla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={previewModal.isOpen}
          onClose={closePreviewModal}
          onConfirm={handlePreviewConfirm}
          fields={fields}
          fileMetadata={previewModal.fileMetadata}
          extractedData={previewModal.extractedData}
        />
      </div>
    </div>
  )
}
