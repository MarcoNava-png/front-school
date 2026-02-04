"use client"

import { useEffect, useState } from "react"

import {
  DollarSign,
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  reportsAdminService,
  type ResumenEjecutivo,
  type ReporteIngresosGlobal,
  type ReporteEstudiantesGlobal,
  type ReporteLicencias
} from "@/services/reports-admin-service"

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-MX').format(value)
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue"
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: string
  color?: "blue" | "green" | "amber" | "red" | "purple"
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200"
  }

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs mt-1 opacity-80">{description}</p>
        )}
        {trend && (
          <p className="text-xs flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function TenantRankingCard({
  title,
  description,
  data,
  valueKey,
  formatValue
}: {
  title: string
  description: string

  data: Array<{ nombreCorto: string; colorPrimario: string; [key: string]: any }>
  valueKey: string
  formatValue: (val: number) => string
}) {
  const maxValue = Math.max(...data.map(d => d[valueKey] as number))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const value = item[valueKey] as number
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.colorPrimario }}
                  />
                  <span className="font-medium">{item.nombreCorto}</span>
                </div>
                <span className="font-bold">{formatValue(value)}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          )
        })}
        {data.length === 0 && (
          <p className="text-muted-foreground text-center py-4">Sin datos</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<ResumenEjecutivo | null>(null)
  const [ingresos, setIngresos] = useState<ReporteIngresosGlobal | null>(null)
  const [estudiantes, setEstudiantes] = useState<ReporteEstudiantesGlobal | null>(null)
  const [licencias, setLicencias] = useState<ReporteLicencias | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      setLoading(true)
      const [resumenData, ingresosData, estudiantesData, licenciasData] = await Promise.all([
        reportsAdminService.getResumenEjecutivo(),
        reportsAdminService.getReporteIngresos(),
        reportsAdminService.getReporteEstudiantes(),
        reportsAdminService.getReporteLicencias()
      ])
      setResumen(resumenData)
      setIngresos(ingresosData)
      setEstudiantes(estudiantesData)
      setLicencias(licenciasData)
    } catch (err) {
      toast.error('Error al cargar los reportes')
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
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
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
            <BarChart3 className="h-6 w-6" />
            Reportes Globales
          </h1>
          <p className="text-muted-foreground">Metricas consolidadas de todas las escuelas</p>
        </div>
        <Button onClick={loadReports} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Resumen Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Escuelas"
          value={resumen?.totalEscuelas || 0}
          icon={Building2}
          description={`${resumen?.escuelasActivas || 0} activas`}
          color="blue"
        />
        <StatCard
          title="Total Estudiantes"
          value={formatNumber(resumen?.totalEstudiantes || 0)}
          icon={GraduationCap}
          description={`${formatNumber(resumen?.estudiantesActivos || 0)} activos`}
          color="green"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(resumen?.ingresosMesActual || 0)}
          icon={DollarSign}
          description={`Anual: ${formatCurrency(resumen?.ingresosAnioActual || 0)}`}
          color="purple"
        />
        <StatCard
          title="Adeudo Total"
          value={formatCurrency(resumen?.adeudoTotal || 0)}
          icon={AlertTriangle}
          description="Por cobrar"
          color="amber"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ingresos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="ingresos" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Ingresos</span>
          </TabsTrigger>
          <TabsTrigger value="estudiantes" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Estudiantes</span>
          </TabsTrigger>
          <TabsTrigger value="licencias" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Licencias</span>
          </TabsTrigger>
          <TabsTrigger value="uso" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Uso</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Ingresos */}
        <TabsContent value="ingresos" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TenantRankingCard
              title="Ingresos por Escuela (Mes)"
              description="Top escuelas por ingresos este mes"
              data={ingresos?.ingresosPorTenant.slice(0, 5) || []}
              valueKey="ingresosMes"
              formatValue={formatCurrency}
            />
            <TenantRankingCard
              title="Adeudo por Escuela"
              description="Escuelas con mayor adeudo pendiente"
              data={[...(ingresos?.ingresosPorTenant || [])].sort((a, b) => b.adeudo - a.adeudo).slice(0, 5)}
              valueKey="adeudo"
              formatValue={formatCurrency}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle por Escuela</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Escuela</th>
                      <th className="text-right py-3 px-2">Ingresos Mes</th>
                      <th className="text-right py-3 px-2">Ingresos Anio</th>
                      <th className="text-right py-3 px-2">Adeudo</th>
                      <th className="text-right py-3 px-2">Recibos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos?.ingresosPorTenant.map(tenant => (
                      <tr key={tenant.idTenant} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tenant.colorPrimario }}
                            />
                            {tenant.nombreCorto}
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-medium">
                          {formatCurrency(tenant.ingresosMes)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {formatCurrency(tenant.ingresosAnio)}
                        </td>
                        <td className="text-right py-3 px-2 text-amber-600">
                          {formatCurrency(tenant.adeudo)}
                        </td>
                        <td className="text-right py-3 px-2">
                          {tenant.recibosPagados}/{tenant.recibosEmitidos}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estudiantes */}
        <TabsContent value="estudiantes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Estudiantes Activos"
              value={formatNumber(estudiantes?.estudiantesActivos || 0)}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Nuevos Este Mes"
              value={formatNumber(estudiantes?.nuevosEsteMes || 0)}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Inactivos"
              value={formatNumber(estudiantes?.estudiantesInactivos || 0)}
              icon={Users}
              color="amber"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TenantRankingCard
              title="Estudiantes por Escuela"
              description="Distribucion de estudiantes"
              data={estudiantes?.estudiantesPorTenant.slice(0, 5) || []}
              valueKey="totalEstudiantes"
              formatValue={formatNumber}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribucion por Nivel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {estudiantes?.distribucionNivel.map((nivel, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{nivel.nivel}</span>
                      <span className="font-medium">
                        {formatNumber(nivel.total)} ({nivel.porcentaje}%)
                      </span>
                    </div>
                    <Progress value={nivel.porcentaje} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ocupacion por Escuela</CardTitle>
              <CardDescription>Capacidad vs estudiantes actuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estudiantes?.estudiantesPorTenant.map(tenant => (
                  <div key={tenant.idTenant} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tenant.colorPrimario }}
                        />
                        <span className="font-medium">{tenant.nombreCorto}</span>
                      </div>
                      <span>
                        {formatNumber(tenant.totalEstudiantes)} / {formatNumber(tenant.capacidadMaxima)}
                        <Badge
                          variant={tenant.porcentajeOcupacion > 90 ? "destructive" : tenant.porcentajeOcupacion > 70 ? "secondary" : "outline"}
                          className="ml-2"
                        >
                          {tenant.porcentajeOcupacion}%
                        </Badge>
                      </span>
                    </div>
                    <Progress
                      value={tenant.porcentajeOcupacion}
                      className={`h-2 ${tenant.porcentajeOcupacion > 90 ? '[&>div]:bg-red-500' : tenant.porcentajeOcupacion > 70 ? '[&>div]:bg-amber-500' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Licencias */}
        <TabsContent value="licencias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Activas"
              value={licencias?.tenantsActivos || 0}
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Por Vencer"
              value={licencias?.tenantsPorVencer || 0}
              icon={Calendar}
              color="amber"
            />
            <StatCard
              title="Vencidas"
              value={licencias?.tenantsVencidos || 0}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Ingresos Recurrentes"
              value={formatCurrency(licencias?.ingresosRecurrentesMensual || 0)}
              icon={DollarSign}
              description="Mensual estimado"
              color="purple"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  Proximos Vencimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {licencias?.proximosVencimientos.map(lic => (
                    <div
                      key={lic.idTenant}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{lic.nombreCorto}</p>
                        <p className="text-xs text-muted-foreground">{lic.plan}</p>
                      </div>
                      <Badge variant={lic.diasRestantes <= 7 ? "destructive" : lic.diasRestantes <= 30 ? "secondary" : "outline"}>
                        {lic.diasRestantes} dias
                      </Badge>
                    </div>
                  ))}
                  {!licencias?.proximosVencimientos.length && (
                    <p className="text-muted-foreground text-center py-4">
                      No hay vencimientos proximos
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribucion por Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {licencias?.distribucionPlanes.map(plan => (
                  <div key={plan.idPlan} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{plan.nombrePlan}</span>
                      <span>
                        {plan.cantidadTenants} escuelas ({plan.porcentaje}%)
                      </span>
                    </div>
                    <Progress value={plan.porcentaje} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Ingreso mensual: {formatCurrency(plan.ingresoMensual)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Uso */}
        <TabsContent value="uso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso del Sistema</CardTitle>
              <CardDescription>
                Informacion sobre el uso del sistema por las escuelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Los datos de uso detallados requieren configuracion adicional de auditoria.
                <br />
                Consulta el dashboard principal para ver la actividad reciente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
