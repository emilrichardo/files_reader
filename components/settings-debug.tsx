"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { getGlobalSettings, getSuperAdminSettings, getUserSettings } from "@/lib/database"
import { RefreshCw, Database, User, Crown } from "lucide-react"

export function SettingsDebug() {
  const { settings, forceReload, isLoadingSettings } = useTheme()
  const { user, isSuperAdmin } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadDebugInfo = async () => {
    setIsLoading(true)
    try {
      const [globalSettings, superAdminSettings, userSettings] = await Promise.all([
        getGlobalSettings(),
        getSuperAdminSettings(),
        user ? getUserSettings(user.id) : Promise.resolve({ data: null, error: null }),
      ])

      setDebugInfo({
        global: globalSettings,
        superAdmin: superAdminSettings,
        user: userSettings,
        currentSettings: settings,
        authState: {
          user: user?.email,
          isSuperAdmin,
          userId: user?.id,
        },
      })
    } catch (error) {
      console.error("Error loading debug info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDebugInfo()
  }, [user, settings])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Debug de Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={forceReload} disabled={isLoadingSettings} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSettings ? "animate-spin" : ""}`} />
            Recargar Configuración
          </Button>
          <Button onClick={loadDebugInfo} disabled={isLoading} size="sm" variant="outline">
            <Database className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar Debug
          </Button>
        </div>

        {debugInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Estado de Autenticación
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>
                  <strong>Usuario:</strong> {debugInfo.authState.user || "No autenticado"}
                </p>
                <p>
                  <strong>Es SuperAdmin:</strong> {debugInfo.authState.isSuperAdmin ? "Sí" : "No"}
                </p>
                <p>
                  <strong>User ID:</strong> {debugInfo.authState.userId || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Configuración Actual
              </h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>
                  <strong>Nombre:</strong> {settings.project_name}
                </p>
                <p>
                  <strong>Color:</strong> {settings.custom_color || settings.color_scheme}
                </p>
                <p>
                  <strong>Fuente:</strong> {settings.font_family}
                </p>
                <p>
                  <strong>Logo:</strong> {settings.company_logo ? "Sí" : "No"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Configuración Global</h4>
              <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                {debugInfo.global.data ? (
                  <pre>{JSON.stringify(debugInfo.global.data, null, 2)}</pre>
                ) : (
                  <p className="text-red-600">No encontrada</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Configuración SuperAdmin</h4>
              <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                {debugInfo.superAdmin.data ? (
                  <pre>{JSON.stringify(debugInfo.superAdmin.data, null, 2)}</pre>
                ) : (
                  <p className="text-red-600">No encontrada</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
