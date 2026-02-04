"use client";

import Link from "next/link";

import {
  Users,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoordinadorDashboard as CoordinadorDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { QuickActions } from "../shared/quick-actions";
import { StatCard, StatGrid } from "../shared/stat-card";

interface CoordinadorDashboardProps {
  data: CoordinadorDashboardType;
}

export function CoordinadorDashboard({ data }: CoordinadorDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent">
              Panel de Coordinador
            </h1>
            <p className="text-muted-foreground mt-1">Supervision academica y seguimiento docente</p>
          </div>
          <Badge variant="outline" className="text-teal-600 border-teal-600">
            <BookOpen className="h-3 w-3 mr-1" />
            Coordinador
          </Badge>
        </div>
        <Separator />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-teal-600" />
          Indicadores Academicos
        </h2>
        <StatGrid columns={4}>
          <StatCard
            title="Asistencia Promedio"
            value={`${data.asistenciaPromedio}%`}
            icon={UserCheck}
            gradient="from-teal-500 to-teal-600"
            link="/dashboard/attendances"
          />
          <StatCard
            title="Calif. Pendientes"
            value={data.calificacionesPendientes}
            description="Grupos sin calificaciones"
            icon={ClipboardList}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/grades"
          />
          <StatCard
            title="Tasa Reprobacion"
            value={`${data.tasaReprobacionPorMateria}%`}
            icon={AlertTriangle}
            gradient="from-rose-500 to-rose-600"
            link="/dashboard/grades"
          />
          <StatCard
            title="Total Docentes"
            value={data.totalDocentes}
            description="Profesores activos"
            icon={Users}
            gradient="from-indigo-500 to-indigo-600"
            link="/dashboard/teachers"
          />
        </StatGrid>
      </div>
      {data.gruposEnRiesgo.length > 0 && (
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Grupos en Riesgo
              <Badge variant="destructive" className="ml-2">
                {data.gruposEnRiesgo.length}
              </Badge>
            </CardTitle>
            <CardDescription>Grupos con baja asistencia (menor a 80%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.gruposEnRiesgo.map((grupo) => (
                <div
                  key={grupo.idGrupo}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{grupo.nombreGrupo}</p>
                    <p className="text-sm text-muted-foreground">
                      {grupo.estudiantesEnRiesgo} estudiantes en este grupo
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Asistencia</p>
                      <p
                        className={`font-bold ${grupo.porcentajeAsistencia < 70 ? "text-red-600" : "text-amber-600"}`}
                      >
                        {grupo.porcentajeAsistencia}%
                      </p>
                    </div>
                    <Progress
                      value={grupo.porcentajeAsistencia}
                      className="w-24 h-2 [&>div]:bg-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.docentesConEntregasPendientes.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  Docentes con Pendientes
                </CardTitle>
                <CardDescription>Profesores con entregas por realizar</CardDescription>
              </div>
              <Link href="/dashboard/teachers">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Docente</TableHead>
                  <TableHead className="text-center">Calificaciones</TableHead>
                  <TableHead className="text-center">Asistencias</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.docentesConEntregasPendientes.map((docente) => (
                  <TableRow key={docente.idProfesor}>
                    <TableCell className="font-medium">{docente.nombreCompleto}</TableCell>
                    <TableCell className="text-center">
                      {docente.calificacionesPendientes > 0 ? (
                        <Badge variant="destructive">{docente.calificacionesPendientes}</Badge>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {docente.asistenciasPendientes > 0 ? (
                        <Badge variant="secondary">{docente.asistenciasPendientes}</Badge>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {docente.calificacionesPendientes > 0 || docente.asistenciasPendientes > 0 ? (
                        <Badge variant="outline" className="text-amber-600">
                          Pendiente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600">
                          Al dia
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.misGrupos.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              Grupos Asignados
              <Badge variant="outline" className="ml-2">
                {data.gruposAsignados}
              </Badge>
            </CardTitle>
            <CardDescription>Resumen de los grupos bajo coordinacion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data.misGrupos.map((grupo) => (
                <div
                  key={grupo.idGrupo}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{grupo.nombre}</h4>
                    <Badge variant="outline">C{grupo.cuatrimestre}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{grupo.programa}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estudiantes:</span>
                    <span className="font-medium">{grupo.totalEstudiantes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Promedio:</span>
                    <span className="font-medium">{grupo.promedioGeneral.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard
          alerts={data.alertas}
          title="Alertas Academicas"
          description="Situaciones que requieren seguimiento"
        />
        <QuickActions actions={data.accionesRapidas} />
      </div>
    </div>
  );
}
