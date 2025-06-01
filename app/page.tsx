"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  LayoutTemplateIcon as Template,
  Settings,
  Users,
  BarChart3,
  Shield,
  Plus,
  LogIn,
  Crown,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, userRole, isAdmin, isSuperAdmin, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con estado de autenticación */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Bienvenido a Invitu
              {isSuperAdmin && (
                <Badge className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  SuperAdmin
                </Badge>
              )}
            </h1>
            <p className="text-xl text-muted-foreground">
              {user ? (
                <>
                  Hola, <span className="font-semibold">{user.email}</span>
                  <Badge variant="outline" className="ml-2">
                    {userRole}
                  </Badge>
                </>
              ) : (
                "Tu plataforma de gestión de documentos"
              )}
            </p>
          </div>

          {!user && (
            <Button onClick={signInWithGoogle} size="lg" className="gap-2">
              <LogIn className="w-4 h-4" />
              Iniciar Sesión con Google
            </Button>
          )}
        </div>
      </div>

      {/* Widgets principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Widget: Crear Documento */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Crear Documento
            </CardTitle>
            <CardDescription>Crea un nuevo documento personalizado</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents/create">
              <Button className="w-full">Nuevo Documento</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Widget: Mis Documentos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Mis Documentos
            </CardTitle>
            <CardDescription>Gestiona tus documentos existentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents">
              <Button variant="outline" className="w-full">
                Ver Documentos
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Widget: Plantillas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Template className="w-5 h-5 text-purple-600" />
              Plantillas
            </CardTitle>
            <CardDescription>Usa plantillas predefinidas</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/templates">
              <Button variant="outline" className="w-full">
                Ver Plantillas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Widget: Configuración */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Configuración
            </CardTitle>
            <CardDescription>Personaliza tu experiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full">
                Configurar
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Widget: Estadísticas (solo para usuarios autenticados) */}
        {user && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Estadísticas
              </CardTitle>
              <CardDescription>Analiza tu actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Widget: Gestión de Usuarios (solo SuperAdmin) */}
        {isSuperAdmin && (
          <Card className="hover:shadow-lg transition-shadow border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Gestión de Usuarios
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">SA</Badge>
              </CardTitle>
              <CardDescription>Administra usuarios y roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/users">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Gestionar Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Widget: Configuración Avanzada (solo SuperAdmin) */}
        {isSuperAdmin && (
          <Card className="hover:shadow-lg transition-shadow border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Config. Avanzada
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">SA</Badge>
              </CardTitle>
              <CardDescription>Configuración del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Información adicional para usuarios no autenticados */}
      {!user && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center">¿Por qué usar Invitu?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Gestión Fácil</h3>
                <p className="text-sm text-muted-foreground">Organiza tus documentos de manera intuitiva</p>
              </div>
              <div>
                <Template className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Plantillas</h3>
                <p className="text-sm text-muted-foreground">Usa plantillas predefinidas para ahorrar tiempo</p>
              </div>
              <div>
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Seguro</h3>
                <p className="text-sm text-muted-foreground">Tus datos están protegidos y seguros</p>
              </div>
            </div>
            <Button onClick={signInWithGoogle} size="lg" className="gap-2">
              <LogIn className="w-4 h-4" />
              Comenzar Ahora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">
              {JSON.stringify(
                {
                  user: user?.email || "No user",
                  userRole,
                  isAdmin,
                  isSuperAdmin,
                  loading,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
