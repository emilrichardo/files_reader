"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { updateUserRole } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Search, Users, Shield, Crown, Star, User } from "lucide-react"

interface UserWithRole {
  id: string
  email: string
  name?: string
  created_at: string
  role: "admin" | "user" | "premium" | "moderator" | "superadmin"
  assigned_at?: string
}

export default function UsersPage() {
  const router = useRouter()
  const { user, isSuperAdmin, loading } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuarios
  useEffect(() => {
    const load = async () => {
      if (isSuperAdmin) {
        try {
          setIsLoading(true)

          // Obtener todos los usuarios de auth.users
          const { data: authUsers, error: authError } = await supabase.from("auth.users").select("*")

          if (authError) {
            console.error("Error loading auth users:", authError)
            toast({
              title: "Error",
              description: "No se pudieron cargar los usuarios",
              variant: "destructive",
            })
            return
          }

          // Obtener roles de user_roles
          const { data: userRoles, error: rolesError } = await supabase.from("user_roles").select("*")

          if (rolesError) {
            console.error("Error loading user roles:", rolesError)
          }

          // Combinar datos
          const usersWithRoles: UserWithRole[] = (authUsers || []).map((authUser) => {
            const roleData = userRoles?.find((role) => role.user_id === authUser.id)
            return {
              id: authUser.id,
              email: authUser.email,
              name: authUser.raw_user_meta_data?.name || authUser.raw_user_meta_data?.full_name,
              created_at: authUser.created_at,
              role: roleData?.role || "user",
              assigned_at: roleData?.assigned_at,
            }
          })

          setUsers(usersWithRoles)
        } catch (error) {
          console.error("Error loading users:", error)
          toast({
            title: "Error",
            description: "Error al cargar usuarios",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }
    load()
  }, [isSuperAdmin, toast])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.includes(searchTerm),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await updateUserRole(userId, newRole as any, user?.id)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any, assigned_at: new Date().toISOString() } : u)),
      )

      toast({
        title: "Éxito",
        description: `Rol actualizado a ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="w-4 h-4" />
      case "admin":
        return <Shield className="w-4 h-4" />
      case "moderator":
        return <Star className="w-4 h-4" />
      case "premium":
        return <Users className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "admin":
        return "bg-red-500 text-white"
      case "moderator":
        return "bg-blue-500 text-white"
      case "premium":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const roleStats = {
    superadmin: users.filter((u) => u.role === "superadmin").length,
    admin: users.filter((u) => u.role === "admin").length,
    moderator: users.filter((u) => u.role === "moderator").length,
    premium: users.filter((u) => u.role === "premium").length,
    user: users.filter((u) => u.role === "user").length,
  }

  // No mostrar contenido hasta que termine la carga de autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Verificar permisos - solo SuperAdmins pueden acceder
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">Solo los SuperAdministradores pueden acceder a la gestión de usuarios.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y asigna roles en el sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.superadmin}</p>
                  <p className="text-xs text-gray-500">SuperAdmins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.admin}</p>
                  <p className="text-xs text-gray-500">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.moderator}</p>
                  <p className="text-xs text-gray-500">Moderadores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.premium}</p>
                  <p className="text-xs text-gray-500">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{roleStats.user}</p>
                  <p className="text-xs text-gray-500">Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por email, nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="superadmin">SuperAdmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
            <CardDescription>Lista completa de usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-medium text-gray-700">{userItem.email[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{userItem.name || userItem.email}</p>
                          <Badge className={`${getRoleBadgeColor(userItem.role)} flex items-center gap-1`}>
                            {getRoleIcon(userItem.role)}
                            {userItem.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{userItem.email}</p>
                        <p className="text-xs text-gray-400">
                          Registrado: {new Date(userItem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select
                        value={userItem.role}
                        onValueChange={(value) => handleRoleChange(userItem.id, value)}
                        disabled={userItem.id === user?.id} // No permitir cambiar el propio rol
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="moderator">Moderador</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">SuperAdmin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
