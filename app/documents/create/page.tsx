"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, Trash, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { useAuth } from "@/contexts/auth-context"
import type { DocumentField } from "@/lib/types"

export default function CreateDocumentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addDocument } = useApp()
  const { user } = useAuth()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<DocumentField[]>([{ name: "Campo 1", type: "text", required: true }])
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleAddField = () => {
    setFields([...fields, { name: `Campo ${fields.length + 1}`, type: "text", required: false }])
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: Partial<DocumentField>) => {
    setFields(
      fields.map((f, i) => {
        if (i === index) {
          return { ...f, ...field }
        }
        return f
      }),
    )
  }

  const handleSave = async () => {
    if (isSaving || isSaved) return

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre para el documento.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Validar que todos los campos tengan nombre
      const invalidFields = fields.filter((field) => !field.name.trim())
      if (invalidFields.length > 0) {
        toast({
          title: "Error",
          description: "Todos los campos deben tener un nombre.",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const documentId = addDocument({
        name,
        description,
        fields,
        user_id: user?.id || "anonymous",
      })

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
      console.error("Error creating document:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el documento.",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Documento</h1>
            <p className="text-muted-foreground">Define los campos y estructura de tu documento</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Ingresa la información general del documento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Documento</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Factura, Contrato, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el propósito de este documento..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campos del Documento</CardTitle>
                <CardDescription>Define los campos que contendrá tu documento</CardDescription>
              </div>
              <Button onClick={handleAddField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Campo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index} className="grid gap-4 p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Campo {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(index)}
                        className="h-8 w-8 p-0 text-red-600"
                        disabled={fields.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`field-name-${index}`}>Nombre del Campo</Label>
                        <Input
                          id={`field-name-${index}`}
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                          placeholder="Ej: Nombre, Fecha, etc."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`field-type-${index}`}>Tipo de Campo</Label>
                        <Select value={field.type} onValueChange={(value) => handleFieldChange(index, { type: value })}>
                          <SelectTrigger id={`field-type-${index}`} className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="date">Fecha</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Teléfono</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="textarea">Área de Texto</SelectItem>
                            <SelectItem value="select">Selección</SelectItem>
                            <SelectItem value="checkbox">Casilla de Verificación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`field-required-${index}`}
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`field-required-${index}`} className="text-sm font-normal">
                        Campo obligatorio
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || isSaved || !name.trim()} className="min-w-[150px]">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : isSaved ? "Guardado" : "Guardar Documento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
