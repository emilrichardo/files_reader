"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"

export default function DebugTheme() {
  const { projectName, companyLogo, logoType, updateProjectName } = useTheme()

  const testProjectName = () => {
    updateProjectName("Proyecto de Prueba")
    console.log("Nombre actualizado a: Proyecto de Prueba")
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 m-4">
      <h3 className="font-bold mb-2">Debug Theme Context</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Nombre del proyecto:</strong> {projectName}
        </p>
        <p>
          <strong>Logo existe:</strong> {companyLogo ? "Sí" : "No"}
        </p>
        <p>
          <strong>Tipo de logo:</strong> {logoType || "N/A"}
        </p>
        <Button onClick={testProjectName} size="sm">
          Probar cambio de nombre
        </Button>
      </div>
    </div>
  )
}
