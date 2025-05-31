"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Document, DocumentRow } from "@/lib/types"

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { getDocument, updateDocument, addRowToDocument, updateDocumentRow, deleteDocumentRow } = useApp()
  const { toast } = useToast()
  const [document, setDocument] = useState<Document | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<DocumentRow[]>([])

  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    if (doc) {
      setDocument(doc)
      setName(doc.name)
      setDescription(doc.description || "")
      setRows(doc.rows)
    }
    setLoading(false)
  }, [params.id, getDocument])

  const handleSave = () => {
    if (!document) return

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del documento es obligatorio.",
        variant: "destructive",
      })
      return
    }

    updateDocument(document.id, {
      name: name.trim(),
      description: description.trim(),
    })

    toast({
      title: "Documento actualizado",
      description: "Los cambios han sido guardados exitosamente.",
    })

    router.push(`/documents/${document.id}`)
  }

  const addRow = useCallback(() => {
    if (!document) return

    const newRow: DocumentRow = {
      id: Date.now().toString(),
      document_id: document.id,
      data: {},
      created_at: new Date().toISOString(),
    }

    addRowToDocument(document.id, newRow)
    setRows((prev) => [...prev, newRow])

    toast({
      title: "Fila agregada",
      description: "Se ha agregado una nueva fila al documento.",
    })
  }, [document, addRowToDocument, toast])

  const updateRowData = useCallback(
    (rowId: string, fieldName: string, value: any) => {
      if (!document) return

      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, data: { ...row.data, [fieldName]: value } } : row)),
      )

      // Actualizar en el contexto global
      const row = rows.find((r) => r.id === rowId)
      if (row) {
        const updatedData = { ...row.data, [fieldName]: value }
        updateDocumentRow(document.id, rowId, updatedData)
      }
    },
    [document, rows, updateDocumentRow],
  )

  const removeRow = useCallback(
    (rowId: string) => {
      if (!document) return

      if (confirm("¿Estás seguro de que quieres eliminar esta fila?")) {
        deleteDocumentRow(document.id, rowId)
        setRows((prev) => prev.filter((row) => row.id !== rowId))

        toast({
          title: "Fila eliminada",
          description: "La fila ha sido eliminada exitosamente.",
        })
      }
    },
    [document, deleteDocumentRow, toast],
  )

  if (loading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Documento no encontrado</h3>
              <p className="text-gray-600 mb-6">El documento que intentas editar no existe.</p>
              <Button onClick={() => router.push("/documents")} className="bg-black hover:bg-gray-800 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Documentos
              </Button>
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
            <Button variant="outline" size="icon" onClick={() => router.push(`/documents/${document.id}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Documento</h1>
              <p className="text-gray-600">Modifica la información y datos del documento</p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        {/* Edit Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información del Documento</CardTitle>
            <CardDescription>Actualiza el nombre y descripción del documento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre del Documento</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa el nombre del documento..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el documento..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Información del Documento</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Campos definidos:</span> {document.fields.length}
                </div>
                <div>
                  <span className="text-gray-500">Entradas de datos:</span> {rows.length}
                </div>
                <div>
                  <span className="text-gray-500">Creado:</span>{" "}
                  {new Date(document.created_at).toLocaleDateString("es-ES")}
                </div>
                <div>
                  <span className="text-gray-500">Última actualización:</span>{" "}
                  {new Date(document.updated_at).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Datos del Documento</CardTitle>
              <CardDescription>Edita las entradas de datos existentes</CardDescription>
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
      </div>
    </div>
  )
}
