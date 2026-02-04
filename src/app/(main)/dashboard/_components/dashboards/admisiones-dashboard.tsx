"use client";

import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AdmisionesDashboard as AdmisionesDashboardType } from "@/types/dashboard";

import { AlertCard } from "../shared/alert-card";
import { QuickActions } from "../shared/quick-actions";
import { StatCard, StatGrid } from "../shared/stat-card";

interface AdmisionesDashboardProps {
  data: AdmisionesDashboardType;
}

export function AdmisionesDashboard({ data }: AdmisionesDashboardProps) {
  const maxFunnel = Math.max(
    data.funnel.nuevo,
    data.funnel.contactado,
    data.funnel.cita,
    data.funnel.examen,
    data.funnel.aceptado,
    data.funnel.inscrito,
    1
  );

  const funnelStages = [
    { label: "Nuevo", value: data.funnel.nuevo, color: "bg-slate-500" },
    { label: "Contactado", value: data.funnel.contactado, color: "bg-blue-500" },
    { label: "Cita", value: data.funnel.cita, color: "bg-indigo-500" },
    { label: "Examen", value: data.funnel.examen, color: "bg-violet-500" },
    { label: "Aceptado", value: data.funnel.aceptado, color: "bg-purple-500" },
    { label: "Inscrito", value: data.funnel.inscrito, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent">
              Panel de Admisiones
            </h1>
            <p className="text-muted-foreground mt-1">Seguimiento de prospectos y conversiones</p>
          </div>
          <Badge variant="outline" className="text-indigo-600 border-indigo-600">
            <UserPlus className="h-3 w-3 mr-1" />
            Admisiones
          </Badge>
        </div>
        <Separator />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Prospectos
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Prospectos Hoy"
            value={data.prospectosHoy}
            icon={UserPlus}
            gradient="from-indigo-500 to-indigo-600"
            link="/dashboard/applicants"
          />
          <StatCard
            title="Prospectos Semana"
            value={data.prospectosSemana}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            link="/dashboard/applicants"
          />
          <StatCard
            title="Prospectos del Mes"
            value={data.prospectosDelMes}
            icon={TrendingUp}
            gradient="from-purple-500 to-purple-600"
            link="/dashboard/applicants"
          />
        </StatGrid>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <Target className="h-5 w-5" />
            </div>
            Funnel de Conversion
          </CardTitle>
          <CardDescription>Estado actual de los aspirantes en el proceso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelStages.map((stage, index) => (
              <div key={stage.label} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{stage.label}</div>
                <div className="flex-1 flex items-center gap-3">
                  <Progress
                    value={(stage.value / maxFunnel) * 100}
                    className={`h-6 flex-1 [&>div]:${stage.color}`}
                  />
                  <Badge variant="outline" className="min-w-[60px] justify-center">
                    {stage.value}
                  </Badge>
                </div>
                {index < funnelStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Conversiones del Mes</p>
              <p className="text-3xl font-bold text-emerald-600">{data.conversionesDelMes}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Tasa de Conversion</p>
              <p className="text-3xl font-bold text-indigo-600">{data.tasaConversion}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Citas y Documentos
        </h2>
        <StatGrid columns={3}>
          <StatCard
            title="Citas Hoy"
            value={data.citasHoy}
            icon={Calendar}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Citas Pendientes"
            value={data.citasPendientes}
            icon={Phone}
            gradient="from-amber-500 to-amber-600"
          />
          <StatCard
            title="Documentos Pendientes"
            value={data.documentosPendientesAdmision}
            description="Por revisar"
            icon={FileText}
            gradient="from-rose-500 to-rose-600"
            link="/dashboard/applicants"
          />
        </StatGrid>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            Metricas de Conversion
          </CardTitle>
          <CardDescription>Indicadores de desempeno del proceso de admision</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasa de Conversion General</span>
              <span className="font-medium">{data.tasaConversion}%</span>
            </div>
            <Progress value={data.tasaConversion} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Contacto a Cita</span>
              <span className="font-medium">
                {data.funnel.contactado > 0
                  ? Math.round((data.funnel.cita / data.funnel.contactado) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                data.funnel.contactado > 0 ? (data.funnel.cita / data.funnel.contactado) * 100 : 0
              }
              className="h-2 [&>div]:bg-indigo-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Aceptado a Inscrito</span>
              <span className="font-medium text-emerald-600">
                {data.funnel.aceptado > 0
                  ? Math.round((data.funnel.inscrito / data.funnel.aceptado) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                data.funnel.aceptado > 0 ? (data.funnel.inscrito / data.funnel.aceptado) * 100 : 0
              }
              className="h-2 [&>div]:bg-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard
          alerts={data.alertas}
          title="Alertas de Seguimiento"
          description="Aspirantes que requieren atencion"
        />
        <QuickActions actions={data.accionesRapidas} />
      </div>
    </div>
  );
}
