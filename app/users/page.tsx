"use client"

import { useState, useEffect } from "react"
import { Users, Shield, Crown, Search, RefreshCw, Mail, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsersWithRoles, updateUserRole, logUserManagement } from "@/lib/database"
import { supabase } from "@/lib/supabase"

interface UserWithDetails {
  user_id: string
  role: "admin" | "user" | "premium" | "moderator" | "superadmin"
  assigned_at: string
  created_at: string
  updated_at: string
  email?: string
  name?: string
  last_sign_in_at?: string
  email_confirmed_at?: string
}

export default function UsersPage() {
  const { user, isSuperAdmin } = useAuth()
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<UserWithDetails[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // Verificar acceso de SuperAdmin
  useEffect(() => {
    if (!isSuperAdmin) {
      toast({
        title: "Acceso denegado",
        description: "Solo los SuperAdmins pueden acceder a esta página.",
        variant: "destructive",
      })
      window.location.href = "/"
      return
    }
    loadAllUsers()
  }, [isSuperAdmin])

  // Filtrar usuarios cuando cambia el término de búsqueda o filtro de rol
  useEffect(() => {
    let filtered = allUsers

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (userData) =>
          userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userData.user_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((userData) => userData.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [allUsers, searchTerm, roleFilter])

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      // Obtener roles de usuarios
      const { data: rolesData, error: rolesError } = await getAllUsersWithRoles()
      if (rolesError) {
        throw rolesError
      }

      // Obtener detalles de usuarios de auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) {
        throw authError
      }

      // Combinar datos
      const usersWithDetails: UserWithDetails[] =
        rolesData?.map((roleData) => {
          const authUser = authUsers.users.find((au) => au.id === roleData.user_id)
          return {
            ...roleData,
            email: authUser?.email,
            name: authUser?.user_metadata?.name || authUser?.user_metadata?.full_name,
            last_sign_in_at: authUser?.last_sign_in_at,
            email_confirmed_at: authUser?.email_confirmed_at,
          }
        }) || []

      setAllUsers(usersWithDetails)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Error al cargar la lista de usuarios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user" | "premium" | "moderator" | "superadmin",
  ) => {
    try {
      const oldRole = allUsers.find((u) => u.user_id === userId)?.role

      const { error } = await updateUserRole(userId, newRole, user?.id)
      if (error) {
        throw error
      }

      // Log the action
      await logUserManagement(userId, "role_change", {
        old_role: oldRole,
        new_role: newRole,
      })

      toast({
        title: "Rol actualizado",
        description: `El rol del usuario ha sido actualizado a ${newRole}.`,
      })

      // Refresh users list
      loadAllUsers()
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el rol del usuario.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300"
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="h-3 w-3 mr-1" />
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleStats = () => {
    const stats = allUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: allUsers.length,
      superadmin: stats.superadmin || 0,
      admin: stats.admin || 0,
      moderator: stats.moderator || 0,
      premium: stats.premium || 0,
      user: stats.user || 0,
    }
  }

  if (!isSuperAdmin) {
    return null
  }

  const stats = getRoleStats()

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="h-8 w-8" />
                Gestión de Usuarios
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  SuperAdmin
                </Badge>
              </h1>
              <p className="text-gray-600">Administra usuarios y asigna roles en el sistema</p>
            </div>
            <Button onClick={loadAllUsers} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.superadmin}</div>
              <div className="text-sm text-gray-500">SuperAdmins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
              <div className="text-sm text-gray-500">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.moderator}</div>
              <div className="text-sm text-gray-500">Moderators</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
              <div className="text-sm text-gray-500">Premium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.user}</div>
              <div className="text-sm text-gray-500">Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por email, nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="superadmin">SuperAdmin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            <CardDescription>Gestiona los roles y permisos de todos los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Cargando usuarios...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-500">
                  {searchTerm || roleFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay usuarios registrados en el sistema"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userData) => (
                  <div
                    key={userData.user_id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {userData.email?.[0]?.toUpperCase() || userData.user_id.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {userData.name || userData.email || "Usuario sin nombre"}
                          </h3>
                          <Badge className={getRoleBadgeColor(userData.role)}>
                            {getRoleIcon(userData.role)}
                            {userData.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userData.email || "Sin email"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(userData.created_at)}
                          </div>
                          {userData.last_sign_in_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(userData.last_sign_in_at)}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">ID: {userData.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Select
                        value={userData.role}
                        onValueChange={(newRole: "admin" | "user" | "premium" | "moderator" | "superadmin") =>
                          handleRoleChange(userData.user_id, newRole)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
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
