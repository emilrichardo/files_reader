"use client"
import { useTheme } from "@/contexts/theme-context"

interface GlobalLoaderProps {
  isLoading: boolean
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  const { primaryColor, isSettingsReady } = useTheme()

  if (!isLoading || isSettingsReady) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner principal */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full border-4 border-gray-200 animate-spin"
            style={{
              borderTopColor: primaryColor || "#000000",
            }}
          />
          {/* Spinner interno más sutil */}
          <div
            className="absolute inset-2 w-8 h-8 rounded-full border-2 border-gray-100 animate-spin"
            style={{
              borderTopColor: primaryColor ? `${primaryColor}40` : "#00000040",
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          />
        </div>

        {/* Texto de carga */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Cargando configuración...</p>
          <p className="text-xs text-gray-500 mt-1">Aplicando tema y configuraciones</p>
        </div>

        {/* Barra de progreso sutil */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              backgroundColor: primaryColor || "#000000",
              animation: "loading-bar 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            opacity: 1;
          }
          50% {
            width: 100%;
            opacity: 0.8;
          }
          100% {
            width: 100%;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
