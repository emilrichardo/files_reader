"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Save, Palette, User, Shield } from "lucide-react"
import AuthGuard from "@/components/auth-guard"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { theme, updateTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Estados locales para el formulario
  const [projectName, setProjectName] = useState("")
  const [primaryColor, setPrimaryColor] = useState("")
  const [secondaryColor, setSecondaryColor] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [description, setDescription] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("es")
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setShowContent(!loading && !!user)
  }, [loading, user])

  // Cargar configuraciones del tema
  useEffect(() => {
    if (theme) {
      setProjectName(theme.projectName || "")
      setPrimaryColor(theme.primaryColor || "#000000")
      setSecondaryColor(theme.secondaryColor || "#666666")
      setLogoUrl(theme.logoUrl || "")
      setDescription(theme.description || "")
    }
  }, [theme])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateTheme({
        projectName,
        primaryColor,
        secondaryColor,
        logoUrl,
        description,
      })

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado exitosamente.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Personaliza tu experiencia y configuraciones del proyecto</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración del Proyecto */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configuración del Proyecto
                </CardTitle>
                <CardDescription>Personaliza la apariencia y configuración de tu proyecto</CardDescription>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo-url">URL del Logo</Label>
                    <Input
                      id="logo-url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/logo.png"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu proyecto..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Color Primario</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Color Secundario</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#666666"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Configuración de Usuario
                </CardTitle>
                <CardDescription>Ajusta tus preferencias personales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Notificaciones</Label>
                    <p className="text-sm text-gray-500">Recibir notificaciones por email</p>
                  </div>
                  <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {logoUrl ? (
                      <img src={logoUrl || "/placeholder.svg"} alt="Logo" className="w-8 h-8 rounded" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {projectName ? projectName[0].toUpperCase() : "P"}
                      </div>
                    )}
                    <span className="font-semibold" style={{ color: primaryColor }}>
                      {projectName || "Mi Proyecto"}
                    </span>
                  </div>
                  {description && <p className="text-sm text-gray-600">{description}</p>}
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
                </div>
              </CardContent>
            </Card>

            {/* Botón de guardar */}
            <Button onClick={handleSave} disabled={isLoading} className="w-full bg-black hover:bg-gray-800 text-white">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
