"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { UserSettings } from "@/lib/types"

const STORAGE_KEY = "docmanager_user_settings"

const defaultSettings: UserSettings = {
  id: "1",
  user_id: "demo-user",
  api_endpoint: "",
  api_keys: {
    openai: "",
    google_vision: "",
    supabase: "",
  },
  theme: "light",
  color_scheme: "black",
  company_logo: "",
  updated_at: new Date().toISOString(),
}

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
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newApiKeyValue, setNewApiKeyValue] = useState("")
  const [isAddingApiKey, setIsAddingApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar configuraciones del localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
        toast({
          title: "Configuraciones cargadas",
          description: "Se han cargado tus configuraciones guardadas.",
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }, [toast])

  // Aplicar tema cuando cambie
  useEffect(() => {
    // Aplicar tema oscuro/claro al documento
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Aplicar esquema de colores (esto requeriría actualizar las variables CSS)
    // Esta es una implementación simplificada
    const root = document.documentElement
    const scheme = colorSchemes.find((s) => s.value === settings.color_scheme)
    if (scheme) {
      root.style.setProperty("--primary", scheme.color)
    }
  }, [settings.theme, settings.color_scheme])

  // Guardar configuraciones en localStorage
  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const updatedSettings = {
        ...settings,
        updated_at: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings))
      setSettings(updatedSettings)

      // Simular una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Configuración guardada",
        description: "Tus configuraciones han sido guardadas exitosamente.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Error al guardar las configuraciones.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateApiKey = (keyName: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      api_keys: {
        ...prev.api_keys,
        [keyName]: value,
      },
    }))
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
    setSettings((prev) => ({
      ...prev,
      api_keys: newApiKeys,
    }))
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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateSetting("company_logo", result)
        toast({
          title: "Logo subido",
          description: "El logo de la empresa ha sido actualizado.",
        })
      }
      reader.readAsDataURL(file)
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
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.name || user?.email}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
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
                  onChange={(e) => updateSetting("api_endpoint", e.target.value)}
                  placeholder="https://api.ejemplo.com/process"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">URL del endpoint POST para procesar archivos</p>
              </div>

              <Separator />

              {/* API Keys */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">API Keys</h4>
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
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
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
                          <Button size="sm" onClick={addNewApiKey} className="bg-black hover:bg-gray-800 text-white">
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
                  <p className="text-sm text-gray-500">Activa el tema oscuro de la aplicación</p>
                </div>
                <Switch
                  checked={settings.theme === "dark"}
                  onCheckedChange={(checked) => updateSetting("theme", checked ? "dark" : "light")}
                />
              </div>

              <Separator />

              {/* Color Scheme */}
              <div>
                <Label>Esquema de Colores</Label>
                <p className="text-sm text-gray-500 mb-3">Selecciona el color principal de la aplicación</p>
                <Select value={settings.color_scheme} onValueChange={(value) => updateSetting("color_scheme", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme.value} value={scheme.value}>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.color }} />
                          <span>{scheme.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Company Logo */}
              <div>
                <Label>Logo de la Empresa</Label>
                <p className="text-sm text-gray-500 mb-3">Sube el logo de tu empresa</p>
                <div className="flex items-center space-x-4">
                  {settings.company_logo && (
                    <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={settings.company_logo || "/placeholder.svg"}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outline" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {settings.company_logo ? "Cambiar Logo" : "Subir Logo"}
                      </Button>
                    </label>
                    {settings.company_logo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSetting("company_logo", "")}
                        className="ml-2 text-red-600"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="bg-black hover:bg-gray-800 text-white" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
