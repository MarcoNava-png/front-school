"use client";

import Link from "next/link";

import {
  Clock,
  GraduationCap,
  Calendar,
  DollarSign,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  MapPin,
  User,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlumnoDashboard as AlumnoDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { StatCard, StatGrid } from "../shared/stat-card";

interface AlumnoDashboardProps {
  data: AlumnoDashboardType;
}

function formatTime(timeString: string): string {
  const parts = timeString.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
}

export function AlumnoDashboard({ data }: AlumnoDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Bienvenido, {data.nombreCompleto.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline">{data.matricula}</Badge>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{data.programa}</span>
              <span className="text-muted-foreground">|</span>
              <Badge>Cuatrimestre {data.cuatrimestre}</Badge>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
        </div>
        <Separator />
      </div>

      <StatGrid columns={3}>
        <StatCard
          title="Promedio Actual"
          value={data.promedioActual.toFixed(1)}
          icon={TrendingUp}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Asistencia"
          value={`${data.porcentajeAsistencia}%`}
          icon={CheckCircle}
          gradient={data.porcentajeAsistencia >= 80 ? "from-emerald-500 to-emerald-600" : "from-amber-500 to-amber-600"}
        />
        <StatCard
          title="Estado Financiero"
          value={data.tieneDeuda ? "Con adeudo" : "Al corriente"}
          description={data.tieneDeuda ? `$${data.montoDeuda?.toLocaleString("es-MX")} pendiente` : undefined}
          icon={data.tieneDeuda ? AlertTriangle : CheckCircle}
          gradient={data.tieneDeuda ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600"}
          link={data.tieneDeuda ? "/dashboard/payments" : undefined}
        />
      </StatGrid>

      {data.tieneDeuda && (
        <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Tienes un pago pendiente</p>
                  <p className="text-sm text-muted-foreground">
                    Monto: ${data.montoDeuda?.toLocaleString("es-MX")}
                    {data.proximoVencimiento && (
                      <> | Vence: {new Date(data.proximoVencimiento).toLocaleDateString("es-MX")}</>
                    )}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/payments">
                <Button variant="destructive">Pagar ahora</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            Mi Horario de Hoy
            <Badge variant="outline" className="ml-2">
              {data.horarioHoy.length} clases
            </Badge>
          </CardTitle>
          <CardDescription>Tus clases programadas para hoy</CardDescription>
        </CardHeader>
        <CardContent>
          {data.horarioHoy.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes clases programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.horarioHoy.map((clase) => (
                <div
                  key={clase.idGrupoMateria}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg min-w-[80px]">
                    <span className="text-lg font-bold text-blue-600">{formatTime(clase.horaInicio)}</span>
                    <span className="text-xs text-muted-foreground">a {formatTime(clase.horaFin)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{clase.materia}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {clase.profesor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {clase.aula}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data.calificacionesRecientes.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  Calificaciones Recientes
                </CardTitle>
                <CardDescription>Tus ultimas evaluaciones</CardDescription>
              </div>
              <Link href="/dashboard/grades">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.calificacionesRecientes.map((calificacion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{calificacion.materia}</p>
                    <p className="text-sm text-muted-foreground">{calificacion.tipoEvaluacion}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        calificacion.calificacion >= 70
                          ? "text-emerald-600"
                          : calificacion.calificacion >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {calificacion.calificacion}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(calificacion.fecha).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            Mi Asistencia
          </CardTitle>
          <CardDescription>Tu porcentaje de asistencia en el periodo actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Porcentaje de asistencia</span>
              <span
                className={`text-2xl font-bold ${
                  data.porcentajeAsistencia >= 80
                    ? "text-emerald-600"
                    : data.porcentajeAsistencia >= 70
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {data.porcentajeAsistencia}%
              </span>
            </div>
            <Progress
              value={data.porcentajeAsistencia}
              className={`h-3 ${
                data.porcentajeAsistencia >= 80
                  ? "[&>div]:bg-emerald-500"
                  : data.porcentajeAsistencia >= 70
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-red-500"
              }`}
            />
            {data.porcentajeAsistencia < 80 && (
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
                <AlertTriangle className="h-4 w-4" />
                Recuerda que el minimo de asistencia requerido es 80%
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {data.tramitesDisponibles.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              Tramites Disponibles
            </CardTitle>
            <CardDescription>Documentos y constancias que puedes solicitar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {data.tramitesDisponibles.map((tramite) => (
                <Link key={tramite.clave} href={tramite.link}>
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{tramite.nombre}</h4>
                      <Badge variant="outline">${tramite.precio}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tramite.descripcion}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <AlertCard alerts={data.alertas} title="Tus Avisos" description="Notificaciones importantes para ti" />
    </div>
  );
}
