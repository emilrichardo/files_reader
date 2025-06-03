"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import ChipsInput from "@/components/chips-input"
import type { DocumentField } from "@/lib/types"

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { templates, updateTemplate } = useApp()
  const templateId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  })
  const [fields, setFields] = useState<DocumentField[]>([])

  // Cargar datos de la plantilla
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setFormData({
          name: template.name || "",
          description: template.description || "",
          category: template.category || "",
        })

        // Asegurarse de que los campos tengan las propiedades necesarias
        const processedFields = template.fields.map((field) => ({
          ...field,
          formats: Array.isArray(field.formats) ? field.formats : [],
          variants: Array.isArray(field.variants) ? field.variants : [],
        }))

        setFields(processedFields)
        setLoading(false)
      }
    }
  }, [templateId, templates])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFieldChange = (index: number, field: keyof DocumentField, value: any) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], [field]: value }
    setFields(updatedFields)
  }

  const addField = () => {
    const newField: DocumentField = {
      id: Date.now().toString(),
      field_name: "",
      type: "text",
      required: false,
      description: "",
      formats: [],
      variants: [],
    }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la plantilla es requerido",
        variant: "destructive",
      })
      return
    }

    const validFields = fields.filter((field) => field.field_name.trim())
    if (validFields.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un campo válido",
        variant: "destructive",
      })
      return
    }

    try {
      // Actualizar la plantilla
      await updateTemplate(templateId, {
        ...formData,
        fields: validFields,
      })

      toast({
        title: "Éxito",
        description: "Plantilla actualizada correctamente",
      })

      router.push("/templates")
    } catch (error) {
      console.error("Error al actualizar la plantilla:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la plantilla",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Plantilla</h1>
          <p className="text-gray-600">Modifica los campos que se extraerán de los documentos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Configura los datos generales de la plantilla</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la plantilla *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Facturas de compra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe el propósito de esta plantilla..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facturas">Facturas</SelectItem>
                  <SelectItem value="contratos">Contratos</SelectItem>
                  <SelectItem value="recibos">Recibos</SelectItem>
                  <SelectItem value="identificacion">Identificación</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campos de extracción */}
        <Card>
          <CardHeader>
            <CardTitle>Campos de Extracción</CardTitle>
            <CardDescription>Define qué información se extraerá de los documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Campo {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del campo *</label>
                    <Input
                      value={field.field_name}
                      onChange={(e) => handleFieldChange(index, "field_name", e.target.value)}
                      placeholder="Ej: fecha, total, numero_factura"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de dato</label>
                    <Select value={field.type} onValueChange={(value) => handleFieldChange(index, "type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Input
                    value={field.description || ""}
                    onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                    placeholder="Describe qué información debe contener este campo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Variantes</label>
                  <ChipsInput
                    value={field.variants || []}
                    onChange={(variants) => handleFieldChange(index, "variants", variants)}
                    placeholder="Agregar variante (ej: factura, invoice, bill)..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Formatos de respuesta</label>
                  <ChipsInput
                    value={field.formats || []}
                    onChange={(formats) => handleFieldChange(index, "formats", formats)}
                    placeholder="Agregar formato (ej: DD/MM/YYYY, numérico)..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={(e) => handleFieldChange(index, "required", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={`required-${field.id}`} className="text-sm">
                    Campo requerido
                  </label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addField} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Campo
            </Button>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
