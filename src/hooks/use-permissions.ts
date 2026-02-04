import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import permissionsService from '@/services/permissions-service'
import { SYSTEM_ROLES, type UserPermissions } from '@/types/permissions'

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

let permissionsCache: UserPermissions | null = null
let cacheUserId: string | null = null

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    const user = getStoredUser()
    if (!user?.userId) {
      setIsLoading(false)
      return
    }

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
        const basicPermissions = getBasicPermissionsForRole(user.role)
        setPermissions(basicPermissions)
      } finally {
        setIsLoading(false)
      }
    }

    loadPermissions()
  }, [])

  const refreshPermissions = useCallback(async () => {
    const user = getStoredUser()
    if (!user?.userId) return

    try {
      const userPermissions = await permissionsService.getMyPermissions()
      permissionsCache = userPermissions
      cacheUserId = user.userId
      setPermissions(userPermissions)
    } catch {
      // silently ignore permission fetch errors
    }
  }, [])

  const hasPermission = useCallback(
    (permissionCode: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view'): boolean => {
      if (!permissions) return false

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

  const hasModuleAccess = useCallback(
    (module: string): boolean => {
      if (!permissions) return false

      if (permissions.roles.includes(SYSTEM_ROLES.ADMIN)) return true

      return permissions.permissions.some((p) => p.module === module && p.canView)
    },
    [permissions]
  )

  const accessibleModules = useMemo(() => {
    if (!permissions) return []

    if (permissions.roles.includes(SYSTEM_ROLES.ADMIN)) {
      return ['Dashboard', 'Admisiones', 'Estudiantes', 'Catalogos', 'Academico', 'Finanzas', 'Configuracion']
    }

    return [...new Set(permissions.permissions.filter((p) => p.canView).map((p) => p.module))]
  }, [permissions])

  const isAdmin = useMemo(() => {
    return permissions?.roles.includes(SYSTEM_ROLES.ADMIN) ?? false
  }, [permissions])

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

function getBasicPermissionsForRole(role: string): UserPermissions {
  const basePermissions: UserPermissions = {
    userId: '',
    email: '',
    roles: [role],
    permissions: [],
  }

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

export function clearPermissionsCache() {
  permissionsCache = null
  cacheUserId = null
}
