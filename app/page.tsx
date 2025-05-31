"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileText, Clock, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Document } from "@/lib/types"

export default function HomePage() {
  const { user } = useAuth()
  const { documents } = useApp()
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga y obtener documentos recientes
    setTimeout(() => {
      const recent = documents
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 3)
      setRecentDocuments(recent)
      setLoading(false)
    }, 500)
  }, [documents])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Bienvenido a DocManager</CardTitle>
            <CardDescription>
              Inicia sesión para comenzar a gestionar tus documentos y extraer datos valiosos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>✨ Extrae datos de PDFs, imágenes y documentos</p>
                <p>📊 Crea estructuras de datos personalizadas</p>
                <p>🔄 Plantillas reutilizables</p>
                <p>📤 Exporta a múltiples formatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo, {user.name}</h1>
          <p className="text-gray-600">Gestiona tus documentos y extrae información valiosa de tus datos.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-dashed border-black bg-gradient-to-br from-black/5 to-gray-800/5 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/documents/create">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Crear Nuevo Documento</h3>
                <p className="text-gray-600 text-sm">Inicia un nuevo proyecto y define tu estructura de datos</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{documents.length} Documentos</h3>
              <p className="text-gray-600 text-sm">Total de documentos en tu espacio de trabajo</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actividad Reciente</h3>
              <p className="text-gray-600 text-sm">
                {documents.length > 0 ? "Última actualización hoy" : "Sin actividad reciente"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Documentos Recientes</CardTitle>
              <CardDescription>Tus documentos editados recientemente</CardDescription>
            </div>
            <Link href="/documents">
              <Button variant="outline" size="sm">
                Ver Todos los Documentos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        <p className="text-xs text-gray-500">{doc.rows.length} entradas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(doc.updated_at).toLocaleDateString("es-ES")}</p>
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="ghost" size="sm">
                          Abrir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay documentos</h3>
                <p className="text-gray-600 mb-4">Crea tu primer documento para comenzar</p>
                <Link href="/documents/create">
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Documento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
