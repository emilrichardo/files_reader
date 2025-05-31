"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, LogIn, FileText, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"

export default function HomePage() {
  const router = useRouter()
  const { user, signInWithGoogle, loading } = useAuth()
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

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {user ? `Hola, ${user.name || user.email}` : "Bienvenido a Invitu"}
          </h1>
          <p className="text-gray-600">Extrae datos de documentos con IA</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 mb-8">
          {!user && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold mb-2">Comienza ahora</h3>
                    <p className="text-sm text-gray-600">Inicia sesión para acceder a todas las funciones</p>
                  </div>
                  <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full sm:w-auto">
                    <LogIn className="w-4 h-4 mr-2" />
                    {isSigningIn ? "Conectando..." : "Iniciar Sesión"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold mb-2">Crear Nuevo Documento</h3>
                  <p className="text-sm text-gray-600">Define campos y estructura para extraer datos</p>
                </div>
                <Button onClick={() => router.push("/documents/create")} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
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
                <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">documentos nuevos</p>
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
              <CardTitle>Tus Documentos</CardTitle>
              <CardDescription>Gestiona y organiza todos tus documentos</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Tienes {documents.length} documentos creados.</p>
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
