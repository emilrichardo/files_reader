"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Download, FileText, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Document } from "@/lib/types"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getDocument, deleteDocument } = useApp()
  const { toast } = useToast()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    setDocument(doc || null)
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

        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Entradas</span>
              </div>
              <p className="text-2xl font-bold">{document.rows.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Última actualización</span>
              </div>
              <p className="text-sm text-gray-600">{new Date(document.updated_at).toLocaleDateString("es-ES")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Archivos</span>
              </div>
              <p className="text-2xl font-bold">{document.rows.filter((row) => row.file_metadata).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Fields */}
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

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Documento</CardTitle>
            <CardDescription>Información extraída y entradas manuales</CardDescription>
          </CardHeader>
          <CardContent>
            {document.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      {document.fields.map((field) => (
                        <th key={field.id} className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                          {field.field_name}
                        </th>
                      ))}
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Archivo</th>
                      <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {document.fields.map((field) => (
                          <td key={field.id} className="border border-gray-200 p-3">
                            {row.data[field.field_name] || "-"}
                          </td>
                        ))}
                        <td className="border border-gray-200 p-3">
                          {row.file_metadata ? (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{row.file_metadata.filename}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Manual</span>
                          )}
                        </td>
                        <td className="border border-gray-200 p-3 text-sm text-gray-600">
                          {new Date(row.created_at).toLocaleDateString("es-ES")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos</h3>
                <p className="text-gray-600 mb-4">Este documento aún no tiene entradas de datos</p>
                <Link href={`/documents/${document.id}/edit`}>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Agregar Datos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
