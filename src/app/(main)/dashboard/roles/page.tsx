"use client"

import { useEffect, useState, useCallback } from "react"
import { Shield, Check, X, Save, Loader2, ChevronDown, ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"

import permissionsService from "@/services/permissions-service"
import type { RoleWithPermissions, ModulePermissions, BulkAssignPermissionsRequest, PermissionAssignment } from "@/types/permissions"
import { ROLE_LABELS, ROLE_COLORS } from "@/types/permissions"

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([])
  const [permissions, setPermissions] = useState<ModulePermissions[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [pendingChanges, setPendingChanges] = useState<Record<number, PermissionAssignment>>({})

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [rolesData, permissionsData] = await Promise.all([
        permissionsService.getAllRolesWithPermissions(),
        permissionsService.getPermissionsByModule(),
      ])
      setRoles(rolesData)
      setPermissions(permissionsData)

      // Seleccionar el primer rol por defecto
      if (rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0].roleId)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast.error("Error al cargar los roles y permisos")
    } finally {
      setIsLoading(false)
    }
  }, [selectedRole])

  useEffect(() => {
    loadData()
  }, [])

  // Obtener permisos del rol seleccionado
  const getCurrentRolePermissions = useCallback(() => {
    const role = roles.find((r) => r.roleId === selectedRole)
    return role?.permissions || []
  }, [roles, selectedRole])

  // Verificar si un permiso está asignado al rol
  const getPermissionState = useCallback(
    (permissionId: number, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
      // Verificar cambios pendientes primero
      if (pendingChanges[permissionId]) {
        return pendingChanges[permissionId][action]
      }
      // Verificar permisos del rol
      const rolePerms = getCurrentRolePermissions()
      const perm = rolePerms.find((p) => p.permissionId === permissionId)
      return perm?.[action] ?? false
    },
    [pendingChanges, getCurrentRolePermissions]
  )

  // Cambiar estado de permiso
  const togglePermission = (permissionId: number, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
    setPendingChanges((prev) => {
      const current = prev[permissionId] || {
        permissionId,
        canView: getPermissionState(permissionId, "canView"),
        canCreate: getPermissionState(permissionId, "canCreate"),
        canEdit: getPermissionState(permissionId, "canEdit"),
        canDelete: getPermissionState(permissionId, "canDelete"),
      }

      return {
        ...prev,
        [permissionId]: {
          ...current,
          [action]: !current[action],
        },
      }
    })
  }

  // Guardar cambios
  const saveChanges = async () => {
    if (!selectedRole || Object.keys(pendingChanges).length === 0) return

    setIsSaving(true)
    try {
      // Construir lista completa de permisos para el rol
      const rolePerms = getCurrentRolePermissions()
      const allPermissions: PermissionAssignment[] = []

      // Agregar permisos existentes que no cambiaron
      for (const perm of rolePerms) {
        if (!pendingChanges[perm.permissionId]) {
          allPermissions.push({
            permissionId: perm.permissionId,
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
          })
        }
      }

      // Agregar permisos modificados
      for (const [, assignment] of Object.entries(pendingChanges)) {
        // Solo agregar si tiene al menos un permiso activo
        if (assignment.canView || assignment.canCreate || assignment.canEdit || assignment.canDelete) {
          allPermissions.push(assignment)
        }
      }

      const request: BulkAssignPermissionsRequest = {
        roleId: selectedRole,
        permissions: allPermissions,
      }

      await permissionsService.bulkAssignPermissions(request)
      toast.success("Permisos actualizados correctamente")
      setPendingChanges({})
      await loadData()
    } catch (error) {
      console.error("Error guardando permisos:", error)
      toast.error("Error al guardar los permisos")
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle expandir modulo
  const toggleModule = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(module)) {
        next.delete(module)
      } else {
        next.add(module)
      }
      return next
    })
  }

  // Seleccionar/deseleccionar todos los permisos de un modulo
  const toggleModulePermissions = (module: string, checked: boolean) => {
    const modulePerms = permissions.find((p) => p.module === module)?.permissions || []

    setPendingChanges((prev) => {
      const next = { ...prev }
      for (const perm of modulePerms) {
        next[perm.idPermission] = {
          permissionId: perm.idPermission,
          canView: checked,
          canCreate: checked,
          canEdit: checked,
          canDelete: checked,
        }
      }
      return next
    })
  }

  // Verificar si hay cambios pendientes
  const hasChanges = Object.keys(pendingChanges).length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Roles y Permisos
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura los permisos de acceso para cada rol del sistema
          </p>
        </div>
        {hasChanges && (
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        )}
      </div>

      <Tabs value={selectedRole || ""} onValueChange={setSelectedRole} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 h-auto p-2">
          {roles.map((role) => {
            const colors = ROLE_COLORS[role.roleName] || { bg: "bg-gray-100", text: "text-gray-700" }
            return (
              <TabsTrigger
                key={role.roleId}
                value={role.roleId}
                className={`data-[state=active]:${colors.bg} data-[state=active]:${colors.text}`}
              >
                {ROLE_LABELS[role.roleName] || role.roleName}
                <Badge variant="secondary" className="ml-2">
                  {role.permissions.length}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role.roleId} value={role.roleId} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${ROLE_COLORS[role.roleName]?.bg || "bg-gray-100"} ${ROLE_COLORS[role.roleName]?.text || "text-gray-700"}`}>
                    {ROLE_LABELS[role.roleName] || role.roleName}
                  </span>
                  <span>- Configuración de Permisos</span>
                </CardTitle>
                <CardDescription>
                  Selecciona los permisos que tendrá este rol en cada módulo del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissions.map((moduleGroup) => (
                  <Collapsible
                    key={moduleGroup.module}
                    open={expandedModules.has(moduleGroup.module)}
                    onOpenChange={() => toggleModule(moduleGroup.module)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            {expandedModules.has(moduleGroup.module) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                            <h3 className="font-semibold text-lg">{moduleGroup.module}</h3>
                            <Badge variant="outline">{moduleGroup.permissions.length} permisos</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleModulePermissions(moduleGroup.module, true)
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Todos
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleModulePermissions(moduleGroup.module, false)
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Ninguno
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="text-left p-3 font-medium">Permiso</th>
                                <th className="text-center p-3 font-medium w-24">Ver</th>
                                <th className="text-center p-3 font-medium w-24">Crear</th>
                                <th className="text-center p-3 font-medium w-24">Editar</th>
                                <th className="text-center p-3 font-medium w-24">Eliminar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {moduleGroup.permissions.map((perm) => (
                                <tr key={perm.idPermission} className="border-t hover:bg-muted/30">
                                  <td className="p-3">
                                    <div>
                                      <p className="font-medium">{perm.name}</p>
                                      {perm.description && (
                                        <p className="text-sm text-muted-foreground">{perm.description}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-center p-3">
                                    <Checkbox
                                      checked={getPermissionState(perm.idPermission, "canView")}
                                      onCheckedChange={() => togglePermission(perm.idPermission, "canView")}
                                    />
                                  </td>
                                  <td className="text-center p-3">
                                    <Checkbox
                                      checked={getPermissionState(perm.idPermission, "canCreate")}
                                      onCheckedChange={() => togglePermission(perm.idPermission, "canCreate")}
                                    />
                                  </td>
                                  <td className="text-center p-3">
                                    <Checkbox
                                      checked={getPermissionState(perm.idPermission, "canEdit")}
                                      onCheckedChange={() => togglePermission(perm.idPermission, "canEdit")}
                                    />
                                  </td>
                                  <td className="text-center p-3">
                                    <Checkbox
                                      checked={getPermissionState(perm.idPermission, "canDelete")}
                                      onCheckedChange={() => togglePermission(perm.idPermission, "canDelete")}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
