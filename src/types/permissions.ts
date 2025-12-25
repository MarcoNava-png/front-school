export interface Permission {
  idPermission: number
  code: string
  name: string
  description?: string
  module: string
  isActive: boolean
}

export interface RolePermission {
  idRolePermission: number
  roleId: string
  roleName: string
  permissionId: number
  permissionCode: string
  permissionName: string
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface RoleWithPermissions {
  roleId: string
  roleName: string
  permissions: RolePermission[]
}

export interface ModulePermissions {
  module: string
  permissions: Permission[]
}

export interface UserPermissions {
  userId: string
  email: string
  roles: string[]
  permissions: RolePermission[]
}

export interface AssignPermissionRequest {
  roleId: string
  permissionId: number
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface BulkAssignPermissionsRequest {
  roleId: string
  permissions: PermissionAssignment[]
}

export interface PermissionAssignment {
  permissionId: number
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

// Mapeo de modulos a rutas del sidebar
export const MODULE_ROUTES: Record<string, string[]> = {
  Dashboard: ['/dashboard/default'],
  Admisiones: ['/dashboard/applicants'],
  Estudiantes: ['/dashboard/students', '/dashboard/group-enrollment', '/dashboard/grades', '/dashboard/attendances'],
  Catalogos: ['/dashboard/campus', '/dashboard/subjects', '/dashboard/study-plans', '/dashboard/academic-periods'],
  Academico: ['/dashboard/academic-management', '/dashboard/schedules', '/dashboard/classrooms', '/dashboard/teachers'],
  Finanzas: ['/dashboard/cashier', '/dashboard/receipts', '/dashboard/payment-templates', '/dashboard/payment-concepts', '/dashboard/scholarships', '/dashboard/payments', '/dashboard/reports', '/dashboard/cashier/corte'],
  Configuracion: ['/dashboard/users', '/dashboard/roles'],
}

// Roles del sistema
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  COORDINADOR: 'coordinador',
  DOCENTE: 'docente',
  ALUMNO: 'alumno',
  CONTROL_ESCOLAR: 'controlescolar',
} as const

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES]

// Mapeo de roles a etiquetas
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  director: 'Director',
  coordinador: 'Coordinador',
  docente: 'Docente',
  alumno: 'Alumno',
  controlescolar: 'Control Escolar',
}

// Colores de roles
export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700' },
  director: { bg: 'bg-purple-100', text: 'text-purple-700' },
  coordinador: { bg: 'bg-blue-100', text: 'text-blue-700' },
  docente: { bg: 'bg-green-100', text: 'text-green-700' },
  alumno: { bg: 'bg-orange-100', text: 'text-orange-700' },
  controlescolar: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
}
