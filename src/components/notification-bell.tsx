'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Bell, BellRing, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getNotificaciones,
  getNotificacionesNoLeidas,
  marcarLeida,
  marcarTodasLeidas,
} from '@/services/notificacion-service'
import type { NotificacionUsuario } from '@/types/notificacion'

const TIPO_ICON: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
}

const TIPO_COLOR: Record<string, string> = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  success: 'text-green-500',
  error: 'text-red-500',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `hace ${diffMin}m`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `hace ${diffHr}h`

  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 7) return `hace ${diffDays}d`

  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [notificaciones, setNotificaciones] = useState<NotificacionUsuario[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCount = useCallback(async () => {
    try {
      const c = await getNotificacionesNoLeidas()
      setCount(c)
    } catch {
      // silently fail
    }
  }, [])

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getNotificaciones(false, 1, 15)
      setNotificaciones(result.items)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 60000) // poll every minute
    return () => clearInterval(interval)
  }, [fetchCount])

  useEffect(() => {
    if (open) {
      fetchNotificaciones()
    }
  }, [open, fetchNotificaciones])

  const handleMarkRead = async (notif: NotificacionUsuario) => {
    if (!notif.leida) {
      await marcarLeida(notif.idNotificacion)
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.idNotificacion === notif.idNotificacion ? { ...n, leida: true } : n,
        ),
      )
      setCount((c) => Math.max(0, c - 1))
    }
    if (notif.urlAccion) {
      setOpen(false)
      router.push(notif.urlAccion)
    }
  }

  const handleMarkAllRead = async () => {
    await marcarTodasLeidas()
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    setCount(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          {count > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notificaciones</h4>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Cargando...
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notif) => {
                const Icon = TIPO_ICON[notif.tipo] ?? Info
                const iconColor = TIPO_COLOR[notif.tipo] ?? 'text-gray-500'

                return (
                  <button
                    key={notif.idNotificacion}
                    onClick={() => handleMarkRead(notif)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !notif.leida ? 'bg-muted/30' : ''
                    }`}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!notif.leida ? 'font-semibold' : ''}`}>
                          {notif.titulo}
                        </p>
                        {!notif.leida && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.mensaje}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {notif.modulo && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {notif.modulo}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(notif.fechaCreacion)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
