"use client";

import Link from "next/link";

import {
  Clock,
  ClipboardList,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  BookOpen,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DocenteDashboard as DocenteDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { StatCard, StatGrid } from "../shared/stat-card";

interface DocenteDashboardProps {
  data: DocenteDashboardType;
}

function formatTime(timeString: string): string {
  const parts = timeString.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
}

export function DocenteDashboard({ data }: DocenteDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
              Panel del Docente
            </h1>
            <p className="text-muted-foreground mt-1">Tu agenda y pendientes del dia</p>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <BookOpen className="h-3 w-3 mr-1" />
            Docente
          </Badge>
        </div>
        <Separator />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-orange-600" />
          Pendientes
        </h2>
        <StatGrid columns={2}>
          <StatCard
            title="Asistencias por Pasar"
            value={data.asistenciasPorPasar}
            description="Clases sin registro"
            icon={ClipboardList}
            gradient="from-amber-500 to-amber-600"
            link="/dashboard/attendances"
          />
          <StatCard
            title="Evaluaciones Pendientes"
            value={data.evaluacionesPendientes}
            description="Grupos sin calificaciones"
            icon={AlertCircle}
            gradient="from-rose-500 to-rose-600"
            link="/dashboard/grades"
          />
        </StatGrid>
      </div>
      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            Clases de Hoy
            <Badge variant="outline" className="ml-2">
              {data.clasesDeHoy.length} clases
            </Badge>
          </CardTitle>
          <CardDescription>Tu agenda para el dia de hoy</CardDescription>
        </CardHeader>
        <CardContent>
          {data.clasesDeHoy.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes clases programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.clasesDeHoy.map((clase) => (
                <div
                  key={clase.idGrupoMateria}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg min-w-[80px]">
                    <span className="text-lg font-bold text-orange-600">{formatTime(clase.horaInicio)}</span>
                    <span className="text-xs text-muted-foreground">a {formatTime(clase.horaFin)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{clase.materia}</h4>
                    <p className="text-sm text-muted-foreground">{clase.grupo}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {clase.aula}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {clase.totalEstudiantes} estudiantes
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/attendances?grupo=${clase.idGrupoMateria}`}>
                      <Button variant="outline" size="sm">
                        Asistencia
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {data.misGrupos.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <Users className="h-5 w-5" />
              </div>
              Mis Grupos
              <Badge variant="outline" className="ml-2">
                {data.misGrupos.length}
              </Badge>
            </CardTitle>
            <CardDescription>Estado de tus grupos asignados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {data.misGrupos.map((grupo) => (
                <div
                  key={grupo.idGrupoMateria}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{grupo.materia}</h4>
                    {grupo.tieneCalificacionesPendientes ? (
                      <Badge variant="destructive">Pendiente</Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600">
                        Al dia
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{grupo.grupo}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estudiantes:</span>
                      <span className="font-medium">{grupo.totalEstudiantes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Promedio:</span>
                      <span className="font-medium">{grupo.promedioGrupo.toFixed(1)}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Asistencia:</span>
                        <span className="font-medium">{grupo.porcentajeAsistencia}%</span>
                      </div>
                      <Progress value={grupo.porcentajeAsistencia} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.fechasCierreCalificaciones.length > 0 && (
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <Clock className="h-5 w-5" />
              </div>
              Fechas Importantes
            </CardTitle>
            <CardDescription>Proximos cierres y entregas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.fechasCierreCalificaciones.map((fecha, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-background border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{fecha.descripcion}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fecha.fecha).toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={fecha.diasRestantes <= 3 ? "destructive" : "secondary"}
                    className="min-w-[80px] justify-center"
                  >
                    {fecha.diasRestantes} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <AlertCard alerts={data.alertas} title="Tus Alertas" description="Recordatorios y pendientes" />
    </div>
  );
}
