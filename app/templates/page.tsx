"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, Layout, Calendar, MoreHorizontal, Trash2, Edit, Copy, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import AuthGuard from "@/components/auth-guard"
import type { Template } from "@/lib/types"

export default function TemplatesPage() {
  const { templates, addTemplate, deleteTemplate, addDocument } = useApp()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [createDocumentModal, setCreateDocumentModal] = useState<{
    isOpen: boolean
    template?: Template
  }>({ isOpen: false })
  const [documentName, setDocumentName] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")

  // Asegurarse de que los templates se carguen correctamente
  useEffect(() => {
    // Forzar actualización del estado si es necesario
    if (templates.length > 0) {
      console.log("Templates cargados:", templates.length)
    }
  }, [templates])

  const filteredAndSortedTemplates = useMemo(() => {
    const filtered = templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
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
  }, [templates, searchTerm, sortBy, sortOrder])

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

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la plantilla "${name}"?`)) {
      deleteTemplate(id)
      toast({
        title: "Plantilla eliminada",
        description: `La plantilla "${name}" ha sido eliminada exitosamente.`,
      })
    }
  }

  const handleCreateDocumentFromTemplate = (template: Template) => {
    setCreateDocumentModal({ isOpen: true, template })
    setDocumentName(`${template.name} - ${new Date().toLocaleDateString("es-ES")}`)
    setDocumentDescription(template.description || "")
  }

  const confirmCreateDocument = () => {
    if (!createDocumentModal.template || !documentName.trim()) return

    const newDocumentId = addDocument({
      name: documentName,
      description: documentDescription,
      user_id: user?.id || "demo-user",
      fields: createDocumentModal.template.fields,
      rows: [],
    })

    toast({
      title: "Documento creado",
      description: `El documento "${documentName}" ha sido creado desde la plantilla.`,
    })

    setCreateDocumentModal({ isOpen: false })
    setDocumentName("")
    setDocumentDescription("")

    // Redirect to the new document
    window.location.href = `/documents/${newDocumentId}`
  }

  const duplicateTemplate = (template: Template) => {
    const newTemplateId = addTemplate({
      name: `${template.name} (Copia)`,
      description: template.description,
      user_id: user?.id || "demo-user",
      fields: template.fields.map((field) => ({
        ...field,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })),
    })

    toast({
      title: "Plantilla duplicada",
      description: `Se ha creado una copia de la plantilla "${template.name}".`,
    })
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plantillas</h1>
            <p className="text-gray-600">Gestiona tus plantillas reutilizables de campos</p>
          </div>
          <Link href="/templates/create">
            <Button className="bg-black hover:bg-gray-800 text-white mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
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
                    placeholder="Buscar plantillas..."
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

        {/* Templates Grid */}
        {filteredAndSortedTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <Layout className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCreateDocumentFromTemplate(template)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Crear Documento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/templates/${template.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Fields count */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Layout className="w-4 h-4 mr-1" />
                      {template.fields.length} campos definidos
                    </div>

                    {/* Fields preview */}
                    <div className="flex flex-wrap gap-1">
                      {template.fields.slice(0, 4).map((field) => (
                        <Badge key={field.id} variant="secondary" className="text-xs">
                          {field.field_name}
                        </Badge>
                      ))}
                      {template.fields.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.fields.length - 4} más
                        </Badge>
                      )}
                    </div>

                    {/* Creation date */}
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Creado: {new Date(template.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      onClick={() => handleCreateDocumentFromTemplate(template)}
                      className="w-full mt-3 bg-black hover:bg-gray-800 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Usar Plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? "No se encontraron plantillas" : "No hay plantillas"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Crea tu primera plantilla para reutilizar estructuras de campos"}
              </p>
              <Link href="/templates/create">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Plantilla
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Create Document Modal */}
        <Dialog open={createDocumentModal.isOpen} onOpenChange={(open) => setCreateDocumentModal({ isOpen: open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Documento desde Plantilla</DialogTitle>
              <DialogDescription>
                Crea un nuevo documento usando la plantilla "{createDocumentModal.template?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-name">Nombre del Documento</Label>
                <Input
                  id="doc-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Ingresa el nombre del documento..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="doc-description">Descripción</Label>
                <Textarea
                  id="doc-description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Describe el documento..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              {createDocumentModal.template && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Campos incluidos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {createDocumentModal.template.fields.map((field) => (
                      <Badge key={field.id} variant="secondary" className="text-xs">
                        {field.field_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDocumentModal({ isOpen: false })}>
                Cancelar
              </Button>
              <Button
                onClick={confirmCreateDocument}
                disabled={!documentName.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Crear Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
