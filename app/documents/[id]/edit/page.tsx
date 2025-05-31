"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import type { Document } from "@/lib/types"

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { getDocument, updateDocument } = useApp()
  const { toast } = useToast()
  const [document, setDocument] = useState<Document | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docId = params.id as string
    const doc = getDocument(docId)
    if (doc) {
      setDocument(doc)
      setName(doc.name)
      setDescription(doc.description || "")
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/documents/${document.id}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Documento</h1>
              <p className="text-gray-600">Modifica la información básica del documento</p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
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
                  <span className="text-gray-500">Entradas de datos:</span> {document.rows.length}
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
      </div>
    </div>
  )
}
