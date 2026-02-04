"use client"

import { useEffect, useState } from "react"

import Link from "next/link"

import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Plus,
  TrendingUp,
  School,
  Clock
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { tenantAdminService, type DashboardGlobal, type TenantListItem } from "@/services/tenant-admin-service"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'Active': { label: 'Activo', variant: 'default' },
    'Pending': { label: 'Pendiente', variant: 'secondary' },
    'Suspended': { label: 'Suspendido', variant: 'destructive' },
    'Maintenance': { label: 'Mantenimiento', variant: 'outline' },
    'Inactive': { label: 'Inactivo', variant: 'outline' },
  }
  const config = statusMap[status] || { label: status, variant: 'outline' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function TenantCard({ tenant }: { tenant: TenantListItem }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: tenant.colorPrimario || '#14356F' }}
        >
          {tenant.nombreCorto.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{tenant.nombreCorto}</p>
          <p className="text-xs text-muted-foreground">{tenant.subdominio}.saciusag.com.mx</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(tenant.status)}
        <Badge variant="outline">{tenant.plan}</Badge>
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardGlobal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const data = await tenantAdminService.getDashboard()
      setDashboard(data)
    } catch (err) {
      setError('Error al cargar el dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={loadDashboard} variant="outline" className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona todas las escuelas del sistema</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/super-admin/tenants/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Escuela
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Escuelas"
          value={dashboard?.totalTenants || 0}
          icon={Building2}
          description={`${dashboard?.tenantsActivos || 0} activas`}
        />
        <StatCard
          title="Estudiantes Global"
          value={(dashboard?.totalEstudiantesGlobal || 0).toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Usuarios Global"
          value={(dashboard?.totalUsuariosGlobal || 0).toLocaleString()}
          icon={School}
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(dashboard?.ingresosMesGlobal || 0)}
          icon={DollarSign}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ultimas escuelas creadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Escuelas Recientes
            </CardTitle>
            <CardDescription>Últimas escuelas agregadas al sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard?.ultimosTenantsCreados && dashboard.ultimosTenantsCreados.length > 0 ? (
              dashboard.ultimosTenantsCreados.map(tenant => (
                <TenantCard key={tenant.idTenant} tenant={tenant} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay escuelas registradas</p>
            )}
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link href="/dashboard/super-admin/tenants">Ver todas las escuelas</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Escuelas con problemas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Atención Requerida
            </CardTitle>
            <CardDescription>Escuelas suspendidas o por vencer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard?.tenantsConProblemas && dashboard.tenantsConProblemas.length > 0 ? (
              dashboard.tenantsConProblemas.map(tenant => (
                <TenantCard key={tenant.idTenant} tenant={tenant} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <School className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-muted-foreground">Todas las escuelas están al día</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{dashboard?.tenantsActivos || 0}</p>
                <p className="text-sm text-green-600">Escuelas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{dashboard?.tenantsPendientes || 0}</p>
                <p className="text-sm text-amber-600">Pendientes de Activar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{dashboard?.tenantsSuspendidos || 0}</p>
                <p className="text-sm text-red-600">Suspendidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
