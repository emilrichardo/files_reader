"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { settings, primaryColor } = useTheme()
  const { documents, templates } = useApp()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm">
        Debug
      </Button>

      {isOpen && (
        <Card className="absolute bottom-12 right-0 w-80 max-h-96 overflow-auto">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <strong>User:</strong> {user?.email || "Not logged in"}
            </div>
            <div>
              <strong>User ID:</strong> {user?.id || "N/A"}
            </div>
            <div>
              <strong>Primary Color:</strong>
              <span className="inline-block w-4 h-4 ml-2 border" style={{ backgroundColor: primaryColor }} />
              {primaryColor}
            </div>
            <div>
              <strong>Theme:</strong> {settings.theme}
            </div>
            <div>
              <strong>Project Name:</strong> {settings.project_name}
            </div>
            <div>
              <strong>Documents:</strong> {documents.length}
            </div>
            <div>
              <strong>Templates:</strong> {templates.length}
            </div>
            <div>
              <strong>Style Mode:</strong> {settings.style_mode}
            </div>
            <div>
              <strong>Color Scheme:</strong> {settings.color_scheme}
            </div>
            {settings.custom_color && (
              <div>
                <strong>Custom Color:</strong> {settings.custom_color}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
