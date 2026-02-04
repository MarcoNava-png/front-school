"use client";

import {
  Users,
  GraduationCap,
  DollarSign,
  UserCheck,
  School,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AdminDashboard as AdminDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { QuickActions } from "../shared/quick-actions";
import { StatCard, StatGrid } from "../shared/stat-card";

interface AdminDashboardProps {
  data: AdminDashboardType;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Panel de Administrador
            </h1>
            <p className="text-muted-foreground mt-1">Vista completa del sistema USAG</p>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <BarChart3 className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
        <Separator />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Finanzas
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Ingresos Hoy"
            value={`$${data.ingresosDia.toLocaleString("es-MX")}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-emerald-600"
            link="/dashboard/cashier"
          />
          <StatCard
            title="Ingresos del Mes"
            value={`$${data.ingresosMes.toLocaleString("es-MX")}`}
            icon={TrendingUp}
            gradient="from-green-500 to-green-600"
            link="/dashboard/payments"
          />
          <StatCard
            title="Deuda Total"
            value={`$${data.deudaTotal.toLocaleString("es-MX")}`}
            icon={AlertTriangle}
            gradient="from-red-500 to-red-600"
            link="/dashboard/invoices"
          />
          <StatCard
            title="Morosidad"
            value={`${data.porcentajeMorosidad}%`}
            description={`${data.totalMorosos} estudiantes`}
            icon={TrendingDown}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/invoices"
          />
        </StatGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-indigo-600" />
          Admisiones
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Aspirantes Nuevos"
            value={data.aspirantesNuevos}
            description="Este mes"
            icon={UserCheck}
            gradient="from-indigo-500 to-indigo-600"
            link="/dashboard/applicants"
          />
          <StatCard
            title="Conversiones"
            value={data.conversionesDelMes}
            description="Aspirantes inscritos"
            icon={TrendingUp}
            gradient="from-purple-500 to-purple-600"
            link="/dashboard/crm"
          />
          <StatCard
            title="Inscripciones"
            value={data.inscripcionesDelMes}
            description="Este mes"
            icon={GraduationCap}
            gradient="from-blue-500 to-blue-600"
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
        </StatGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Academico
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Estudiantes Activos"
            value={data.estudiantesActivos}
            icon={GraduationCap}
            gradient="from-blue-500 to-blue-600"
            link="/dashboard/students"
          />
          <StatCard
            title="Asistencia Global"
            value={`${data.asistenciaGlobal}%`}
            icon={Users}
            gradient="from-cyan-500 to-cyan-600"
            link="/dashboard/attendances"
          />
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
            icon={AlertTriangle}
            gradient="from-orange-500 to-orange-600"
            link="/dashboard/grades"
          />
        </StatGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <School className="h-5 w-5 text-slate-600" />
          Sistema
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Total Usuarios"
            value={data.totalUsuarios}
            icon={Users}
            gradient="from-slate-500 to-slate-600"
            link="/dashboard/users"
          />
          <StatCard
            title="Grupos Activos"
            value={data.gruposActivos}
            icon={School}
            gradient="from-teal-500 to-teal-600"
            link="/dashboard/groups"
          />
          <StatCard
            title="Profesores Activos"
            value={data.profesoresActivos}
            icon={Users}
            gradient="from-indigo-500 to-indigo-600"
            link="/dashboard/teachers"
          />
        </StatGrid>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard alerts={data.alertas} title="Alertas del Sistema" description="Situaciones que requieren atencion" />
        <QuickActions actions={data.accionesRapidas} />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Indicadores Clave</CardTitle>
          <CardDescription>Resumen del estado general del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasa de Asistencia</span>
              <span className="font-medium">{data.asistenciaGlobal}%</span>
            </div>
            <Progress value={data.asistenciaGlobal} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Morosidad</span>
              <span className="font-medium text-amber-600">{data.porcentajeMorosidad}%</span>
            </div>
            <Progress value={data.porcentajeMorosidad} className="h-2 [&>div]:bg-amber-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasa de Aprobacion</span>
              <span className="font-medium text-emerald-600">{100 - data.tasaReprobacion}%</span>
            </div>
            <Progress value={100 - data.tasaReprobacion} className="h-2 [&>div]:bg-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
