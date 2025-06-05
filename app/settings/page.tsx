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
import { useToast } from "@/hooks/use-toast"
import { useFileUpload } from "@/hooks/use-file-upload"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    isDark,
    toggleTheme,
    primaryColor,
    companyLogo,
    logoType,
    projectName,
    updateProjectName,
    updateLogo,
    removeLogo,
    fontFamilies,
    colorSchemes,
    isAdmin,
  } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()
  const [localConfig, setLocalConfig] = useState({ ...settings })
  const [logoPreview, setLogoPreview] = useState<string | null>(companyLogo)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para el upload de logo
  const { uploadFile, progress, isUploading, error: uploadError, reset: resetUpload } = useFileUpload()

  // Actualizar el estado local cuando cambia settings
  useEffect(() => {
    setLocalConfig({ ...settings })
    if (companyLogo) {
      setLogoPreview(companyLogo)
    }
  }, [settings, companyLogo])

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
      await updateLogo(file)
      toast({
        title: "Logo actualizado",
        description: "El logo ha sido actualizado correctamente.",
      })
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
  const handleRemoveLogo = async () => {
    try {
      await removeLogo()
      setLogoPreview(null)
      toast({
        title: "Logo eliminado",
        description: "El logo ha sido eliminado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el logo.",
        variant: "destructive",
      })
    }
  }

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateSettings(localConfig)
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
    setLocalConfig({
      ...settings,
      project_name: "Civet",
      theme: "light",
      color_scheme: "blue",
      custom_color: "#3b82f6",
      font_family: "Inter",
      style_mode: "flat",
    })
    setLogoPreview(null)
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados.",
    })
  }

  return (
    <AuthGuard allowedRoles={["admin", "superadmin"]}>
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
                    <Label htmlFor="project_name">Nombre del Proyecto</Label>
                    <Input
                      id="project_name"
                      name="project_name"
                      value={localConfig.project_name}
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
                    <Label htmlFor="color_scheme">Esquema de Color</Label>
                    <Select
                      value={localConfig.color_scheme}
                      onValueChange={(value) => handleSelectChange("color_scheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un esquema de color" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(colorSchemes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: value }} />
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_color">Color Personalizado</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom_color"
                        name="custom_color"
                        type="color"
                        value={localConfig.custom_color || "#3b82f6"}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        name="custom_color"
                        value={localConfig.custom_color || "#3b82f6"}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font_family">Fuente</Label>
                    <Select
                      value={localConfig.font_family}
                      onValueChange={(value) => handleSelectChange("font_family", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="darkMode">Modo Oscuro</Label>
                    <Switch id="darkMode" checked={localConfig.theme === "dark"} onCheckedChange={handleThemeChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style_mode">Estilo Visual</Label>
                    <Select
                      value={localConfig.style_mode}
                      onValueChange={(value) => handleSelectChange("style_mode", value as "flat" | "soft" | "glass")}
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
                          style={{ backgroundColor: localConfig.custom_color || "#3b82f6" }}
                        >
                          {localConfig.project_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold">{localConfig.project_name}</span>
                    </div>

                    <div className="space-y-2">
                      <div
                        className="w-full h-4 rounded"
                        style={{ backgroundColor: localConfig.custom_color || "#3b82f6" }}
                      ></div>
                      <div className="flex gap-2">
                        <div
                          className="flex-1 h-8 rounded flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: localConfig.custom_color || "#3b82f6" }}
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
                  <Label htmlFor="api_endpoint">Endpoint de API</Label>
                  <Input
                    id="api_endpoint"
                    name="api_endpoint"
                    value={localConfig.api_endpoint || ""}
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
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </AuthGuard>
  )
}
