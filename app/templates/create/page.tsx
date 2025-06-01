"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import type { DocumentField } from "@/lib/types"

export default function CreateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addTemplate } = useApp()
  const { user } = useAuth()

  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [fields, setFields] = useState<DocumentField[]>([
    {
      id: "1",
      field_name: "title",
      type: "text",
      description: "Título del documento",
      formats: [],
      variants: [],
      required: true,
      order: 0,
    },
  ])

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

  const saveTemplate = () => {
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
        description: "Por favor, define al menos un campo.",
        variant: "destructive",
      })
      return
    }

    // Validar que todos los campos tengan nombre
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
      const templateId = addTemplate({
        name: templateName,
        description: templateDescription,
        user_id: user?.id || "demo-user",
        fields: fields.map((field, index) => ({ ...field, order: index })),
      })

      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada exitosamente.",
      })

      router.push("/templates")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Error al guardar la plantilla.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Plantilla</h1>
          <p className="text-gray-600">Define una estructura de campos reutilizable para tus documentos.</p>
        </div>

        {/* Template Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Información de la Plantilla</CardTitle>
            <CardDescription>Información básica sobre tu plantilla</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la Plantilla</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: Plantilla de Facturas, Contratos, etc."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe para qué se usará esta plantilla..."
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
              <CardTitle>Campos de la Plantilla</CardTitle>
              <CardDescription>Define los campos que incluirá esta plantilla</CardDescription>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="mt-3">
                    <Label>Descripción</Label>
                    <Textarea
                      value={field.description || ""}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      placeholder="Descripción del campo..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Variantes</Label>
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
                        className="mt-1"
                      />
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
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      disabled={fields.length === 1}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.push("/templates")}>
            Cancelar
          </Button>
          <Button onClick={saveTemplate} className="bg-black hover:bg-gray-800 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar Plantilla
          </Button>
        </div>
      </div>
    </div>
  )
}
