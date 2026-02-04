import { useEffect, useState, useCallback } from 'react'

import { superAdminAuthService, type SuperAdminInfo } from '@/services/super-admin-auth-service'

export function useSuperAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [superAdmin, setSuperAdmin] = useState<SuperAdminInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const checkAuth = useCallback(() => {
    if (typeof window === 'undefined') return

    const authenticated = superAdminAuthService.isAuthenticated()
    const user = superAdminAuthService.getUser()

    setIsAuthenticated(authenticated)
    setSuperAdmin(authenticated ? user : null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'super_admin_token' || e.key === 'super_admin_user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      checkAuth()
    }, 60000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [checkAuth])

  const logout = useCallback(() => {
    superAdminAuthService.logout()
    setIsAuthenticated(false)
    setSuperAdmin(null)
  }, [])

  const refreshAuth = useCallback(() => {
    checkAuth()
  }, [checkAuth])

  return {
    isAuthenticated,
    superAdmin,
    isLoading,
    logout,
    refreshAuth,
  }
}
