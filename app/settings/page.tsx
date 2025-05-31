"use client"

import type React from "react"
import { useState } from "react"
import { Save, Upload, X, Plus, Eye, EyeOff, Edit, Check, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import DebugTheme from "@/components/debug-theme"
// Importar el componente de color picker
import { HexColorPicker } from "react-colorful"

const colorSchemes = [
  { value: "black", label: "Negro", color: "#000000" },
  { value: "blue", label: "Azul", color: "#3b82f6" },
  { value: "green", label: "Verde", color: "#10b981" },
  { value: "purple", label: "Púrpura", color: "#8b5cf6" },
  { value: "red", label: "Rojo", color: "#ef4444" },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  // Actualizar la desestructuración del useTheme para incluir las nuevas propiedades
  const {
    settings,
    updateSettings,
    isDark,
    toggleTheme,
    primaryColor,
    projectName,
    updateProjectName,
    updateLogo,
    removeLogo,
    companyLogo,
    logoType,
    fontFamilies,
    colorSchemes,
    getOptimalTextColor,
  } = useTheme()

  // Calcular el color de texto óptimo
  const optimalTextColor = getOptimalTextColor(primaryColor)

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newApiKeyValue, setNewApiKeyValue] = useState("")
  const [isAddingApiKey, setIsAddingApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [tempProjectName, setTempProjectName] = useState(projectName)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  // Agregar estados para el color picker
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState(settings.custom_color || "")

  // Guardar configuraciones
  const saveSettings = async () => {
    try {
      setIsSaving(true)

      // Simular una operación asíncrona más corta
      await new Promise((resolve) => setTimeout(resolve, 200))

      toast({
        title: "Configuración guardada",
        description: "Tus configuraciones han sido guardadas exitosamente.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Error al guardar las configuraciones, pero se han aplicado localmente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProjectNameSave = () => {
    console.log("Saving project name:", tempProjectName)
    updateProjectName(tempProjectName)
    setIsEditingProjectName(false)
    toast({
      title: "Nombre actualizado",
      description: "El nombre del proyecto ha sido actualizado.",
    })
  }

  const handleProjectNameCancel = () => {
    setTempProjectName(projectName)
    setIsEditingProjectName(false)
  }

  const updateApiKey = (keyName: string, value: string) => {
    updateSettings({
      api_keys: {
        ...settings.api_keys,
        [keyName]: value,
      },
    })
  }

  const addNewApiKey = () => {
    if (!newApiKeyName.trim() || !newApiKeyValue.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa el nombre y valor de la API key.",
        variant: "destructive",
      })
      return
    }

    updateApiKey(newApiKeyName.toLowerCase().replace(/\s+/g, "_"), newApiKeyValue)
    setNewApiKeyName("")
    setNewApiKeyValue("")
    setIsAddingApiKey(false)
    toast({
      title: "API Key agregada",
      description: `La API key "${newApiKeyName}" ha sido agregada exitosamente.`,
    })
  }

  const removeApiKey = (keyName: string) => {
    const newApiKeys = { ...settings.api_keys }
    delete newApiKeys[keyName]
    updateSettings({
      api_keys: newApiKeys,
    })
    toast({
      title: "API Key eliminada",
      description: `La API key "${keyName}" ha sido eliminada.`,
    })
  }

  const toggleApiKeyVisibility = (keyName: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [keyName]: !prev[keyName],
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleLogoUpload called")
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }

    console.log("File selected:", file.name, file.type, file.size)

    try {
      setIsUploadingLogo(true)
      console.log("Starting logo upload...")
      await updateLogo(file)
      console.log("Logo upload successful")
      toast({
        title: "Logo actualizado",
        description: `El logo ha sido actualizado exitosamente (${file.type}).`,
      })
    } catch (error) {
      console.error("Logo upload error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el logo.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingLogo(false)
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleRemoveLogo = () => {
    removeLogo()
    toast({
      title: "Logo eliminado",
      description: "El logo de la empresa ha sido eliminado.",
    })
  }

  const getLogoTypeLabel = (type: string | null) => {
    switch (type) {
      case "jpg":
        return "JPG"
      case "png":
        return "PNG"
      case "svg":
        return "SVG"
      default:
        return "Imagen"
    }
  }

  // Agregar función para manejar el cambio de color personalizado
  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
  }

  // Agregar función para aplicar el color personalizado
  const applyCustomColor = () => {
    console.log("Applying custom color:", customColor)
    updateSettings({
      custom_color: customColor,
      color_scheme: "custom",
    })
    setShowColorPicker(false)
    toast({
      title: "Color aplicado",
      description: "El color personalizado ha sido aplicado.",
    })
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia y configura integraciones</p>
        </div>

        {/* Debug component - remove in production */}
        <DebugTheme />

        <div className="space-y-8">
          {/* Project Settings */}
          <Card data-card="true">
            <CardHeader>
              <CardTitle>Configuración del Proyecto</CardTitle>
              <CardDescription>Personaliza la información básica de tu proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div>
                <Label>Nombre del Proyecto</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Este nombre aparecerá en el sidebar y título de la página
                </p>
                <div className="flex items-center space-x-2">
                  {isEditingProjectName ? (
                    <>
                      <Input
                        value={tempProjectName}
                        onChange={(e) => setTempProjectName(e.target.value)}
                        placeholder="Nombre del proyecto..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleProjectNameSave()
                          if (e.key === "Escape") handleProjectNameCancel()
                        }}
                        autoFocus
                      />
                      <Button size="icon" variant="outline" onClick={handleProjectNameSave}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={handleProjectNameCancel}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 p-2 border border-border rounded-md bg-muted/50">
                        <span className="text-foreground font-medium">{projectName}</span>
                      </div>
                      <Button size="icon" variant="outline" onClick={() => setIsEditingProjectName(true)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Company Logo */}
              <div>
                <Label>Logo de la Empresa</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sube el logo de tu empresa (JPG, PNG o SVG - máximo 5MB)
                </p>
                <div className="flex items-start space-x-4">
                  {companyLogo && (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-20 h-20 border border-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <ImageIcon
                          src={companyLogo || "/placeholder.svg"}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">{getLogoTypeLabel(logoType)}</div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                          disabled={isUploadingLogo}
                          key={Date.now()} // Forzar re-render del input
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={isUploadingLogo}
                            type="button"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploadingLogo ? "Subiendo..." : companyLogo ? "Cambiar Logo" : "Subir Logo"}
                            </span>
                          </Button>
                        </label>
                      </div>
                      {companyLogo && (
                        <Button
                          variant="ghost"
                          onClick={handleRemoveLogo}
                          className="text-red-600 hover:text-red-700"
                          disabled={isUploadingLogo}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>• Formatos soportados: JPG, PNG, SVG</p>
                      <p>• Tamaño máximo: 5MB</p>
                      <p>• Recomendado: 200x200px o mayor</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>Información básica de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-muted-foreground">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{user?.name || user?.email}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de APIs</CardTitle>
              <CardDescription>Configura las integraciones con servicios externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Endpoint */}
              <div>
                <Label htmlFor="api-endpoint">Endpoint de API para Procesamiento</Label>
                <Input
                  id="api-endpoint"
                  value={settings.api_endpoint}
                  onChange={(e) => updateSettings({ api_endpoint: e.target.value })}
                  placeholder="https://api.ejemplo.com/process"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">URL del endpoint POST para procesar archivos</p>
              </div>

              <Separator />

              {/* API Keys */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">API Keys</h4>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingApiKey(true)} className="text-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar API Key
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.entries(settings.api_keys).map(([keyName, keyValue]) => (
                    <div key={keyName} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium capitalize">{keyName.replace(/_/g, " ")}</Label>
                        <div className="relative mt-1">
                          <Input
                            type={showApiKeys[keyName] ? "text" : "password"}
                            value={keyValue}
                            onChange={(e) => updateApiKey(keyName, e.target.value)}
                            placeholder={`Ingresa tu ${keyName} API key...`}
                            className="pr-20"
                          />
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleApiKeyVisibility(keyName)}
                            >
                              {showApiKeys[keyName] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => removeApiKey(keyName)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add new API key form */}
                  {isAddingApiKey && (
                    <div className="p-4 border border-border rounded-lg bg-muted/50">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="new-api-name">Nombre de la API</Label>
                          <Input
                            id="new-api-name"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            placeholder="Ej: Claude, Gemini, etc."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-api-value">API Key</Label>
                          <Input
                            id="new-api-value"
                            type="password"
                            value={newApiKeyValue}
                            onChange={(e) => setNewApiKeyValue(e.target.value)}
                            placeholder="Ingresa la API key..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={addNewApiKey}
                            className="text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Agregar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingApiKey(false)
                              setNewApiKeyName("")
                              setNewApiKeyValue("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Oscuro</Label>
                  <p className="text-sm text-muted-foreground">Activa el tema oscuro de la aplicación</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>

              <Separator />

              {/* Font Family */}
              <div>
                <Label>Tipografía</Label>
                <p className="text-sm text-muted-foreground mb-3">Selecciona la fuente principal de la aplicación</p>
                <Select value={settings.font_family} onValueChange={(value) => updateSettings({ font_family: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Style Mode */}
              <div>
                <Label>Estilo Visual</Label>
                <p className="text-sm text-muted-foreground mb-3">Selecciona el estilo visual de la aplicación</p>
                <Select
                  value={settings.style_mode}
                  onValueChange={(value: any) => updateSettings({ style_mode: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Design</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="brutalist">Brutalist</SelectItem>
                    <SelectItem value="border">Border</SelectItem>
                    <SelectItem value="glass">Glassmorphism</SelectItem>
                    <SelectItem value="neumorphism">Neumorphism</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div
                    className="p-4 rounded-lg bg-background border border-border text-center text-sm"
                    data-style="flat"
                  >
                    Flat
                  </div>
                  <div
                    className="p-4 rounded-lg bg-gradient-to-br from-primary/80 to-primary/40 text-white text-center text-sm"
                    data-style="gradient"
                  >
                    Gradient
                  </div>
                  <div
                    className="p-4 rounded-lg bg-black text-white font-mono text-center text-sm"
                    data-style="brutalist"
                  >
                    Brutalist
                  </div>
                  <div
                    className="p-4 rounded-lg bg-background border-2 border-black text-center text-sm"
                    data-style="border"
                  >
                    Border
                  </div>
                  <div
                    className="p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20 text-center text-sm"
                    data-style="glass"
                  >
                    Glass
                  </div>
                  <div
                    className="p-4 rounded-lg bg-gray-100 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] text-center text-sm"
                    data-style="neumorphism"
                  >
                    Neumorphism
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div>
                <Label>Esquema de Colores</Label>
                <p className="text-sm text-muted-foreground mb-3">Selecciona el color principal de la aplicación</p>

                {/* Color Presets */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(colorSchemes).map(([name, color]) => (
                    <button
                      key={name}
                      className={`w-full h-10 rounded-md border transition-all ${
                        settings.color_scheme === name && !settings.custom_color
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSettings({ color_scheme: name, custom_color: "" })}
                      title={name.charAt(0).toUpperCase() + name.slice(1)}
                    />
                  ))}
                </div>

                {/* Custom Color */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Color Personalizado</Label>
                    <Button variant="outline" size="sm" onClick={() => setShowColorPicker(!showColorPicker)}>
                      {showColorPicker ? "Ocultar" : "Mostrar"} Selector
                    </Button>
                  </div>

                  {showColorPicker && (
                    <div className="p-4 border border-border rounded-lg bg-background">
                      <HexColorPicker
                        color={customColor || "#000000"}
                        onChange={handleCustomColorChange}
                        className="w-full mb-4"
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: customColor || "#000000" }}
                        />
                        <Input
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                        <Button onClick={applyCustomColor}>Aplicar</Button>
                      </div>
                    </div>
                  )}

                  {settings.custom_color && !showColorPicker && (
                    <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                      <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: settings.custom_color }} />
                      <span className="text-sm">{settings.custom_color}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => updateSettings({ custom_color: "", color_scheme: "black" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              className="auto-contrast-text"
              style={{
                backgroundColor: primaryColor,
                color: optimalTextColor,
              }}
              disabled={isSaving}
              data-button="true"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
