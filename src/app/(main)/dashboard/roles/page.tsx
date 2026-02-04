"use client"

import { useEffect, useState, useCallback, useMemo } from "react"

import {
  Shield,
  Check,
  X,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  Plus,
  Pencil,
  Trash2,
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  BookOpen,
  School,
  Wallet,
  Settings,
  Server,
  Crown,
  RefreshCw,
  ChevronUp,
  Info,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import permissionsService from "@/services/permissions-service"
import {
  ROLE_COLORS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type BulkAssignPermissionsRequest,
  type ModulePermissions,
  type PermissionAssignment,
  type RoleWithPermissions,
} from "@/types/permissions"

const ModuleIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="h-5 w-5" />,
  Admisiones: <UserPlus className="h-5 w-5" />,
  Estudiantes: <GraduationCap className="h-5 w-5" />,
  Catalogos: <BookOpen className="h-5 w-5" />,
  Academico: <School className="h-5 w-5" />,
  Finanzas: <Wallet className="h-5 w-5" />,
  Configuracion: <Settings className="h-5 w-5" />,
  Sistema: <Server className="h-5 w-5" />,
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([])
  const [permissions, setPermissions] = useState<ModulePermissions[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [pendingChanges, setPendingChanges] = useState<Record<number, PermissionAssignment>>({})
  const [searchTerm, setSearchTerm] = useState("")

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [rolesData, permissionsData] = await Promise.all([
        permissionsService.getAllRolesWithPermissions(),
        permissionsService.getPermissionsByModule(),
      ])

      const roleOrder = ['superadmin', 'admin', 'director', 'coordinador', 'controlescolar', 'finanzas', 'admisiones', 'docente', 'alumno']
      const sortedRoles = rolesData.sort((a, b) => {
        const aIndex = roleOrder.indexOf(a.roleName.toLowerCase())
        const bIndex = roleOrder.indexOf(b.roleName.toLowerCase())
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })

      setRoles(sortedRoles)
      setPermissions(permissionsData)

      if (sortedRoles.length > 0 && !selectedRole) {
        setSelectedRole(sortedRoles[0].roleId)
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

  const currentRole = useMemo(() => {
    return roles.find((r) => r.roleId === selectedRole)
  }, [roles, selectedRole])

  const getCurrentRolePermissions = useCallback(() => {
    return currentRole?.permissions || []
  }, [currentRole])

  const getPermissionState = useCallback(
    (permissionId: number, action: "canView" | "canCreate" | "canEdit" | "canDelete") => {
      if (pendingChanges[permissionId]) {
        return pendingChanges[permissionId][action]
      }
      const rolePerms = getCurrentRolePermissions()
      const perm = rolePerms.find((p) => p.permissionId === permissionId)
      return perm?.[action] ?? false
    },
    [pendingChanges, getCurrentRolePermissions]
  )

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

  const toggleRowAll = (permissionId: number) => {
    const allEnabled =
      getPermissionState(permissionId, "canView") &&
      getPermissionState(permissionId, "canCreate") &&
      getPermissionState(permissionId, "canEdit") &&
      getPermissionState(permissionId, "canDelete")

    setPendingChanges((prev) => ({
      ...prev,
      [permissionId]: {
        permissionId,
        canView: !allEnabled,
        canCreate: !allEnabled,
        canEdit: !allEnabled,
        canDelete: !allEnabled,
      },
    }))
  }

  const saveChanges = async () => {
    if (!selectedRole || Object.keys(pendingChanges).length === 0) return

    setIsSaving(true)
    try {
      const rolePerms = getCurrentRolePermissions()
      const allPermissions: PermissionAssignment[] = []

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

      for (const [, assignment] of Object.entries(pendingChanges)) {
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

  const discardChanges = () => {
    setPendingChanges({})
    toast.info("Cambios descartados")
  }

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

  const toggleAllModules = (expand: boolean) => {
    if (expand) {
      setExpandedModules(new Set(permissions.map(p => p.module)))
    } else {
      setExpandedModules(new Set())
    }
  }

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

  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissions

    const term = searchTerm.toLowerCase()
    return permissions
      .map(module => ({
        ...module,
        permissions: module.permissions.filter(
          p => p.name.toLowerCase().includes(term) ||
               p.description?.toLowerCase().includes(term) ||
               p.code.toLowerCase().includes(term)
        )
      }))
      .filter(module => module.permissions.length > 0)
  }, [permissions, searchTerm])

  const getModulePermissionCount = useCallback((module: string) => {
    const modulePerms = permissions.find((p) => p.module === module)?.permissions || []
    let enabled = 0
    const total = modulePerms.length * 4

    for (const perm of modulePerms) {
      if (getPermissionState(perm.idPermission, "canView")) enabled++
      if (getPermissionState(perm.idPermission, "canCreate")) enabled++
      if (getPermissionState(perm.idPermission, "canEdit")) enabled++
      if (getPermissionState(perm.idPermission, "canDelete")) enabled++
    }

    return { enabled, total }
  }, [permissions, getPermissionState])

  const hasChanges = Object.keys(pendingChanges).length > 0
  const changesCount = Object.keys(pendingChanges).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const roleColors = currentRole ? ROLE_COLORS[currentRole.roleName] : null

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                <Shield className="h-8 w-8 text-blue-700" />
              </div>
              Gestión de Permisos
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura qué puede hacer cada rol en el sistema
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Roles del Sistema</CardTitle>
              <CardDescription>Selecciona un rol para configurar</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  {roles.map((role) => {
                    const colors = ROLE_COLORS[role.roleName] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                    const isSelected = selectedRole === role.roleId
                    const isSuperAdmin = role.roleName === 'superadmin'

                    return (
                      <button
                        key={role.roleId}
                        onClick={() => {
                          setSelectedRole(role.roleId)
                          setPendingChanges({})
                        }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `${colors.bg} ${colors.border} shadow-md`
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isSuperAdmin && <Crown className="h-4 w-4 text-yellow-600" />}
                            <span className={`font-medium ${isSelected ? colors.text : ''}`}>
                              {ROLE_LABELS[role.roleName] || role.roleName}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {role.permissions.length}
                          </Badge>
                        </div>
                        {isSelected && ROLE_DESCRIPTIONS[role.roleName] && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {ROLE_DESCRIPTIONS[role.roleName]}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Permisos de
                    {currentRole && (
                      <span className={`px-2 py-1 rounded text-sm ${roleColors?.bg} ${roleColors?.text}`}>
                        {currentRole.roleName === 'superadmin' && <Crown className="h-3 w-3 inline mr-1" />}
                        {ROLE_LABELS[currentRole.roleName] || currentRole.roleName}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Marca las acciones permitidas para cada funcionalidad
                  </CardDescription>
                </div>

                {hasChanges && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      {changesCount} cambio{changesCount > 1 ? 's' : ''} pendiente{changesCount > 1 ? 's' : ''}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={discardChanges}
                    >
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveChanges}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar permisos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllModules(true)}
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expandir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllModules(false)}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Colapsar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filteredPermissions.map((moduleGroup) => {
                    const { enabled, total } = getModulePermissionCount(moduleGroup.module)
                    const percentage = total > 0 ? Math.round((enabled / total) * 100) : 0
                    const isExpanded = expandedModules.has(moduleGroup.module)

                    return (
                      <Collapsible
                        key={moduleGroup.module}
                        open={isExpanded}
                        onOpenChange={() => toggleModule(moduleGroup.module)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                  {ModuleIcons[moduleGroup.module] || <Settings className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{moduleGroup.module}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {moduleGroup.permissions.length} permisos
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        percentage === 100 ? 'bg-green-500' :
                                        percentage > 50 ? 'bg-blue-500' :
                                        percentage > 0 ? 'bg-amber-500' : 'bg-gray-300'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-10">
                                    {percentage}%
                                  </span>
                                </div>

                                <div className="flex gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleModulePermissions(moduleGroup.module, true)
                                        }}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Activar todos</TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleModulePermissions(moduleGroup.module, false)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Desactivar todos</TooltipContent>
                                  </Tooltip>
                                </div>

                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <Separator />
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50 border-b">
                                    <th className="text-left p-3 font-medium text-sm">Permiso</th>
                                    <th className="text-center p-3 font-medium text-sm w-20">
                                      <div className="flex flex-col items-center gap-1">
                                        <Eye className="h-4 w-4 text-blue-600" />
                                        <span>Ver</span>
                                      </div>
                                    </th>
                                    <th className="text-center p-3 font-medium text-sm w-20">
                                      <div className="flex flex-col items-center gap-1">
                                        <Plus className="h-4 w-4 text-green-600" />
                                        <span>Crear</span>
                                      </div>
                                    </th>
                                    <th className="text-center p-3 font-medium text-sm w-20">
                                      <div className="flex flex-col items-center gap-1">
                                        <Pencil className="h-4 w-4 text-amber-600" />
                                        <span>Editar</span>
                                      </div>
                                    </th>
                                    <th className="text-center p-3 font-medium text-sm w-20">
                                      <div className="flex flex-col items-center gap-1">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                        <span>Eliminar</span>
                                      </div>
                                    </th>
                                    <th className="text-center p-3 font-medium text-sm w-16">Todo</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {moduleGroup.permissions.map((perm, index) => {
                                    const hasChange = !!pendingChanges[perm.idPermission]
                                    const allEnabled =
                                      getPermissionState(perm.idPermission, "canView") &&
                                      getPermissionState(perm.idPermission, "canCreate") &&
                                      getPermissionState(perm.idPermission, "canEdit") &&
                                      getPermissionState(perm.idPermission, "canDelete")

                                    return (
                                      <tr
                                        key={perm.idPermission}
                                        className={`border-b last:border-0 transition-colors ${
                                          hasChange ? 'bg-amber-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                      >
                                        <td className="p-3">
                                          <div className="flex items-start gap-2">
                                            <div>
                                              <p className="font-medium text-sm">{perm.name}</p>
                                              {perm.description && (
                                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                                              )}
                                              <code className="text-xs text-muted-foreground bg-gray-100 px-1 rounded">
                                                {perm.code}
                                              </code>
                                            </div>
                                            {hasChange && (
                                              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                                                Modificado
                                              </Badge>
                                            )}
                                          </div>
                                        </td>
                                        <td className="text-center p-3">
                                          <Checkbox
                                            checked={getPermissionState(perm.idPermission, "canView")}
                                            onCheckedChange={() => togglePermission(perm.idPermission, "canView")}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                          />
                                        </td>
                                        <td className="text-center p-3">
                                          <Checkbox
                                            checked={getPermissionState(perm.idPermission, "canCreate")}
                                            onCheckedChange={() => togglePermission(perm.idPermission, "canCreate")}
                                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                          />
                                        </td>
                                        <td className="text-center p-3">
                                          <Checkbox
                                            checked={getPermissionState(perm.idPermission, "canEdit")}
                                            onCheckedChange={() => togglePermission(perm.idPermission, "canEdit")}
                                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                          />
                                        </td>
                                        <td className="text-center p-3">
                                          <Checkbox
                                            checked={getPermissionState(perm.idPermission, "canDelete")}
                                            onCheckedChange={() => togglePermission(perm.idPermission, "canDelete")}
                                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                          />
                                        </td>
                                        <td className="text-center p-3">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${
                                                  allEnabled
                                                    ? 'text-green-600 hover:text-red-600'
                                                    : 'text-gray-400 hover:text-green-600'
                                                }`}
                                                onClick={() => toggleRowAll(perm.idPermission)}
                                              >
                                                {allEnabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {allEnabled ? 'Desactivar todos' : 'Activar todos'}
                                            </TooltipContent>
                                          </Tooltip>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )
                  })}

                  {filteredPermissions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron permisos con &ldquo;{searchTerm}&rdquo;</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Leyenda de acciones:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-600" />
                <span>Ver - Consultar información</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600" />
                <span>Crear - Agregar nuevos registros</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-600" />
                <span>Editar - Modificar existentes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600" />
                <span>Eliminar - Borrar registros</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
