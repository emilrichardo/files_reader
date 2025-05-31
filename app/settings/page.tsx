"use client"

import type React from "react"

import { useState } from "react"
import { Save, Upload, X, Plus, Eye, EyeOff } from "lucide-react"
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

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    settings,
    updateSettings,
    isDark,
    toggleTheme,
    primaryColor,
    companyLogo,
    projectName,
    updateProjectName,
    updateLogo,
    removeLogo,
    colorSchemes,
    fontFamilies,
    getOptimalTextColor,
  } = useTheme()

  const [apiEndpoint, setApiEndpoint] = useState(settings.api_endpoint || "")
  const [apiKeys, setApiKeys] = useState(settings.api_keys || {})
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [tempProjectName, setTempProjectName] = useState(projectName)
  const [isSaving, setIsSaving] = useState(false)

  const optimalTextColor = getOptimalTextColor(primaryColor)

  const handleAddApiKey = () => {
    if (newKeyName && newKeyValue) {
      setApiKeys({ ...apiKeys, [newKeyName]: newKeyValue })
      setNewKeyName("")
      setNewKeyValue("")
    }
  }

  const handleRemoveApiKey = (keyName: string) => {
    const updatedKeys = { ...apiKeys }
    delete updatedKeys[keyName]
    setApiKeys(updatedKeys)
  }

  const toggleShowApiKey = (keyName: string) => {
    setShowApiKeys({ ...showApiKeys, [keyName]: !showApiKeys[keyName] })
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        await updateLogo(file)
        toast({
          title: "Logo actualizado",
          description: "El logo de la empresa ha sido actualizado exitosamente.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al subir el logo.",
          variant: "destructive",
        })
      }
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await updateSettings({
        api_endpoint: apiEndpoint,
        api_keys: apiKeys,
      })

      if (tempProjectName !== projectName) {
        updateProjectName(tempProjectName)
      }

      toast({
        title: "Configuración guardada",
        description: "Todas las configuraciones han sido guardadas exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar las configuraciones.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Personaliza tu experiencia y configura integraciones</p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
              <CardDescription>Información básica de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">{user?.email?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.name || user?.email || "Usuario"}</h3>
                  <p className="text-sm text-gray-500">{user?.email || "No autenticado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Proyecto</CardTitle>
              <CardDescription>Personaliza la información básica de tu proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="project-name">Nombre del Proyecto</Label>
                <Input
                  id="project-name"
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  placeholder="Nombre del proyecto..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Este nombre aparecerá en el sidebar y título de la página</p>
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
                <Label htmlFor="api-endpoint">Endpoint de API</Label>
                <Input
                  id="api-endpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.ejemplo.com/v1/extract"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">URL del endpoint para procesamiento de archivos (POST)</p>
              </div>

              <Separator />

              {/* API Keys */}
              <div>
                <Label>API Keys</Label>
                <p className="text-sm text-gray-500 mb-4">Gestiona las claves de API para diferentes servicios</p>

                {/* Existing API Keys */}
                <div className="space-y-3 mb-4">
                  {Object.entries(apiKeys).map(([keyName, keyValue]) => (
                    <div key={keyName} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{keyName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {showApiKeys[keyName] ? keyValue : "•".repeat(20)}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toggleShowApiKey(keyName)} className="h-8 w-8">
                        {showApiKeys[keyName] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveApiKey(keyName)}
                        className="h-8 w-8 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add New API Key */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Agregar Nueva API Key</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Nombre (ej: openai)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <Input
                      placeholder="Valor de la API Key"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      type="password"
                    />
                    <Button onClick={handleAddApiKey} disabled={!newKeyName || !newKeyValue}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Predefined API Keys */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {["openai", "google_vision", "supabase"].map((service) => (
                    <Button
                      key={service}
                      variant="outline"
                      onClick={() => {
                        setNewKeyName(service)
                        setNewKeyValue("")
                      }}
                      disabled={apiKeys[service]}
                      className="justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {service.charAt(0).toUpperCase() + service.slice(1).replace("_", " ")}
                    </Button>
                  ))}
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
                  <p className="text-sm text-gray-500">Activa el tema oscuro de la aplicación</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>

              <Separator />

              {/* Color Scheme */}
              <div>
                <Label>Esquema de Colores</Label>
                <p className="text-sm text-gray-500 mb-4">Selecciona el color principal de la aplicación</p>
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(colorSchemes).map(([name, color]) => (
                    <button
                      key={name}
                      className={`w-full h-12 rounded-lg border-2 transition-all ${
                        primaryColor === color ? "border-gray-900 scale-105" : "border-gray-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateSettings({ color_scheme: name, custom_color: "" })}
                      title={name.charAt(0).toUpperCase() + name.slice(1)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font Family */}
              <div>
                <Label>Tipografía</Label>
                <p className="text-sm text-gray-500 mb-3">Selecciona la fuente principal de la aplicación</p>
                <Select value={settings.font_family} onValueChange={(value) => updateSettings({ font_family: value })}>
                  <SelectTrigger>
                    <SelectValue />
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

              <Separator />

              {/* Company Logo */}
              <div>
                <Label>Logo de la Empresa</Label>
                <p className="text-sm text-gray-500 mb-4">Sube un logo personalizado para tu empresa</p>
                <div className="flex items-center space-x-4">
                  {companyLogo ? (
                    <div className="flex items-center space-x-4">
                      <img
                        src={companyLogo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-16 h-16 object-contain border rounded-lg"
                      />
                      <div className="space-x-2">
                        <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Cambiar Logo
                        </Button>
                        <Button variant="outline" onClick={removeLogo} className="text-red-600">
                          <X className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo
                    </Button>
                  )}
                  <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Formatos soportados: JPG, PNG, SVG. Tamaño máximo: 5MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="min-w-[200px]"
              style={{
                backgroundColor: primaryColor,
                color: optimalTextColor,
              }}
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
