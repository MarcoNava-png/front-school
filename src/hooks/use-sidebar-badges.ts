'use client'

import { useCallback, useEffect, useState } from 'react'

import documentosSolicitudesService from '@/services/documentos-solicitudes-service'

export interface SidebarBadges {
  solicitudesDocumentos: number
}

export function useSidebarBadges() {
  const [badges, setBadges] = useState<SidebarBadges>({
    solicitudesDocumentos: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchBadges = useCallback(async () => {
    try {
      const contadorSolicitudes = await documentosSolicitudesService.getContadorPendientes()
      setBadges((prev) => ({
        ...prev,
        solicitudesDocumentos: contadorSolicitudes,
      }))
    } catch (error) {
      console.error('Error fetching sidebar badges:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBadges()

    const interval = setInterval(fetchBadges, 60000)

    return () => clearInterval(interval)
  }, [fetchBadges])

  return { badges, loading, refetch: fetchBadges }
}
