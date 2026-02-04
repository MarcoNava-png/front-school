"use client";

import { useState, useEffect } from "react";

import { ChevronDown, ChevronRight, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAcademicManagement, getGroupSubjects } from "@/services/groups-service";
import type { GrupoMateria } from "@/types/group";

import { TablaCalificacionesMatricial } from "./tabla-calificaciones-matricial";

interface GruposAcordeonProps {
  planEstudiosId: number;
}

interface GrupoConMaterias {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  turno: string;
  periodoAcademico: string;
  totalEstudiantes: number;
  capacidadMaxima: number;
  numeroCuatrimestre: number;
  materias: GrupoMateria[];
}

export function GruposAcordeon({ planEstudiosId }: GruposAcordeonProps) {
  const [loading, setLoading] = useState(false);
  const [grupos, setGrupos] = useState<GrupoConMaterias[]>([]);
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<number>>(new Set());
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<{
    grupoMateriaId: number;
    nombreGrupo: string;
    nombreMateria: string;
  } | null>(null);

  useEffect(() => {
    loadGrupos();
  }, [planEstudiosId]);

  const loadGrupos = async () => {
    setLoading(true);
    try {
      const gestionAcademica = await getAcademicManagement(planEstudiosId);

      const gruposConMaterias: GrupoConMaterias[] = [];

      for (const cuatrimestre of gestionAcademica.gruposPorCuatrimestre) {
        for (const grupo of cuatrimestre.grupos) {
          try {
            const materias = await getGroupSubjects(grupo.idGrupo);

            gruposConMaterias.push({
              ...grupo,
              numeroCuatrimestre: cuatrimestre.numeroCuatrimestre,
              materias,
            });
          } catch (error) {
            console.error(`Error loading subjects for grupo ${grupo.idGrupo}:`, error);
          }
        }
      }

      setGrupos(gruposConMaterias);
    } catch (error) {
      console.error("Error loading grupos:", error);
      toast.error("Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  const toggleGrupo = (idGrupo: number) => {
    const newSet = new Set(gruposExpandidos);
    if (newSet.has(idGrupo)) {
      newSet.delete(idGrupo);
    } else {
      newSet.add(idGrupo);
    }
    setGruposExpandidos(newSet);
  };

  const seleccionarMateria = (grupoMateriaId: number, nombreGrupo: string, nombreMateria: string) => {
    setMateriaSeleccionada({ grupoMateriaId, nombreGrupo, nombreMateria });
  };

  const cerrarTabla = () => {
    setMateriaSeleccionada(null);
  };

  const gruposPorCuatrimestre = grupos.reduce((acc, grupo) => {
    if (!acc[grupo.numeroCuatrimestre]) {
      acc[grupo.numeroCuatrimestre] = [];
    }
    acc[grupo.numeroCuatrimestre].push(grupo);
    return acc;
  }, {} as { [key: number]: GrupoConMaterias[] });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">Cargando grupos...</div>
        </CardContent>
      </Card>
    );
  }

  if (grupos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No hay grupos disponibles</p>
          <p className="text-gray-500 text-sm mt-1">
            Selecciona un plan de estudios con grupos activos
          </p>
        </CardContent>
      </Card>
    );
  }

  if (materiaSeleccionada) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {materiaSeleccionada.nombreMateria}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Grupo: {materiaSeleccionada.nombreGrupo}
                </p>
              </div>
              <Button variant="outline" onClick={cerrarTabla}>
                ← Volver a grupos
              </Button>
            </div>
          </CardHeader>
        </Card>

        <TablaCalificacionesMatricial grupoMateriaId={materiaSeleccionada.grupoMateriaId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.keys(gruposPorCuatrimestre)
        .sort((a, b) => Number(a) - Number(b))
        .map((cuatrimestre) => (
          <div key={cuatrimestre}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {cuatrimestre}
              </div>
              {cuatrimestre}° Cuatrimestre
            </h3>

            <div className="space-y-3">
              {gruposPorCuatrimestre[Number(cuatrimestre)].map((grupo) => (
                <Card key={grupo.idGrupo} className="overflow-hidden">
                  {/* Header del Grupo */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleGrupo(grupo.idGrupo)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {gruposExpandidos.has(grupo.idGrupo) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">Grupo {grupo.nombreGrupo}</h4>
                            <Badge variant="outline">{grupo.codigoGrupo}</Badge>
                            <Badge variant="secondary">{grupo.turno}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{grupo.periodoAcademico}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{grupo.totalEstudiantes}</span>
                            <span>/</span>
                            <span>{grupo.capacidadMaxima}</span>
                          </div>
                          <p className="text-xs text-gray-500">estudiantes</p>
                        </div>
                        <Badge className="ml-2">
                          {grupo.materias.length} {grupo.materias.length === 1 ? "materia" : "materias"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Materias (Expandible) */}
                  {gruposExpandidos.has(grupo.idGrupo) && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4 space-y-2">
                        {grupo.materias.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">
                            No hay materias asignadas a este grupo
                          </p>
                        ) : (
                          grupo.materias.map((materia) => (
                            <div
                              key={materia.idGrupoMateria}
                              className="bg-white p-3 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                              onClick={() =>
                                seleccionarMateria(
                                  materia.idGrupoMateria,
                                  grupo.nombreGrupo,
                                  materia.nombreMateria
                                )
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{materia.nombreMateria}</h5>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm text-gray-600">
                                      Profesor: {materia.nombreProfesor || "Sin asignar"}
                                    </p>
                                    {materia.aula && (
                                      <Badge variant="outline" className="text-xs">
                                        Aula: {materia.aula}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Ver calificaciones →
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
