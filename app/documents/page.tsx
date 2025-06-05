"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Plus, FileText, Calendar, MoreHorizontal, Trash2, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import type { Document } from "@/lib/types"

export default function DocumentsPage() {
  const { documents, deleteDocument } = useApp()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "updated_at" | "created_at">("updated_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // No mostrar contenido hasta que termine la carga de autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Si no hay usuario, mostrar AuthGuard
  if (!user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    )
  }

  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "updated_at":
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [documents, searchTerm, sortBy, sortOrder])

  const handleDeleteDocument = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el documento "${name}"?`)) {
      deleteDocument(id)
      toast({
        title: "Documento eliminado",
        description: `El documento "${name}" ha sido eliminado exitosamente.`,
      })
    }
  }

  const getDocumentStats = (doc: Document) => {
    const totalRows = doc.rows.length
    const filesCount = doc.rows.filter((row) => row.file_metadata).length
    return { totalRows, filesCount }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentos</h1>
            <p className="text-gray-600">Gestiona todos tus proyectos de documentos</p>
          </div>
          <Link href="/documents/create">
            <Button className="bg-black hover:bg-gray-800 text-white mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Documento
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Última actualización</SelectItem>
                    <SelectItem value="created_at">Fecha de creación</SelectItem>
                    <SelectItem value="name">Nombre</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descendente</SelectItem>
                    <SelectItem value="asc">Ascendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {filteredAndSortedDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDocuments.map((document) => {
              const stats = getDocumentStats(document)
              return (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{document.name}</CardTitle>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/documents/${document.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/documents/${document.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDocument(document.id, document.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{document.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <FileText className="w-4 h-4 mr-1" />
                          {stats.totalRows} entradas
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {stats.filesCount} archivos
                        </div>
                      </div>

                      {/* Fields preview */}
                      <div className="flex flex-wrap gap-1">
                        {document.fields.slice(0, 3).map((field) => (
                          <Badge key={field.id} variant="secondary" className="text-xs">
                            {field.field_name}
                          </Badge>
                        ))}
                        {document.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.fields.length - 3} más
                          </Badge>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Creado: {new Date(document.created_at).toLocaleDateString("es-ES")}</div>
                        <div>Actualizado: {new Date(document.updated_at).toLocaleDateString("es-ES")}</div>
                      </div>

                      {/* Action button */}
                      <Link href={`/documents/${document.id}`}>
                        <Button variant="outline" className="w-full mt-3">
                          Abrir Documento
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? "No se encontraron documentos" : "No hay documentos"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Crea tu primer documento para comenzar"}
              </p>
              <Link href="/documents/create">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Documento
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
