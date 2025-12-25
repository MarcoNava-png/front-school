import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import type { UserPermissions, RolePermission } from '@/types/permissions'
import { SYSTEM_ROLES } from '@/types/permissions'
import permissionsService from '@/services/permissions-service'

// Obtener usuario del localStorage
function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Cache de permisos en memoria
let permissionsCache: UserPermissions | null = null
let cacheUserId: string | null = null

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  // Cargar permisos del backend
  useEffect(() => {
    const user = getStoredUser()
    if (!user?.userId) {
      setIsLoading(false)
      return
    }

    // Si ya tenemos cache para este usuario, usarlo
    if (cacheUserId === user.userId && permissionsCache) {
      setPermissions(permissionsCache)
      setIsLoading(false)
      return
    }

    if (hasFetched.current) return
    hasFetched.current = true

    const loadPermissions = async () => {
      try {
        const userPermissions = await permissionsService.getMyPermissions()
        permissionsCache = userPermissions
        cacheUserId = user.userId
        setPermissions(userPermissions)
      } catch (err) {
        console.warn('No se pudieron cargar los permisos:', err)
        // Usar permisos basicos segun rol del usuario
        const basicPermissions = getBasicPermissionsForRole(user.role)
        setPermissions(basicPermissions)
      } finally {
        setIsLoading(false)
      }
    }

    loadPermissions()
  }, [])

  // Refrescar permisos
  const refreshPermissions = useCallback(async () => {
    const user = getStoredUser()
    if (!user?.userId) return

    try {
      const userPermissions = await permissionsService.getMyPermissions()
      permissionsCache = userPermissions
      cacheUserId = user.userId
      setPermissions(userPermissions)
    } catch {
      // Mantener permisos actuales
    }
  }, [])

  // Verificar si tiene un permiso especifico
  const hasPermission = useCallback(
    (permissionCode: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view'): boolean => {
      if (!permissions) return false

      // Admin tiene acceso a todo
      if (permissions.roles.includes(SYSTEM_ROLES.ADMIN)) return true

      const permission = permissions.permissions.find((p) => p.permissionCode === permissionCode)
      if (!permission) return false

      switch (action) {
        case 'view':
          return permission.canView
        case 'create':
          return permission.canCreate
        case 'edit':
          return permission.canEdit
        case 'delete':
          return permission.canDelete
        default:
          return permission.canView
      }
    },
    [permissions]
  )

  // Verificar si tiene acceso a un modulo
  const hasModuleAccess = useCallback(
    (module: string): boolean => {
      if (!permissions) return false

      // Admin tiene acceso a todo
      if (permissions.roles.includes(SYSTEM_ROLES.ADMIN)) return true

      return permissions.permissions.some((p) => p.module === module && p.canView)
    },
    [permissions]
  )

  // Obtener modulos accesibles
  const accessibleModules = useMemo(() => {
    if (!permissions) return []

    // Admin tiene acceso a todo
    if (permissions.roles.includes(SYSTEM_ROLES.ADMIN)) {
      return ['Dashboard', 'Admisiones', 'Estudiantes', 'Catalogos', 'Academico', 'Finanzas', 'Configuracion']
    }

    return [...new Set(permissions.permissions.filter((p) => p.canView).map((p) => p.module))]
  }, [permissions])

  // Verificar si es admin
  const isAdmin = useMemo(() => {
    return permissions?.roles.includes(SYSTEM_ROLES.ADMIN) ?? false
  }, [permissions])

  // Obtener el rol principal
  const primaryRole = useMemo(() => {
    const user = getStoredUser()
    return user?.role || null
  }, [])

  return {
    permissions,
    isLoading,
    hasPermission,
    hasModuleAccess,
    accessibleModules,
    isAdmin,
    primaryRole,
    refreshPermissions,
  }
}

// Permisos basicos por rol (fallback cuando no hay backend)
function getBasicPermissionsForRole(role: string): UserPermissions {
  const basePermissions: UserPermissions = {
    userId: '',
    email: '',
    roles: [role],
    permissions: [],
  }

  // Mapear permisos basicos segun rol
  const moduleAccess: Record<string, string[]> = {
    [SYSTEM_ROLES.ADMIN]: ['Dashboard', 'Admisiones', 'Estudiantes', 'Catalogos', 'Academico', 'Finanzas', 'Configuracion'],
    [SYSTEM_ROLES.DIRECTOR]: ['Dashboard', 'Admisiones', 'Estudiantes', 'Catalogos', 'Academico', 'Finanzas'],
    [SYSTEM_ROLES.COORDINADOR]: ['Dashboard', 'Estudiantes', 'Catalogos', 'Academico'],
    [SYSTEM_ROLES.CONTROL_ESCOLAR]: ['Dashboard', 'Admisiones', 'Estudiantes', 'Finanzas'],
    [SYSTEM_ROLES.DOCENTE]: ['Dashboard', 'Academico'],
    [SYSTEM_ROLES.ALUMNO]: ['Dashboard'],
  }

  const modules = moduleAccess[role] || ['Dashboard']

  basePermissions.permissions = modules.map((module) => ({
    idRolePermission: 0,
    roleId: '',
    roleName: role,
    permissionId: 0,
    permissionCode: `${module.toLowerCase()}.view`,
    permissionName: `Ver ${module}`,
    module,
    canView: true,
    canCreate: role === SYSTEM_ROLES.ADMIN,
    canEdit: role === SYSTEM_ROLES.ADMIN,
    canDelete: role === SYSTEM_ROLES.ADMIN,
  }))

  return basePermissions
}

// Limpiar cache al cerrar sesion
export function clearPermissionsCache() {
  permissionsCache = null
  cacheUserId = null
}
