"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, LogIn, FileText, Calendar, TrendingUp, Users, Settings, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"

export default function HomePage() {
  const router = useRouter()
  const { user, signInWithGoogle, loading, isSuperAdmin } = useAuth()
  const { documents } = useApp()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Calcular el número real de entradas (filas) en todos los documentos
  const totalEntries = documents.reduce((total, doc) => total + (doc.rows ? doc.rows.length : 0), 0)

  // Widgets principales disponibles para todos
  const mainWidgets = [
    {
      title: "Crear Documento",
      description: "Define campos y estructura para extraer datos",
      icon: Plus,
      action: () => router.push("/documents/create"),
      buttonText: "Crear Documento",
      color: "bg-blue-500",
    },
    {
      title: "Ver Documentos",
      description: "Explora y gestiona tus documentos existentes",
      icon: FileText,
      action: () => router.push("/documents"),
      buttonText: "Ver Documentos",
      color: "bg-green-500",
      requiresAuth: true,
    },
    {
      title: "Plantillas",
      description: "Usa plantillas predefinidas para acelerar tu trabajo",
      icon: Layout,
      action: () => router.push("/templates"),
      buttonText: "Ver Plantillas",
      color: "bg-purple-500",
      requiresAuth: true,
    },
  ]

  // Widgets adicionales para SuperAdmin
  const adminWidgets = [
    {
      title: "Gestión de Usuarios",
      description: "Administra usuarios y asigna roles",
      icon: Users,
      action: () => router.push("/users"),
      buttonText: "Gestionar Usuarios",
      color: "bg-red-500",
    },
    {
      title: "Configuración Avanzada",
      description: "Configuración del sistema y personalización",
      icon: Settings,
      action: () => router.push("/settings"),
      buttonText: "Configurar",
      color: "bg-gray-500",
    },
  ]

  // Combinar widgets según permisos
  const availableWidgets = [
    ...mainWidgets.filter((widget) => !widget.requiresAuth || user),
    ...(isSuperAdmin ? adminWidgets : []),
  ]

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {user ? `Hola, ${user.name || user.email}` : "Bienvenido a Invitu"}
            {isSuperAdmin && (
              <span className="ml-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                SuperAdmin
              </span>
            )}
          </h1>
          <p className="text-gray-600">Extrae datos de documentos con IA</p>
        </div>

        {/* Quick Actions - Widgets principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableWidgets.map((widget, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${widget.color} text-white`}>
                    <widget.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{widget.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{widget.description}</p>
                    <Button onClick={widget.action} className="w-full">
                      {widget.buttonText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auth Card para usuarios no registrados */}
        {!user && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold mb-2">Accede a todas las funciones</h3>
                  <p className="text-sm text-gray-600">Inicia sesión para gestionar documentos, plantillas y más</p>
                </div>
                <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full sm:w-auto">
                  <LogIn className="w-4 h-4 mr-2" />
                  {isSigningIn ? "Conectando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards - Solo para usuarios autenticados */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">documentos creados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEntries}</div>
                <p className="text-xs text-muted-foreground">datos extraídos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actividad</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground">de precisión</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
              <CardDescription>Tu actividad reciente en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tienes {documents.length} documentos creados con {totalEntries} entradas de datos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => router.push("/documents")} variant="outline" className="w-full sm:w-auto">
                      Ver Todos los Documentos
                    </Button>
                    <Button onClick={() => router.push("/documents/create")} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Nuevo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                  <p className="text-gray-600 mb-4">¡Crea tu primer documento para comenzar!</p>
                  <Button onClick={() => router.push("/documents/create")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Comienza ahora</CardTitle>
              <CardDescription>Crea documentos y extrae datos automáticamente</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Invitu te permite extraer datos de documentos de forma automática usando inteligencia artificial.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => router.push("/documents/create")} size="lg" className="w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear mi primer documento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
