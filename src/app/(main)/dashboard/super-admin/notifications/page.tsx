"use client"

import { useEffect, useState } from "react"

import Link from "next/link"

import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  Calendar,
  Settings,
  RefreshCw,
  Filter,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationsAdminService, type Notificacion } from "@/services/notifications-admin-service"

function getNotificationIcon(tipo: string, prioridad: string) {
  const color = prioridad === "Critica" ? "text-red-500" :
                prioridad === "Alta" ? "text-amber-500" : "text-blue-500"

  if (tipo === "VENCIMIENTO") return <Calendar className={`h-5 w-5 ${color}`} />
  if (tipo === "ALERTA") return <AlertTriangle className="h-5 w-5 text-amber-500" />
  if (tipo === "SISTEMA") return <Settings className="h-5 w-5 text-slate-500" />
  return <Info className="h-5 w-5 text-blue-500" />
}

function getPriorityBadge(prioridad: string) {
  const variants: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
    Critica: "destructive",
    Alta: "secondary",
    Normal: "outline",
    Baja: "outline"
  }
  return <Badge variant={variants[prioridad] || "outline"}>{prioridad}</Badge>
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    loadNotifications()
  }, [filter])

  async function loadNotifications() {
    try {
      setLoading(true)
      const data = await notificationsAdminService.getNotificaciones(filter === "unread", 100)
      setNotifications(data)
    } catch (err) {
      toast.error("Error al cargar notificaciones")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: number) {
    try {
      await notificationsAdminService.marcarComoLeida(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
      toast.success("Marcada como leida")
    } catch (err) {
      toast.error("Error al marcar como leida")
    }
  }

  async function handleMarkSelectedAsRead() {
    if (selected.length === 0) return
    try {
      await notificationsAdminService.marcarVariasComoLeidas(selected)
      setNotifications(prev =>
        prev.map(n => selected.includes(n.id) ? { ...n, leida: true } : n)
      )
      setSelected([])
      toast.success(`${selected.length} notificaciones marcadas como leidas`)
    } catch (err) {
      toast.error("Error al marcar como leidas")
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationsAdminService.marcarTodasComoLeidas()
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      toast.success("Todas las notificaciones marcadas como leidas")
    } catch (err) {
      toast.error("Error al marcar como leidas")
    }
  }

  async function handleVerifyExpirations() {
    try {
      setLoading(true)
      const result = await notificationsAdminService.verificarVencimientos()
      toast.success(
        `Verificacion completada: ${result.notificacionesCreadas} notificaciones creadas`
      )
      await loadNotifications()
    } catch (err) {
      toast.error("Error al verificar vencimientos")
    } finally {
      setLoading(false)
    }
  }

  function toggleSelected(id: number) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selected.length === notifications.length) {
      setSelected([])
    } else {
      setSelected(notifications.map(n => n.id))
    }
  }

  const unreadCount = notifications.filter(n => !n.leida).length

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todas leidas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleVerifyExpirations} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Verificar vencimientos
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Sin leer</SelectItem>
                </SelectContent>
              </Select>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.length === notifications.length && notifications.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selected.length > 0 ? `${selected.length} seleccionadas` : "Seleccionar todas"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar seleccion
                </Button>
              )}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notificaciones</CardTitle>
          <CardDescription>{notifications.length} notificaciones</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !notif.leida ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selected.includes(notif.id)}
                      onCheckedChange={() => toggleSelected(notif.id)}
                    />

                    <div className="mt-0.5">
                      {getNotificationIcon(notif.tipo, notif.prioridad)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium">{notif.titulo}</span>
                        {getPriorityBadge(notif.prioridad)}
                        <Badge variant="outline" className="text-xs">
                          {notif.tipo}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notif.mensaje}
                      </p>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notif.fechaCreacion), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span>
                            ({formatDistanceToNow(new Date(notif.fechaCreacion), {
                              addSuffix: true,
                              locale: es
                            })})
                          </span>
                          {notif.tenantCodigo && (
                            <Badge variant="secondary" className="text-xs">
                              {notif.tenantCodigo}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {notif.accionUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={notif.accionUrl}>Ver detalle</Link>
                            </Button>
                          )}
                          {!notif.leida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notif.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Leida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
