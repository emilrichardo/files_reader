"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useFileUpload } from "@/hooks/use-file-upload"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const { themeConfig, updateThemeConfig, saveThemeConfig, isLoading, resetThemeConfig } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()
  const [localConfig, setLocalConfig] = useState({ ...themeConfig })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para el upload de logo
  const { uploadFile, progress, isUploading, error: uploadError, reset: resetUpload } = useFileUpload()

  // Actualizar el estado local cuando cambia themeConfig
  useEffect(() => {
    setLocalConfig({ ...themeConfig })
    if (themeConfig.companyLogo) {
      setLogoPreview(themeConfig.companyLogo)
    }
  }, [themeConfig])

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalConfig((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en los selects
  const handleSelectChange = (name: string, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de tema (claro/oscuro)
  const handleThemeChange = (checked: boolean) => {
    setLocalConfig((prev) => ({ ...prev, theme: checked ? "dark" : "light" }))
  }

  // Manejar subida de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no soportado",
        description: "Por favor sube una imagen JPG, PNG o SVG.",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 2MB.",
        variant: "destructive",
      })
      return
    }

    try {
      // Leer el archivo como Data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string
          setLogoPreview(dataUrl)
          setLocalConfig((prev) => ({
            ...prev,
            companyLogo: dataUrl,
            companyLogoType: file.type.split("/")[1], // Extraer el tipo (jpeg, png, svg+xml)
          }))
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error al procesar el logo:", error)
      toast({
        title: "Error al procesar el logo",
        description: "No se pudo procesar el archivo seleccionado.",
        variant: "destructive",
      })
    }
  }

  // Eliminar logo
  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setLocalConfig((prev) => ({ ...prev, companyLogo: null, companyLogoType: null }))
  }

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true)
      // Actualizar el estado global primero
      await updateThemeConfig(localConfig)
      // Luego guardar en la base de datos
      await saveThemeConfig()

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados correctamente.",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Restablecer configuración
  const handleReset = () => {
    resetThemeConfig()
    setLogoPreview(null)
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados.",
    })
  }

  return (
    <AuthGuard allowedRoles={["admin", "super_admin"]}>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Configuración</h1>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          </TabsList>

          {/* Pestaña General */}
          <TabsContent value="general">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Configura la información básica de tu aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nombre del Proyecto</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={localConfig.projectName}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>Sube el logo de tu empresa o proyecto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 h-40">
                    {logoPreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={handleRemoveLogo}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Label htmlFor="logo-upload" className="cursor-pointer text-primary hover:text-primary/80">
                          Haz clic para subir un logo
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">SVG, PNG o JPG (max. 2MB)</p>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/svg+xml"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Apariencia */}
          <TabsContent value="appearance">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tema y Colores</CardTitle>
                  <CardDescription>Personaliza la apariencia visual de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Esquema de Color</Label>
                    <Select
                      value={localConfig.colorScheme}
                      onValueChange={(value) => handleSelectChange("colorScheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un esquema de color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slate">Slate</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                        <SelectItem value="zinc">Zinc</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="stone">Stone</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="amber">Amber</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="lime">Lime</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="emerald">Emerald</SelectItem>
                        <SelectItem value="teal">Teal</SelectItem>
                        <SelectItem value="cyan">Cyan</SelectItem>
                        <SelectItem value="sky">Sky</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="indigo">Indigo</SelectItem>
                        <SelectItem value="violet">Violet</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="fuchsia">Fuchsia</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="rose">Rose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customColor">Color Personalizado</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customColor"
                        name="customColor"
                        type="color"
                        value={localConfig.customColor || "#3b82f6"}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        name="customColor"
                        value={localConfig.customColor || "#3b82f6"}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Fuente</Label>
                    <Select
                      value={localConfig.fontFamily}
                      onValueChange={(value) => handleSelectChange("fontFamily", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="darkMode">Modo Oscuro</Label>
                    <Switch id="darkMode" checked={localConfig.theme === "dark"} onCheckedChange={handleThemeChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="styleMode">Estilo Visual</Label>
                    <Select
                      value={localConfig.styleMode}
                      onValueChange={(value) => handleSelectChange("styleMode", value as "flat" | "soft" | "glass")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Plano</SelectItem>
                        <SelectItem value="soft">Suave</SelectItem>
                        <SelectItem value="glass">Cristal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>Así se verá tu aplicación con la configuración actual.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      {logoPreview ? (
                        <img src={logoPreview || "/placeholder.svg"} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: localConfig.customColor || "#3b82f6" }}
                        >
                          {localConfig.projectName.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold">{localConfig.projectName}</span>
                    </div>

                    <div className="space-y-2">
                      <div
                        className="w-full h-4 rounded"
                        style={{ backgroundColor: localConfig.customColor || "#3b82f6" }}
                      ></div>
                      <div className="flex gap-2">
                        <div
                          className="flex-1 h-8 rounded flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: localConfig.customColor || "#3b82f6" }}
                        >
                          Botón Primario
                        </div>
                        <div className="flex-1 h-8 rounded border flex items-center justify-center font-medium">
                          Botón Secundario
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold">Título de Ejemplo</h3>
                      <p className="text-sm">
                        Este es un texto de ejemplo para mostrar cómo se verá el contenido con la configuración
                        seleccionada.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Avanzado */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Configuración Avanzada</CardTitle>
                <CardDescription>Opciones avanzadas para la integración con servicios externos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">Endpoint de API</Label>
                  <Input
                    id="apiEndpoint"
                    name="apiEndpoint"
                    value={localConfig.apiEndpoint || ""}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/api/webhook"
                  />
                  <p className="text-sm text-gray-500">URL del endpoint para procesar documentos subidos.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleReset} disabled={isLoading || isSaving}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </AuthGuard>
  )
}
