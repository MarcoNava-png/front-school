"use client";

import {
  Users,
  GraduationCap,
  FileText,
  School,
  Calendar,
  TrendingDown,
  UserPlus,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ControlEscolarDashboard as ControlEscolarDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { QuickActions } from "../shared/quick-actions";
import { StatCard, StatGrid } from "../shared/stat-card";

interface ControlEscolarDashboardProps {
  data: ControlEscolarDashboardType;
}

export function ControlEscolarDashboard({ data }: ControlEscolarDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-cyan-800 dark:from-cyan-400 dark:to-cyan-600 bg-clip-text text-transparent">
              Panel de Control Escolar
            </h1>
            <p className="text-muted-foreground mt-1">Gestion de inscripciones y documentos</p>
          </div>
          <Badge variant="outline" className="text-cyan-600 border-cyan-600">
            <School className="h-3 w-3 mr-1" />
            Control Escolar
          </Badge>
        </div>
        <Separator />
      </div>

      {data.periodoActual && (
        <Card className="border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Periodo Academico Actual
                </CardTitle>
                <CardDescription className="text-base">{data.periodoActual.nombre}</CardDescription>
              </div>
              <Badge className={data.periodoActual.esActivo ? "bg-emerald-600" : "bg-amber-600"}>
                {data.periodoActual.esActivo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                <p className="text-lg font-semibold">
                  {new Date(data.periodoActual.fechaInicio).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fecha de termino</p>
                <p className="text-lg font-semibold">
                  {new Date(data.periodoActual.fechaFin).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Dias restantes</p>
                <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                  {data.periodoActual.diasRestantes} dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          Inscripciones
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Inscripciones Hoy"
            value={data.inscripcionesHoy}
            icon={UserPlus}
            gradient="from-blue-500 to-blue-600"
            link="/dashboard/inscriptions"
          />
          <StatCard
            title="Inscripciones Semana"
            value={data.inscripcionesSemana}
            icon={GraduationCap}
            gradient="from-indigo-500 to-indigo-600"
            link="/dashboard/inscriptions"
          />
          <StatCard
            title="Bajas del Mes"
            value={data.bajasDelMes}
            icon={TrendingDown}
            gradient="from-rose-500 to-rose-600"
            link="/dashboard/students"
          />
          <StatCard
            title="Cambios de Grupo"
            value={data.cambiosGrupo}
            icon={Users}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/group-enrollment"
          />
        </StatGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Documentos y Expedientes
        </h2>
        <StatGrid columns={2}>
          <StatCard
            title="Documentos Pendientes"
            value={data.documentosPendientes}
            description="Por revisar/validar"
            icon={FileText}
            gradient="from-purple-500 to-purple-600"
            link="/dashboard/applicants"
          />
          <StatCard
            title="Expedientes Incompletos"
            value={data.expedientesIncompletos}
            description="Aspirantes sin documentos completos"
            icon={FolderOpen}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/applicants"
          />
        </StatGrid>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <School className="h-5 w-5 text-teal-600" />
          Grupos
        </h2>
        <StatGrid columns={2}>
          <StatCard
            title="Grupos Activos"
            value={data.gruposActivos}
            icon={School}
            gradient="from-teal-500 to-teal-600"
            link="/dashboard/groups"
          />
          <StatCard
            title="Sin Profesor Asignado"
            value={data.gruposSinProfesor}
            description="Materias sin docente"
            icon={AlertTriangle}
            gradient="from-red-500 to-red-600"
            link="/dashboard/academic-management"
          />
        </StatGrid>
      </div>

      {data.estudiantesPorPrograma.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              Estudiantes por Programa
            </CardTitle>
            <CardDescription>Distribucion de la matricula activa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.estudiantesPorPrograma.map((programa) => {
                const maxEstudiantes = Math.max(...data.estudiantesPorPrograma.map((p) => p.totalEstudiantes));
                const porcentaje = (programa.totalEstudiantes / maxEstudiantes) * 100;

                return (
                  <div key={programa.idPlanEstudios} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{programa.nombrePrograma}</span>
                      <Badge variant="secondary">{programa.totalEstudiantes} estudiantes</Badge>
                    </div>
                    <Progress value={porcentaje} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard
          alerts={data.alertas}
          title="Alertas de Control Escolar"
          description="Situaciones que requieren atencion"
        />
        <QuickActions actions={data.accionesRapidas} />
      </div>
    </div>
  );
}
