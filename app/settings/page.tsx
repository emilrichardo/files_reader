"use client"

import { useState } from "react"
import { Save, X, Edit, Check } from "lucide-react"
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
    projectName,
    updateProjectName,
    getOptimalTextColor,
  } = useTheme()

  const optimalTextColor = getOptimalTextColor(primaryColor)

  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [tempProjectName, setTempProjectName] = useState(projectName)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleProjectNameSave = () => {
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

  const saveSettings = async () => {
    if (isSaving || isSaved) return

    try {
      setIsSaving(true)

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Configuración guardada",
        description: "Tus configuraciones han sido guardadas exitosamente.",
      })

      setIsSaved(true)

      // Resetear estado después de un tiempo
      setTimeout(() => {
        setIsSaved(false)
      }, 3000)
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

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia y configura integraciones</p>
        </div>

        <div className="space-y-6">
          {/* Project Settings */}
          <Card>
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
                  <span className="text-xl font-medium text-muted-foreground">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{user?.name || user?.email || "Usuario"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || "No autenticado"}</p>
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
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Color Scheme */}
              <div>
                <Label>Esquema de Colores</Label>
                <p className="text-sm text-muted-foreground mb-3">Selecciona el color principal de la aplicación</p>

                {/* Color Presets */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { name: "Negro", color: "#000000" },
                    { name: "Azul", color: "#3b82f6" },
                    { name: "Verde", color: "#10b981" },
                    { name: "Púrpura", color: "#8b5cf6" },
                    { name: "Rojo", color: "#ef4444" },
                  ].map((scheme) => (
                    <button
                      key={scheme.name}
                      className={`w-full h-10 rounded-md border transition-all ${
                        primaryColor === scheme.color ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: scheme.color }}
                      onClick={() => updateSettings({ color_scheme: scheme.name.toLowerCase(), custom_color: "" })}
                      title={scheme.name}
                      aria-label={`Seleccionar color ${scheme.name}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              className="min-w-[200px]"
              style={{
                backgroundColor: primaryColor,
                color: optimalTextColor,
              }}
              disabled={isSaving || isSaved}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : isSaved ? "Guardado" : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
