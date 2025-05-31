"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, LogIn } from "lucide-react"
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{user ? `Hola, ${user.email}` : "Bienvenido a Invitu"}</h1>
        <p className="text-gray-600">Extrae datos de documentos con IA</p>
      </div>

      <div className="flex gap-4 mb-8">
        {!user && (
          <Button onClick={handleSignIn} disabled={isSigningIn} variant="outline">
            <LogIn className="w-4 h-4 mr-2" />
            {isSigningIn ? "Conectando..." : "Iniciar Sesión"}
          </Button>
        )}
        <Button onClick={() => router.push("/documents/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Documento
        </Button>
      </div>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Tus Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div>Tienes {documents.length} documentos</div>
            ) : (
              <div>No tienes documentos aún. ¡Crea tu primero!</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Comienza ahora</CardTitle>
            <CardDescription>Crea documentos y extrae datos automáticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/documents/create")} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primer documento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
