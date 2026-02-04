import type {
  Permission,
  RoleWithPermissions,
  UserPermissions,
  ModulePermissions,
  AssignPermissionRequest,
  BulkAssignPermissionsRequest,
  RolePermission,
} from '@/types/permissions'

import axiosInstance from './api-client'

const API_URL = '/permission'

export const permissionsService = {
  async getAllPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get<Permission[]>(API_URL)
    return response.data
  },

  async getPermissionsByModule(): Promise<ModulePermissions[]> {
    const response = await axiosInstance.get<ModulePermissions[]>(`${API_URL}/by-module`)
    return response.data
  },

  async getPermissionById(id: number): Promise<Permission> {
    const response = await axiosInstance.get<Permission>(`${API_URL}/${id}`)
    return response.data
  },

  async createPermission(permission: Partial<Permission>): Promise<Permission> {
    const response = await axiosInstance.post<Permission>(API_URL, permission)
    return response.data
  },

  async updatePermission(id: number, permission: Partial<Permission>): Promise<Permission> {
    const response = await axiosInstance.put<Permission>(`${API_URL}/${id}`, permission)
    return response.data
  },

  async deletePermission(id: number): Promise<void> {
    await axiosInstance.delete(`${API_URL}/${id}`)
  },

  async getAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    const response = await axiosInstance.get<RoleWithPermissions[]>(`${API_URL}/roles`)
    return response.data
  },

  async getRolePermissions(roleId: string): Promise<RoleWithPermissions> {
    const response = await axiosInstance.get<RoleWithPermissions>(`${API_URL}/roles/${roleId}`)
    return response.data
  },

  async getPermissionsByRoleName(roleName: string): Promise<RolePermission[]> {
    const response = await axiosInstance.get<RolePermission[]>(`${API_URL}/roles/by-name/${roleName}`)
    return response.data
  },

  async assignPermissionToRole(request: AssignPermissionRequest): Promise<void> {
    await axiosInstance.post(`${API_URL}/assign`, request)
  },

  async bulkAssignPermissions(request: BulkAssignPermissionsRequest): Promise<void> {
    await axiosInstance.post(`${API_URL}/assign-bulk`, request)
  },

  async removePermissionFromRole(roleId: string, permissionId: number): Promise<void> {
    await axiosInstance.delete(`${API_URL}/roles/${roleId}/permissions/${permissionId}`)
  },

  async removeAllPermissionsFromRole(roleId: string): Promise<void> {
    await axiosInstance.delete(`${API_URL}/roles/${roleId}/permissions`)
  },

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const response = await axiosInstance.get<UserPermissions>(`${API_URL}/user/${userId}`)
    return response.data
  },

  async getUserModules(userId: string): Promise<string[]> {
    const response = await axiosInstance.get<string[]>(`${API_URL}/user/${userId}/modules`)
    return response.data
  },

  async checkPermission(permissionCode: string, action: string = 'view'): Promise<boolean> {
    const response = await axiosInstance.get<boolean>(`${API_URL}/check`, {
      params: { permissionCode, action },
    })
    return response.data
  },

  async getMyPermissions(): Promise<UserPermissions> {
    const response = await axiosInstance.get<UserPermissions>(`${API_URL}/my-permissions`)
    return response.data
  },
}

export default permissionsService
