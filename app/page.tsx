"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Calendar, TrendingUp, ArrowRight } from "lucide-react"
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

  // Documentos recientes (últimos 3)
  const recentDocuments = documents.slice(0, 3)

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            Extrae datos de documentos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              con inteligencia artificial
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sube tus documentos PDF, imágenes o archivos de Office y extrae automáticamente la información estructurada
            que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg"
              onClick={() => router.push("/documents/create")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primer documento
            </Button>
            {documents.length > 0 && (
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg"
                onClick={() => router.push("/documents")}
              >
                Ver mis documentos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">documentos procesados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.reduce((acc, doc) => acc + doc.rows.length, 0)}</div>
              <p className="text-xs text-muted-foreground">datos extraídos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">de precisión promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Comienza a trabajar con tus documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start h-auto p-4 bg-black hover:bg-gray-800 text-white"
                onClick={() => router.push("/documents/create")}
              >
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Crear Nuevo Documento</div>
                    <div className="text-sm opacity-80">Define campos y estructura para extraer datos</div>
                  </div>
                </div>
              </Button>

              {documents.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => router.push("/documents")}
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Ver Todos los Documentos</div>
                      <div className="text-sm text-gray-500">Gestiona tus {documents.length} documentos</div>
                    </div>
                  </div>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => router.push("/templates")}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Gestionar Plantillas</div>
                    <div className="text-sm text-gray-500">Crea estructuras reutilizables</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Documents or Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>{documents.length > 0 ? "Documentos Recientes" : "Comenzar"}</CardTitle>
              <CardDescription>
                {documents.length > 0 ? "Tus documentos más recientes" : "Todo lo que necesitas para empezar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/documents/${doc.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.rows.length} entradas</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(doc.updated_at).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full mt-4" onClick={() => router.push("/documents")}>
                    Ver todos los documentos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">¡Bienvenido a Invitu!</h3>
                    <p className="text-gray-600 mb-4">
                      Crea tu primer documento para comenzar a extraer datos automáticamente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Sube archivos PDF, imágenes o documentos de Office
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Define los campos que quieres extraer
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Obtén datos estructurados automáticamente
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Por qué elegir Invitu?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Múltiples Formatos</h3>
              <p className="text-gray-600">Soporta PDF, JPG, PNG, DOC, DOCX y más formatos de documentos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Alta Precisión</h3>
              <p className="text-gray-600">Algoritmos de IA avanzados para extraer datos con máxima precisión</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Plantillas Reutilizables</h3>
              <p className="text-gray-600">Crea plantillas para procesar documentos similares de forma eficiente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
