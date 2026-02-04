"use client";

import { TrendingUp, BookOpen, DollarSign, Award, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { EstudiantePanelDto } from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { formatCurrency } from "@/types/estudiante-panel";

interface PanelStatsCardsProps {
  panel: EstudiantePanelDto;
}

export function PanelStatsCards({ panel }: PanelStatsCardsProps) {
  const { resumenKardex, resumenRecibos, becas } = panel;

  const becaActiva = becas.find((b) => b.activo && b.estaVigente);
  const descuentoBeca = becaActiva
    ? becaActiva.tipo === "PORCENTAJE"
      ? `${becaActiva.valor}%`
      : formatCurrency(becaActiva.valor)
    : null;

  const stats = [
    {
      title: "Promedio General",
      value: resumenKardex.promedioGeneral.toFixed(1),
      subtitle: resumenKardex.estatusAcademico,
      icon: TrendingUp,
      color: resumenKardex.promedioGeneral >= 8
        ? "text-green-600"
        : resumenKardex.promedioGeneral >= 7
          ? "text-blue-600"
          : "text-yellow-600",
      bgColor: resumenKardex.promedioGeneral >= 8
        ? "bg-green-50"
        : resumenKardex.promedioGeneral >= 7
          ? "bg-blue-50"
          : "bg-yellow-50",
    },
    {
      title: "Avance Académico",
      value: `${resumenKardex.porcentajeAvance.toFixed(0)}%`,
      subtitle: `${resumenKardex.creditosCursados} / ${resumenKardex.creditosTotales} créditos`,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Adeudo Pendiente",
      value: formatCurrency(resumenRecibos.totalAdeudo),
      subtitle: resumenRecibos.recibosVencidos > 0
        ? `${resumenRecibos.recibosVencidos} vencido(s)`
        : `${resumenRecibos.recibosPendientes} pendiente(s)`,
      icon: resumenRecibos.recibosVencidos > 0 ? AlertTriangle : DollarSign,
      color: resumenRecibos.totalAdeudo > 0
        ? resumenRecibos.recibosVencidos > 0
          ? "text-red-600"
          : "text-yellow-600"
        : "text-green-600",
      bgColor: resumenRecibos.totalAdeudo > 0
        ? resumenRecibos.recibosVencidos > 0
          ? "bg-red-50"
          : "bg-yellow-50"
        : "bg-green-50",
    },
    {
      title: "Beca Activa",
      value: descuentoBeca || "Sin beca",
      subtitle: becaActiva?.nombreBeca || "No tiene beca asignada",
      icon: Award,
      color: becaActiva ? "text-purple-600" : "text-gray-400",
      bgColor: becaActiva ? "bg-purple-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
