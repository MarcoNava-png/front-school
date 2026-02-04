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

export const MODULE_ROUTES: Record<string, string[]> = {
  Dashboard: ['/dashboard/default'],
  Admisiones: ['/dashboard/applicants'],
  Estudiantes: ['/dashboard/students', '/dashboard/group-enrollment', '/dashboard/grades', '/dashboard/attendances'],
  Catalogos: ['/dashboard/campus', '/dashboard/subjects', '/dashboard/study-plans', '/dashboard/academic-periods'],
  Academico: ['/dashboard/academic-management', '/dashboard/schedules', '/dashboard/classrooms', '/dashboard/teachers'],
  Finanzas: ['/dashboard/cashier', '/dashboard/receipts', '/dashboard/payment-templates', '/dashboard/payment-concepts', '/dashboard/scholarships', '/dashboard/payments', '/dashboard/reports', '/dashboard/cashier/corte'],
  Configuracion: ['/dashboard/users', '/dashboard/roles'],
}

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  DIRECTOR: 'director',
  COORDINADOR: 'coordinador',
  DOCENTE: 'docente',
  ALUMNO: 'alumno',
  CONTROL_ESCOLAR: 'controlescolar',
  FINANZAS: 'finanzas',
  ADMISIONES: 'admisiones',
} as const

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES]

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  director: 'Director',
  coordinador: 'Coordinador',
  docente: 'Docente',
  alumno: 'Alumno',
  controlescolar: 'Control Escolar',
  finanzas: 'Finanzas',
  admisiones: 'Admisiones',
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  superadmin: 'Acceso total al sistema incluyendo gestión de administradores',
  admin: 'Acceso completo a todos los módulos excepto Sistema',
  director: 'Supervisión general, puede ver todo y modificar la mayoría',
  coordinador: 'Gestión académica: grupos, horarios, estudiantes',
  docente: 'Calificaciones y asistencia de sus grupos',
  alumno: 'Acceso limitado a su información personal',
  controlescolar: 'Admisiones, estudiantes y finanzas',
  finanzas: 'Módulo financiero completo: caja, pagos, recibos',
  admisiones: 'Proceso de admisión y cobro de inscripciones',
}

export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  admin: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  director: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  coordinador: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  docente: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  alumno: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  controlescolar: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  finanzas: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  admisiones: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
}

export const MODULE_ICONS: Record<string, string> = {
  Dashboard: 'LayoutDashboard',
  Admisiones: 'UserPlus',
  Estudiantes: 'GraduationCap',
  Catalogos: 'BookOpen',
  Academico: 'School',
  Finanzas: 'Wallet',
  Configuracion: 'Settings',
  Sistema: 'Server',
}
