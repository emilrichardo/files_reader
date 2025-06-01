"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Palette, Type, ImageIcon, SettingsIcon, Shield } from "lucide-react"
import { SettingsDebug } from "@/components/settings-debug"

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

  const { user, isSuperAdmin } = useAuth()
  const { toast } = useToast()

  const [isUploading, setIsUploading] = useState(false)
  const [tempProjectName, setTempProjectName] = useState(projectName)

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden cambiar el logo",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      await updateLogo(file)
      toast({
        title: "Éxito",
        description: "Logo actualizado correctamente",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el logo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleProjectNameSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden cambiar el nombre del proyecto",
        variant: "destructive",
      })
      return
    }

    try {
      await updateProjectName(tempProjectName)
      toast({
        title: "Éxito",
        description: "Nombre del proyecto actualizado",
      })
    } catch (error) {
      console.error("Error updating project name:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el nombre del proyecto",
        variant: "destructive",
      })
    }
  }

  const handleColorSchemeChange = async (colorScheme: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden cambiar los colores",
        variant: "destructive",
      })
      return
    }

    try {
      await updateSettings({
        color_scheme: colorScheme,
        custom_color: "", // Reset custom color when selecting a preset
      })
      toast({
        title: "Éxito",
        description: "Esquema de color actualizado",
      })
    } catch (error) {
      console.error("Error updating color scheme:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el esquema de color",
        variant: "destructive",
      })
    }
  }

  const handleCustomColorChange = async (color: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden cambiar los colores",
        variant: "destructive",
      })
      return
    }

    try {
      await updateSettings({
        custom_color: color,
        color_scheme: "custom",
      })
      toast({
        title: "Éxito",
        description: "Color personalizado actualizado",
      })
    } catch (error) {
      console.error("Error updating custom color:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el color personalizado",
        variant: "destructive",
      })
    }
  }

  const handleFontFamilyChange = async (fontFamily: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden cambiar la fuente",
        variant: "destructive",
      })
      return
    }

    try {
      await updateSettings({ font_family: fontFamily })
      toast({
        title: "Éxito",
        description: "Fuente actualizada",
      })
    } catch (error) {
      console.error("Error updating font family:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la fuente",
        variant: "destructive",
      })
    }
  }

  const handleRemoveLogo = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Error",
        description: "Solo los superadministradores pueden remover el logo",
        variant: "destructive",
      })
      return
    }

    try {
      await removeLogo()
      toast({
        title: "Éxito",
        description: "Logo removido correctamente",
      })
    } catch (error) {
      console.error("Error removing logo:", error)
      toast({
        title: "Error",
        description: "Error al remover el logo",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-gray-600">Personaliza la apariencia y configuración de la aplicación</p>
          {!isSuperAdmin && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  Solo los SuperAdministradores pueden modificar la configuración global.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Project Name */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Nombre del Proyecto
              </CardTitle>
              <CardDescription>Configura el nombre que aparecerá en toda la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  placeholder="Nombre del proyecto"
                  disabled={!isSuperAdmin}
                />
                <Button onClick={handleProjectNameSave} disabled={!isSuperAdmin}>
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo de la Empresa
              </CardTitle>
              <CardDescription>Sube un logo que aparecerá en toda la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyLogo ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={companyLogo || "/placeholder.svg"}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Logo actual ({logoType?.toUpperCase()})</p>
                    <Button variant="outline" size="sm" onClick={handleRemoveLogo} disabled={!isSuperAdmin}>
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">No hay logo configurado</p>
                  <Label htmlFor="logo-upload">
                    <Button variant="outline" disabled={isUploading || !isSuperAdmin} asChild>
                      <span>{isUploading ? "Subiendo..." : "Subir Logo"}</span>
                    </Button>
                  </Label>
                </div>
              )}

              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={!isSuperAdmin}
              />

              {companyLogo && (
                <div>
                  <Label htmlFor="logo-replace">
                    <Button variant="outline" disabled={isUploading || !isSuperAdmin} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? "Subiendo..." : "Cambiar Logo"}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="logo-replace"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={!isSuperAdmin}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Esquema de Colores
              </CardTitle>
              <CardDescription>Personaliza los colores de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Esquemas Predefinidos</Label>
                <Select value={settings.color_scheme} onValueChange={handleColorSchemeChange} disabled={!isSuperAdmin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(colorSchemes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: value }} />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color Personalizado</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.custom_color || primaryColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-16 h-10 p-1"
                    disabled={!isSuperAdmin}
                  />
                  <Input
                    value={settings.custom_color || primaryColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#000000"
                    disabled={!isSuperAdmin}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ backgroundColor: primaryColor }}>
                <p className="text-white font-medium">Vista previa del color principal</p>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Tipografía
              </CardTitle>
              <CardDescription>Selecciona la fuente para toda la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={settings.font_family} onValueChange={handleFontFamilyChange} disabled={!isSuperAdmin}>
                <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Theme Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Cambia entre tema claro y oscuro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch checked={isDark} onCheckedChange={toggleTheme} disabled={!isSuperAdmin} />
                <Label>{isDark ? "Tema Oscuro" : "Tema Claro"}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Debug Panel */}
          <SettingsDebug />
        </div>
      </div>
    </div>
  )
}
