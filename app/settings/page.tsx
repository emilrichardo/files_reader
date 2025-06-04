"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Save, Palette, Shield, Key, Upload, X, Lock } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

export default function SettingsPage() {
  const { user, loading, userRole } = useAuth()
  const { settings, updateSettings, fontFamilies, colorSchemes, isAdmin } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Determinar si es superadmin
  const isSuperAdmin = userRole === "superadmin"

  // Estados locales para el formulario
  const [projectName, setProjectName] = useState("")
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    google_vision: "",
    supabase: "",
  })
  const [theme, setTheme] = useState("light")
  const [colorScheme, setColorScheme] = useState("blue")
  const [customColor, setCustomColor] = useState("")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [styleMode, setStyleMode] = useState("flat")
  const [companyLogo, setCompanyLogo] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Debug logs
  useEffect(() => {
    console.log("🔍 [SETTINGS] User:", user?.email)
    console.log("🔍 [SETTINGS] User role:", userRole)
    console.log("🔍 [SETTINGS] Is superadmin:", isSuperAdmin)
    console.log("🔍 [SETTINGS] Is admin (from theme):", isAdmin)
  }, [user, userRole, isSuperAdmin, isAdmin])

  // Cargar configuraciones
  useEffect(() => {
    if (settings) {
      setProjectName(settings.project_name || "")
      setApiEndpoint(settings.api_endpoint || "")
      setApiKeys(settings.api_keys || { openai: "", google_vision: "", supabase: "" })
      setTheme(settings.theme || "light")
      setColorScheme(settings.color_scheme || "blue")
      setCustomColor(settings.custom_color || "")
      setFontFamily(settings.font_family || "Inter")
      setStyleMode(settings.style_mode || "flat")
      setCompanyLogo(settings.company_logo || "")
    }
  }, [settings])

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo los superadministradores pueden modificar la configuración.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("🔄 [SETTINGS] Saving settings...")

      const settingsToSave = {
        project_name: projectName,
        api_endpoint: apiEndpoint,
        api_keys: apiKeys,
        theme,
        color_scheme: colorScheme,
        custom_color: customColor,
        font_family: fontFamily,
        style_mode: styleMode,
        company_logo: companyLogo,
      }

      console.log("📝 [SETTINGS] Settings to save:", settingsToSave)

      await updateSettings(settingsToSave)

      console.log("✅ [SETTINGS] Settings saved successfully")

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado exitosamente.",
      })

      // Recargar la página después de un breve delay para asegurar que los cambios se reflejen
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("❌ [SETTINGS] Error saving settings:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSuperAdmin) return

    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyLogo(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    if (!isSuperAdmin) return

    setCompanyLogo("")
    setLogoFile(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    )
  }

  // Si no es superadmin, mostrar mensaje de acceso restringido
  if (!isSuperAdmin) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración
              </CardTitle>
              <CardDescription>Configuración del sistema</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Acceso restringido</h3>
              <p className="text-gray-600 mb-4">
                Solo los superadministradores pueden modificar la configuración del sistema.
              </p>
              <p className="text-sm text-gray-500">Contacta con un administrador si necesitas realizar cambios.</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>Usuario: {user.email}</p>
                <p>Rol: {userRole || "user"}</p>
                <p>Es superadmin: {isSuperAdmin ? "Sí" : "No"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Resto del código original para superadmin...
  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">
            Personaliza tu experiencia y configuraciones del proyecto
            {!isSuperAdmin && (
              <span className="block text-sm text-amber-600 mt-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Algunas configuraciones solo pueden ser modificadas por administradores
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuración del Proyecto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configuración del Proyecto
                  {!isSuperAdmin && <Lock className="w-4 h-4 text-amber-500" />}
                </CardTitle>
                <CardDescription>
                  Personaliza la apariencia y configuración de tu proyecto
                  {!isSuperAdmin && " (Solo administradores)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-name">Nombre del Proyecto</Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Mi Proyecto"
                      className="mt-1"
                      disabled={!isSuperAdmin}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="style-mode">Modo de Estilo</Label>
                    <Select value={styleMode} onValueChange={setStyleMode} disabled={!isSuperAdmin}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Plano</SelectItem>
                        <SelectItem value="rounded">Redondeado</SelectItem>
                        <SelectItem value="sharp">Angular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color-scheme">Esquema de Color</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme} disabled={!isSuperAdmin}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(colorSchemes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: value }} />
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="custom-color">Color Personalizado</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="custom-color"
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                        disabled={!isSuperAdmin}
                      />
                      <Input
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                        disabled={!isSuperAdmin}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="font-family">Tipografía</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily} disabled={!isSuperAdmin}>
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="company-logo">Logo de la Empresa</Label>
                  <div className="mt-2">
                    {companyLogo ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={companyLogo || "/placeholder.svg"}
                          alt="Logo"
                          className="h-16 w-auto border rounded"
                        />
                        <Button variant="outline" size="sm" onClick={removeLogo} disabled={!isSuperAdmin}>
                          <X className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Sube tu logo</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                          disabled={!isSuperAdmin}
                        />
                        <Button variant="outline" size="sm" asChild disabled={!isSuperAdmin}>
                          <label
                            htmlFor="logo-upload"
                            className={isSuperAdmin ? "cursor-pointer" : "cursor-not-allowed"}
                          >
                            Seleccionar archivo
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de APIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Configuración de APIs
                </CardTitle>
                <CardDescription>Configura las claves de API para servicios externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    placeholder="sk-..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="google-vision-key">Google Vision API Key</Label>
                  <Input
                    id="google-vision-key"
                    type="password"
                    value={apiKeys.google_vision}
                    onChange={(e) => setApiKeys({ ...apiKeys, google_vision: e.target.value })}
                    placeholder="AIza..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-key">Supabase API Key</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    value={apiKeys.supabase}
                    onChange={(e) => setApiKeys({ ...apiKeys, supabase: e.target.value })}
                    placeholder="eyJ..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Endpoint para carga de archivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  API Endpoint para carga de archivos
                </CardTitle>
                <CardDescription>
                  Endpoint donde se enviará un POST cuando se suban archivos a los documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="api-endpoint">URL del Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    type="url"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="https://api.ejemplo.com/upload"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Se enviará un POST con el contenido del archivo cuando se cargue una nueva fila en un documento
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Vista previa */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>Así se verá tu proyecto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    {companyLogo ? (
                      <img src={companyLogo || "/placeholder.svg"} alt="Logo" className="w-8 h-8 rounded" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          backgroundColor: customColor || colorSchemes[colorScheme as keyof typeof colorSchemes],
                        }}
                      >
                        {projectName ? projectName[0].toUpperCase() : "P"}
                      </div>
                    )}
                    <span
                      className="font-semibold"
                      style={{
                        color: customColor || colorSchemes[colorScheme as keyof typeof colorSchemes],
                        fontFamily: fontFamily,
                      }}
                    >
                      {projectName || "Mi Proyecto"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: fontFamily }}>
                    Tema: {theme === "light" ? "Claro" : "Oscuro"}
                  </div>
                  <div className="text-sm text-gray-600" style={{ fontFamily: fontFamily }}>
                    Estilo: {styleMode}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Tu Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Registrado</Label>
                    <p className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rol</Label>
                    <p className="text-sm text-blue-600">{userRole || "user"}</p>
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <Label className="text-sm font-medium">Permisos</Label>
                      <p className="text-sm text-green-600">Superadministrador</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botón de guardar con clase específica */}
            <Button onClick={handleSave} disabled={isLoading} className="w-full settings-save-button">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
