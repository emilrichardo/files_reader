import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
  description: "Administra usuarios y asigna roles en el sistema",
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
