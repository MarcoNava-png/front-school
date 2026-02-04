"use client";

import { useState, useEffect } from "react";

import { ChevronDown, ChevronRight, Users, BookOpen, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAcademicManagement, getGroupSubjects } from "@/services/groups-service";
import type { GrupoConMaterias } from "@/types/group";

import { TablaAsistencias } from "./tabla-asistencias";

interface GruposAcordeonAsistenciasProps {
  planEstudiosId: number;
}

export function GruposAcordeonAsistencias({ planEstudiosId }: GruposAcordeonAsistenciasProps) {
  const [loading, setLoading] = useState(true);
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
          const materias = await getGroupSubjects(grupo.idGrupo);

          gruposConMaterias.push({
            ...grupo,
            numeroCuatrimestre: cuatrimestre.numeroCuatrimestre,
            materias,
          });
        }
      }

      setGrupos(gruposConMaterias);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      toast.error("Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  const toggleGrupo = (idGrupo: number) => {
    const newExpandidos = new Set(gruposExpandidos);
    if (newExpandidos.has(idGrupo)) {
      newExpandidos.delete(idGrupo);
    } else {
      newExpandidos.add(idGrupo);
    }
    setGruposExpandidos(newExpandidos);
  };

  const seleccionarMateria = (grupoMateriaId: number, nombreGrupo: string, nombreMateria: string) => {
    setMateriaSeleccionada({ grupoMateriaId, nombreGrupo, nombreMateria });
  };

  const cerrarTablaAsistencias = () => {
    setMateriaSeleccionada(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">Cargando grupos...</div>
        </CardContent>
      </Card>
    );
  }

  if (materiaSeleccionada) {
    return (
      <TablaAsistencias
        grupoMateriaId={materiaSeleccionada.grupoMateriaId}
        nombreGrupo={materiaSeleccionada.nombreGrupo}
        nombreMateria={materiaSeleccionada.nombreMateria}
        onClose={cerrarTablaAsistencias}
      />
    );
  }

  const gruposPorCuatrimestre: { [key: number]: GrupoConMaterias[] } = {};
  grupos.forEach((grupo) => {
    if (!gruposPorCuatrimestre[grupo.numeroCuatrimestre]) {
      gruposPorCuatrimestre[grupo.numeroCuatrimestre] = [];
    }
    gruposPorCuatrimestre[grupo.numeroCuatrimestre].push(grupo);
  });

  return (
    <div className="space-y-6">
      {Object.entries(gruposPorCuatrimestre)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([cuatrimestre, gruposDelCuatrimestre]) => (
          <Card key={cuatrimestre}>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg">
                {cuatrimestre}° Cuatrimestre
              </CardTitle>
              <CardDescription>
                {gruposDelCuatrimestre.length} grupo(s) disponible(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {gruposDelCuatrimestre.map((grupo) => {
                  const isExpanded = gruposExpandidos.has(grupo.idGrupo);

                  return (
                    <div key={grupo.idGrupo} className="transition-colors hover:bg-gray-50">
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleGrupo(grupo.idGrupo)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base">{grupo.nombreGrupo}</h3>
                              <Badge variant="outline">{grupo.codigoGrupo}</Badge>
                              <Badge variant="secondary">{grupo.turno}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{grupo.periodoAcademico}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {grupo.totalEstudiantes}/{grupo.capacidadMaxima}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <Badge variant="outline">{grupo.materias.length} materias</Badge>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-gray-50/50">
                          <div className="space-y-2">
                            {grupo.materias.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No hay materias asignadas a este grupo
                              </div>
                            ) : (
                              grupo.materias.map((materia) => (
                                <Card
                                  key={materia.idGrupoMateria}
                                  className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
                                  onClick={() =>
                                    seleccionarMateria(
                                      materia.idGrupoMateria,
                                      grupo.nombreGrupo,
                                      materia.nombreMateria
                                    )
                                  }
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="w-4 h-4 text-blue-600" />
                                          <h4 className="font-medium">{materia.nombreMateria}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                          {materia.nombreProfesor && (
                                            <span>Profesor: {materia.nombreProfesor}</span>
                                          )}
                                          {materia.aula && (
                                            <Badge variant="outline" className="text-xs">
                                              Aula: {materia.aula}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm" className="gap-2">
                                        <ClipboardCheck className="w-4 h-4" />
                                        Tomar asistencia
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

      {grupos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No hay grupos disponibles</p>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona otro plan de estudios o verifica la configuración académica
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
