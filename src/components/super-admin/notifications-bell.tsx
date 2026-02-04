"use client"

import { useEffect, useState, useCallback } from "react"

import Link from "next/link"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  Calendar,
  Settings,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationsAdminService, type Notificacion } from "@/services/notifications-admin-service"

function getNotificationIcon(tipo: string, prioridad: string) {
  if (tipo === "VENCIMIENTO") {
    return <Calendar className={`h-4 w-4 ${prioridad === "Critica" ? "text-red-500" : prioridad === "Alta" ? "text-amber-500" : "text-blue-500"}`} />
  }
  if (tipo === "ALERTA") {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />
  }
  if (tipo === "SISTEMA") {
    return <Settings className="h-4 w-4 text-slate-500" />
  }
  return <Info className="h-4 w-4 text-blue-500" />
}

function getPriorityBadge(prioridad: string) {
  const variants: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
    Critica: "destructive",
    Alta: "secondary",
    Normal: "outline",
    Baja: "outline"
  }
  return (
    <Badge variant={variants[prioridad] || "outline"} className="text-[10px] px-1.5 py-0">
      {prioridad}
    </Badge>
  )
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notificacion[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const [notifs, count] = await Promise.all([
        notificationsAdminService.getNotificaciones(false, 10),
        notificationsAdminService.getContadorNoLeidas()
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error("Error loading notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 120000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  async function handleMarkAsRead(id: number) {
    try {
      await notificationsAdminService.marcarComoLeida(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      toast.error("Error al marcar como leida")
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationsAdminService.marcarTodasComoLeidas()
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
      toast.success("Todas las notificaciones marcadas como leidas")
    } catch (err) {
      toast.error("Error al marcar como leidas")
    }
  }

  async function handleVerifyExpirations() {
    try {
      setLoading(true)
      const result = await notificationsAdminService.verificarVencimientos()
      toast.success(`Verificacion completada: ${result.notificacionesCreadas} notificaciones creadas`)
      await loadNotifications()
    } catch (err) {
      toast.error("Error al verificar vencimientos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVerifyExpirations}
              disabled={loading}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Leer todas
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                  !notif.leida ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notif.tipo, notif.prioridad)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate flex-1">
                        {notif.titulo}
                      </span>
                      {getPriorityBadge(notif.prioridad)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.fechaCreacion), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        {notif.accionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 px-2 text-xs"
                            onClick={() => setOpen(false)}
                          >
                            <Link href={notif.accionUrl}>Ver</Link>
                          </Button>
                        )}
                        {!notif.leida && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="h-6 px-2"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/super-admin/notifications"
                className="text-center w-full justify-center text-sm"
                onClick={() => setOpen(false)}
              >
                Ver todas las notificaciones
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
