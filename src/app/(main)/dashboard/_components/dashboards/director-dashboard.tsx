"use client";

import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DirectorDashboard as DirectorDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { StatCard, StatGrid } from "../shared/stat-card";

interface DirectorDashboardProps {
  data: DirectorDashboardType;
}

export function DirectorDashboard({ data }: DirectorDashboardProps) {
  const isTrendPositive = data.tendenciaEstudiantes.startsWith("+");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-800 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent">
              Panel de Director
            </h1>
            <p className="text-muted-foreground mt-1">Vision ejecutiva de la institucion</p>
          </div>
          <Badge variant="outline" className="text-violet-600 border-violet-600">
            <Building2 className="h-3 w-3 mr-1" />
            Director
          </Badge>
        </div>
        <Separator />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Estudiantes
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Estudiantes Activos"
            value={data.estudiantesActivos}
            trend={data.tendenciaEstudiantes}
            trendUp={isTrendPositive}
            icon={GraduationCap}
            gradient="from-blue-500 to-blue-600"
            link="/dashboard/students"
          />
          <StatCard
            title="Inscripciones"
            value={data.inscripcionesDelMes}
            description="Este mes"
            icon={TrendingUp}
            gradient="from-emerald-500 to-emerald-600"
            link="/dashboard/inscriptions"
          />
          <StatCard
            title="Bajas"
            value={data.bajasDelMes}
            description="Este mes"
            icon={TrendingDown}
            gradient="from-rose-500 to-rose-600"
            link="/dashboard/students"
          />
          <StatCard
            title="Retencion"
            value={`${(100 - (data.bajasDelMes / Math.max(data.estudiantesActivos, 1)) * 100).toFixed(1)}%`}
            icon={Users}
            gradient="from-cyan-500 to-cyan-600"
          />
        </StatGrid>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Finanzas (Resumen)
        </h2>
        <StatGrid columns={2}>
          <StatCard
            title="Ingresos Mensuales"
            value={`$${data.ingresosMensuales.toLocaleString("es-MX")}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Morosidad"
            value={`${data.porcentajeMorosidad}%`}
            description="Estudiantes con adeudo"
            icon={BarChart3}
            gradient="from-amber-500 to-amber-600"
          />
        </StatGrid>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-violet-600" />
          Academico
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Promedio General"
            value={data.promedioGeneral.toFixed(1)}
            icon={BarChart3}
            gradient="from-violet-500 to-violet-600"
            link="/dashboard/grades"
          />
          <StatCard
            title="Tasa Reprobacion"
            value={`${data.tasaReprobacion}%`}
            icon={TrendingDown}
            gradient="from-orange-500 to-orange-600"
            link="/dashboard/grades"
          />
          <StatCard
            title="Asistencia Global"
            value={`${data.asistenciaGlobal}%`}
            icon={Users}
            gradient="from-cyan-500 to-cyan-600"
            link="/dashboard/attendances"
          />
        </StatGrid>
      </div>
      {data.programasResumen.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              Programas Academicos
            </CardTitle>
            <CardDescription>Estado de los programas activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.programasResumen.map((programa) => (
                <div key={programa.idPlanEstudios} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{programa.nombre}</h4>
                    <Badge variant="outline">{programa.totalEstudiantes} estudiantes</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tasa de Retencion:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={programa.tasaRetencion} className="h-2 flex-1" />
                        <span className="font-medium text-emerald-600">{programa.tasaRetencion}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Promedio:</span>
                      <span className="font-medium ml-2">{programa.promedioGeneral.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Indicadores Institucionales</CardTitle>
            <CardDescription>Metricas clave de desempeno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Asistencia Global</span>
                <span className="font-medium">{data.asistenciaGlobal}%</span>
              </div>
              <Progress value={data.asistenciaGlobal} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tasa de Aprobacion</span>
                <span className="font-medium text-emerald-600">{100 - data.tasaReprobacion}%</span>
              </div>
              <Progress value={100 - data.tasaReprobacion} className="h-2 [&>div]:bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Salud Financiera</span>
                <span className="font-medium text-blue-600">{100 - data.porcentajeMorosidad}%</span>
              </div>
              <Progress value={100 - data.porcentajeMorosidad} className="h-2 [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <AlertCard
          alerts={data.alertas}
          title="Alertas Institucionales"
          description="Situaciones que requieren atencion directiva"
        />
      </div>
    </div>
  );
}
