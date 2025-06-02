"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Upload, LayoutTemplateIcon as Template, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user } = useAuth()

  if (!user) {
    // Dashboard para usuarios no autenticados - invita a probar el producto
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Bienvenido a Invitu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Extrae datos de documentos automáticamente con IA. Crea tu primer proyecto y prueba todas las
            funcionalidades.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/documents/create">
                <Plus className="mr-2 h-4 w-4" />
                Crear Proyecto
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/templates">
                <Template className="mr-2 h-4 w-4" />
                Ver Plantillas
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Sube Documentos</CardTitle>
              <CardDescription>Arrastra PDFs, imágenes o documentos y extrae datos automáticamente</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Extracción con IA</CardTitle>
              <CardDescription>Nuestra IA identifica y extrae campos relevantes de tus documentos</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Organiza Datos</CardTitle>
              <CardDescription>Estructura y organiza la información extraída en proyectos</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                  1
                </div>
                <h3 className="font-semibold">Crea un Proyecto</h3>
                <p className="text-sm text-muted-foreground">Define los campos que quieres extraer de tus documentos</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                  2
                </div>
                <h3 className="font-semibold">Sube Archivos</h3>
                <p className="text-sm text-muted-foreground">
                  Arrastra tus documentos y deja que la IA extraiga los datos
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                  3
                </div>
                <h3 className="font-semibold">Guarda y Organiza</h3>
                <p className="text-sm text-muted-foreground">
                  Revisa, edita y guarda los datos extraídos en tu proyecto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard para usuarios autenticados
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/documents/create">
            <Plus className="mr-2 h-4 w-4" />
            Crear Proyecto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Procesados</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+23 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <Template className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 nuevas este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
