"use client";

import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Building, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EstudiantePanelDto } from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { formatDate } from "@/types/estudiante-panel";

interface PanelHeaderProps {
  panel: EstudiantePanelDto;
}

export function PanelHeader({ panel }: PanelHeaderProps) {
  const iniciales = panel.nombreCompleto
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
      />
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
              <AvatarImage src={panel.fotografia || undefined} alt={panel.nombreCompleto} />
              <AvatarFallback
                className="text-2xl font-bold text-white"
                style={{ backgroundColor: "#14356F" }}
              >
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <Badge
              variant={panel.activo ? "default" : "secondary"}
              className={`${
                panel.activo
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }`}
            >
              {panel.activo ? "● Activo" : "○ Inactivo"}
            </Badge>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{panel.nombreCompleto}</h2>
              <p className="text-lg font-medium" style={{ color: "#14356F" }}>
                Matrícula: {panel.matricula}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {panel.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{panel.email}</span>
                </div>
              )}
              {panel.telefono && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{panel.telefono}</span>
                </div>
              )}
              {panel.curp && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-mono">{panel.curp}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-5 h-5 mt-0.5" style={{ color: "#14356F" }} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Carrera</p>
                    <p className="text-sm font-medium text-gray-900">
                      {panel.informacionAcademica.planEstudios || "No asignado"}
                    </p>
                    {panel.informacionAcademica.rvoe && (
                      <p className="text-xs text-gray-500">RVOE: {panel.informacionAcademica.rvoe}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building className="w-5 h-5 mt-0.5" style={{ color: "#14356F" }} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Campus</p>
                    <p className="text-sm font-medium text-gray-900">
                      {panel.informacionAcademica.campus || "No asignado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 mt-0.5" style={{ color: "#14356F" }} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Grupo / Turno</p>
                    <p className="text-sm font-medium text-gray-900">
                      {panel.informacionAcademica.grupoActual?.codigoGrupo || "Sin grupo"}
                      {panel.informacionAcademica.turno && ` • ${panel.informacionAcademica.turno}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 mt-0.5" style={{ color: "#14356F" }} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Ingreso</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(panel.informacionAcademica.fechaIngreso)}
                    </p>
                  </div>
                </div>
              </div>

              {panel.informacionAcademica.periodoActual && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "rgba(20, 53, 111, 0.05)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Período Actual</p>
                      <p className="text-sm font-semibold" style={{ color: "#14356F" }}>
                        {panel.informacionAcademica.periodoActual.nombre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(panel.informacionAcademica.periodoActual.fechaInicio)} -{" "}
                        {formatDate(panel.informacionAcademica.periodoActual.fechaFin)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
