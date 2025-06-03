"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { ChipsInput } from "@/components/chips-input"
import type { Template, Field } from "@/lib/types"

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const { templates, updateTemplate } = useApp()

  const [template, setTemplate] = useState<Template | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const templateId = params.id as string
    const foundTemplate = templates.find((t) => t.id === templateId)

    if (foundTemplate) {
      setTemplate(foundTemplate)
      setName(foundTemplate.name)
      setDescription(foundTemplate.description || "")
      setFields(foundTemplate.fields || [])
    } else {
      setError("Plantilla no encontrada")
    }
    setLoading(false)
  }, [params.id, templates])

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: "",
      type: "text",
      required: false,
      order: fields.length,
      variants: [],
      formats: [],
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedFields = fields.map((field, i) => (i === index ? { ...field, ...updates } : field))
    setFields(updatedFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return

    setSaving(true)
    setError(null)

    try {
      await updateTemplate(template.id, {
        name,
        description,
        fields: fields.map((field, index) => ({
          ...field,
          order: index,
        })),
      })

      router.push("/templates")
    } catch (error) {
      console.error("Error al actualizar la plantilla:", error)
      setError("Error al guardar la plantilla. Por favor, inténtalo de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Cargando plantilla...</div>
        </div>
      </div>
    )
  }

  if (error && !template) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => router.push("/templates")}>Volver a plantillas</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Plantilla</h1>
        <p className="text-gray-600">Modifica los campos y configuración de tu plantilla</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la plantilla</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Factura de venta"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe para qué se usa esta plantilla"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Campos de la plantilla
              <Button type="button" onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar campo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay campos definidos. Agrega el primer campo para comenzar.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Campo {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeField(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre del campo</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="Ej: Nombre del cliente"
                        />
                      </div>
                      <div>
                        <Label>Tipo de campo</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(index, { type: value as Field["type"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="date">Fecha</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="select">Lista desplegable</SelectItem>
                            <SelectItem value="file">Archivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Variantes</Label>
                        <ChipsInput
                          value={field.variants || []}
                          onChange={(variants) => updateField(index, { variants })}
                          placeholder="Agregar variante..."
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Presiona Enter, coma (,) o haz clic fuera para agregar
                        </p>
                      </div>
                      <div>
                        <Label>Formatos de respuesta</Label>
                        <ChipsInput
                          value={field.formats || []}
                          onChange={(formats) => updateField(index, { formats })}
                          placeholder="Agregar formato..."
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Presiona Enter, coma (,) o haz clic fuera para agregar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`required-${field.id}`}>Campo obligatorio</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/templates")} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
