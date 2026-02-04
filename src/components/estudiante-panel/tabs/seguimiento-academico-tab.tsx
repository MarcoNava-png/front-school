"use client";

import { useState, useEffect, useMemo } from "react";

import { Download, ChevronDown, ChevronRight, BookOpen, Award, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerSeguimientoAcademico } from "@/services/estudiante-panel-service";
import type {
  ResumenKardexDto,
  SeguimientoAcademicoDto,
  PeriodoAcademicoDetalleDto,
  MateriaDetalleDto,
} from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { ESTATUS_COLORS, getCalificacionColor } from "@/types/estudiante-panel";

interface SeguimientoAcademicoTabProps {
  idEstudiante: number;
  resumenKardex: ResumenKardexDto;
}

export function SeguimientoAcademicoTab({
  idEstudiante,
  resumenKardex,
}: SeguimientoAcademicoTabProps) {
  const [seguimiento, setSeguimiento] = useState<SeguimientoAcademicoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstatus, setFiltroEstatus] = useState<string>("todos");
  const [periodosAbiertos, setPeriodosAbiertos] = useState<Set<number>>(new Set());

  useEffect(() => {
    cargarSeguimiento();
  }, [idEstudiante]);

  const cargarSeguimiento = async () => {
    try {
      setLoading(true);
      const data = await obtenerSeguimientoAcademico(idEstudiante);
      setSeguimiento(data);

      const periodoActual = data.periodos.find((p) => p.esActual);
      if (periodoActual) {
        setPeriodosAbiertos(new Set([periodoActual.idPeriodoAcademico]));
      }
    } catch (error) {
      console.error("Error al cargar seguimiento:", error);
      toast.error("No se pudo cargar el seguimiento detallado");
    } finally {
      setLoading(false);
    }
  };

  const togglePeriodo = (idPeriodo: number) => {
    setPeriodosAbiertos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idPeriodo)) {
        newSet.delete(idPeriodo);
      } else {
        newSet.add(idPeriodo);
      }
      return newSet;
    });
  };

  const filtrarMaterias = (materias: MateriaDetalleDto[]) => {
    if (filtroEstatus === "todos") return materias;
    return materias.filter((m) => m.estatus === filtroEstatus);
  };

  const getEstatusIcon = (estatus: string) => {
    switch (estatus) {
      case "Aprobada":
        return <Award className="w-4 h-4 text-green-600" />;
      case "Reprobada":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "Cursando":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstatusBadge = (estatus: string) => {
    const colors = ESTATUS_COLORS[estatus] || ESTATUS_COLORS["Pendiente"];
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
        {estatus}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: "#14356F" }} />
            Resumen Académico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold" style={{ color: "#14356F" }}>
                {resumenKardex.promedioGeneral.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Promedio</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">
                {resumenKardex.materiasAprobadas}
              </p>
              <p className="text-xs text-gray-500">Aprobadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-600">
                {resumenKardex.materiasReprobadas}
              </p>
              <p className="text-xs text-gray-500">Reprobadas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-600">
                {resumenKardex.materiasCursando}
              </p>
              <p className="text-xs text-gray-500">Cursando</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-700">
                {resumenKardex.materiasPendientes}
              </p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50">
              <p className="text-2xl font-bold text-purple-600">
                {resumenKardex.porcentajeAvance.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">Avance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filtroEstatus} onValueChange={setFiltroEstatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las materias</SelectItem>
              <SelectItem value="Aprobada">Aprobadas</SelectItem>
              <SelectItem value="Reprobada">Reprobadas</SelectItem>
              <SelectItem value="Cursando">Cursando</SelectItem>
              <SelectItem value="Pendiente">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {seguimiento?.periodos.length ? (
        <div className="space-y-4">
          {seguimiento.periodos.map((periodo) => (
            <PeriodoCard
              key={periodo.idPeriodoAcademico}
              periodo={periodo}
              isOpen={periodosAbiertos.has(periodo.idPeriodoAcademico)}
              onToggle={() => togglePeriodo(periodo.idPeriodoAcademico)}
              materiasFiltradas={filtrarMaterias(periodo.materias)}
              getEstatusIcon={getEstatusIcon}
              getEstatusBadge={getEstatusBadge}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas Materias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-center">Calificación</TableHead>
                  <TableHead className="text-center">Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumenKardex.ultimasMaterias.map((materia, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {materia.claveMateria}
                    </TableCell>
                    <TableCell>{materia.nombreMateria}</TableCell>
                    <TableCell className={`text-center font-semibold ${getCalificacionColor(materia.calificacionFinal)}`}>
                      {materia.calificacionFinal?.toFixed(1) || "--"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getEstatusBadge(materia.estatus)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PeriodoCardProps {
  periodo: PeriodoAcademicoDetalleDto;
  isOpen: boolean;
  onToggle: () => void;
  materiasFiltradas: MateriaDetalleDto[];
  getEstatusIcon: (estatus: string) => React.ReactNode;
  getEstatusBadge: (estatus: string) => React.ReactNode;
}

function PeriodoCard({
  periodo,
  isOpen,
  onToggle,
  materiasFiltradas,
  getEstatusIcon,
  getEstatusBadge,
}: PeriodoCardProps) {
  return (
    <Card className={periodo.esActual ? "ring-2 ring-blue-200" : ""}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {periodo.nombre}
                    {periodo.esActual && (
                      <Badge className="bg-blue-100 text-blue-800">Actual</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {periodo.clave} • {periodo.materias.length} materias
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg" style={{ color: "#14356F" }}>
                    {periodo.promedioDelPeriodo.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Promedio</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-700">
                    {periodo.creditosDelPeriodo}
                  </p>
                  <p className="text-xs text-gray-500">Créditos</p>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-green-100 text-green-800">
                    {periodo.estadisticas.materiasAprobadas}
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    {periodo.estadisticas.materiasReprobadas}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {periodo.estadisticas.materiasCursando}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Clave</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-center w-20">Créditos</TableHead>
                  <TableHead className="text-center w-16">P1</TableHead>
                  <TableHead className="text-center w-16">P2</TableHead>
                  <TableHead className="text-center w-16">P3</TableHead>
                  <TableHead className="text-center w-20">Final</TableHead>
                  <TableHead className="text-center w-24">Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiasFiltradas.length > 0 ? (
                  materiasFiltradas.map((materia) => (
                    <TableRow key={materia.idInscripcion}>
                      <TableCell className="font-mono text-sm">
                        {materia.claveMateria}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{materia.nombreMateria}</p>
                          {materia.profesor && (
                            <p className="text-xs text-gray-500">{materia.profesor}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{materia.creditos}</TableCell>
                      <TableCell className={`text-center ${getCalificacionColor(materia.parciales.p1)}`}>
                        {materia.parciales.p1?.toFixed(1) || "--"}
                      </TableCell>
                      <TableCell className={`text-center ${getCalificacionColor(materia.parciales.p2)}`}>
                        {materia.parciales.p2?.toFixed(1) || "--"}
                      </TableCell>
                      <TableCell className={`text-center ${getCalificacionColor(materia.parciales.p3)}`}>
                        {materia.parciales.p3?.toFixed(1) || "--"}
                      </TableCell>
                      <TableCell className={`text-center font-bold ${getCalificacionColor(materia.calificacionFinal)}`}>
                        {materia.calificacionFinal?.toFixed(1) || "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstatusBadge(materia.estatus)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No hay materias que coincidan con el filtro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
