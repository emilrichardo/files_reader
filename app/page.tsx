"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Layout, Settings, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"

export default function HomePage() {
  const router = useRouter()
  const { user, signInWithGoogle, loading: authLoading } = useAuth()
  const { documents, templates, loading: appLoading, isHydrated } = useApp()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
    } catch (error) {
      console.error("Error signing in:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  // No renderizar contenido hasta que esté hidratado
  if (!isHydrated || authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const recentDocuments = documents.slice(0, 3)
  const recentTemplates = templates.slice(0, 3)

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user ? `Bienvenido, ${user.email?.split("@")[0] || "Usuario"}` : "Bienvenido a Invitu"}
              </h1>
              <p className="text-gray-600">
                {user
                  ? "Gestiona tus documentos y extrae datos de forma inteligente"
                  : "Extrae datos de documentos de forma inteligente con IA"}
              </p>
            </div>
            <div className="flex gap-3">
              {!user && (
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  {isSigningIn ? "Conectando..." : "Iniciar Sesión"}
                </Button>
              )}
              <Button
                onClick={() => router.push("/documents/create")}
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear Documento
              </Button>
            </div>
          </div>

          {/* Auth Banner */}
          {!user && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">¿Quieres guardar tus documentos?</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Inicia sesión para guardar y sincronizar tus documentos en la nube
                  </p>
                </div>
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSigningIn ? "Conectando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/documents/create")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-black rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">Nuevo Documento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Crea un nuevo documento y define campos para extraer datos</CardDescription>
            </CardContent>
          </Card>

          {user && (
            <>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/documents")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Documentos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Ver y gestionar todos tus documentos
                    {documents.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {documents.length}
                      </Badge>
                    )}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/templates")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Layout className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Plantillas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Plantillas reutilizables para tus documentos
                    {templates.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {templates.length}
                      </Badge>
                    )}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/settings")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">Configuración</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Personaliza tu experiencia y configuraciones</CardDescription>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Content for authenticated users */}
        {user && (
          <>
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Documents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Documentos Recientes
                    </CardTitle>
                    {documents.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => router.push("/documents")}>
                        Ver todos
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recentDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {recentDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/documents/${doc.id}`)}
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-600">
                              {doc.rows?.length || 0} entradas • {new Date(doc.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">{doc.fields?.length || 0} campos</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No tienes documentos aún</p>
                      <Button onClick={() => router.push("/documents/create")} size="sm">
                        Crear tu primer documento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Templates */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5" />
                      Plantillas Recientes
                    </CardTitle>
                    {templates.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}>
                        Ver todas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTemplates.length > 0 ? (
                    <div className="space-y-3">
                      {recentTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/templates/${template.id}`)}
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600">
                              {template.description || "Sin descripción"} •{" "}
                              {new Date(template.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">{template.fields?.length || 0} campos</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No tienes plantillas aún</p>
                      <Button onClick={() => router.push("/documents/create")} size="sm">
                        Crear tu primera plantilla
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                    <div className="text-sm text-gray-600">Documentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
                    <div className="text-sm text-gray-600">Plantillas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.reduce((acc, doc) => acc + (doc.rows?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Entradas de Datos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.reduce((acc, doc) => acc + (doc.fields?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Campos Totales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Content for non-authenticated users */}
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Comienza a usar Invitu</CardTitle>
              <CardDescription>Crea documentos inteligentes y extrae datos automáticamente con IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡Empieza ahora!</h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primer documento y descubre cómo Invitu puede ayudarte a extraer datos de forma inteligente
                </p>
                <Button
                  onClick={() => router.push("/documents/create")}
                  size="lg"
                  className="bg-black hover:bg-gray-800"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear mi primer documento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
