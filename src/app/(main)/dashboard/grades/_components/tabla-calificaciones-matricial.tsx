"use client";

import { useState, useEffect } from "react";

import { Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getConcentradoGrupoParcial,
  upsertCalificacion,
  abrirParcial,
  getCalificacionesPorGrupo,
  getParciales
} from "@/services/calificaciones-service";
import { getStudentsByGroupSubject } from "@/services/groups-service";
import { TipoEvaluacion, type Parcial } from "@/types/calificaciones";
import type { StudentInGroup } from "@/types/group";

interface TablaCalificacionesMatricialProps {
  grupoMateriaId: number;
}

interface CalificacionPorParcial {
  [parcialId: number]: number | undefined;
}

interface EstudianteConCalificaciones extends StudentInGroup {
  calificaciones: CalificacionPorParcial;
  calificacionesTemp: { [parcialId: number]: string };
  editando: { [parcialId: number]: boolean };
  calificacionFinal?: number;
}

export function TablaCalificacionesMatricial({ grupoMateriaId }: TablaCalificacionesMatricialProps) {
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteConCalificaciones[]>([]);
  const [parciales, setParciales] = useState<Parcial[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [actasPorParcial, setActasPorParcial] = useState<{ [parcialId: number]: number }>({});

  useEffect(() => {
    loadData();
  }, [grupoMateriaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const parcialesResult = await getParciales(1, 100);
      const parcialesOrdenados = parcialesResult.items.sort((a: any, b: any) => a.orden - b.orden);
      setParciales(parcialesOrdenados);

      const estudiantesInscritos = await getStudentsByGroupSubject(grupoMateriaId);

      const actasMap: { [parcialId: number]: number } = {};
      for (const parcial of parcialesOrdenados) {
        try {
          const actas = await getCalificacionesPorGrupo(grupoMateriaId, parcial.id);
          if (actas.length > 0) {
            actasMap[parcial.id] = actas[0].id;
          }
        } catch {
          console.log(`No existe acta para parcial ${parcial.id}`);
        }
      }
      setActasPorParcial(actasMap);

      const calificacionesPorParcial: { [parcialId: number]: { inscripcionId: number; aporteParcial: number }[] } = {};

      for (const parcial of parcialesOrdenados) {
        try {
          const concentrado = await getConcentradoGrupoParcial(grupoMateriaId, parcial.id);
          calificacionesPorParcial[parcial.id] = concentrado.calificaciones;
        } catch {
          calificacionesPorParcial[parcial.id] = [];
        }
      }

      const estudiantesConCalif: EstudianteConCalificaciones[] = estudiantesInscritos.map((est) => {
        const calificaciones: CalificacionPorParcial = {};
        const calificacionesTemp: { [parcialId: number]: string } = {};
        const editando: { [parcialId: number]: boolean } = {};

        parcialesOrdenados.forEach((parcial: any) => {
          const calif = calificacionesPorParcial[parcial.id]?.find((c: any) => c.inscripcionId === est.idInscripcion);
          calificaciones[parcial.id] = calif?.aporteParcial;
          calificacionesTemp[parcial.id] = calif?.aporteParcial?.toString() || "";
          editando[parcial.id] = false;
        });

        const parcialesPrevios = parcialesOrdenados.filter((p: any) => p.orden < 4);
        const califsPrevias = parcialesPrevios
          .map((p: any) => calificaciones[p.id])
          .filter((c: any): c is number => c !== undefined);

        const calificacionFinal = califsPrevias.length > 0
          ? califsPrevias.reduce((sum: number, c: number) => sum + c, 0) / califsPrevias.length
          : undefined;

        return {
          ...est,
          calificaciones,
          calificacionesTemp,
          editando,
          calificacionFinal,
        };
      });

      setEstudiantes(estudiantesConCalif);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idEstudiante: number, parcialId: number) => {
    setEstudiantes((prev) =>
      prev.map((est) => {
        if (est.idEstudiante === idEstudiante) {
          return {
            ...est,
            editando: { ...est.editando, [parcialId]: true },
            calificacionesTemp: {
              ...est.calificacionesTemp,
              [parcialId]: est.calificaciones[parcialId]?.toString() || "",
            },
          };
        }
        return est;
      })
    );
  };

  const handleCancel = (idEstudiante: number, parcialId: number) => {
    setEstudiantes((prev) =>
      prev.map((est) => {
        if (est.idEstudiante === idEstudiante) {
          return {
            ...est,
            editando: { ...est.editando, [parcialId]: false },
          };
        }
        return est;
      })
    );
  };

  const handleSave = async (estudiante: EstudianteConCalificaciones, parcialId: number) => {
    const calificacion = parseFloat(estudiante.calificacionesTemp[parcialId] || "0");

    if (calificacion < 0 || calificacion > 100) {
      toast.error("La calificación debe estar entre 0 y 100");
      return;
    }

    if (!estudiante.idInscripcion) {
      toast.error("No se encontró la inscripción del estudiante");
      return;
    }

    const saveKey = `${estudiante.idEstudiante}-${parcialId}`;
    setSaving(saveKey);

    try {
      let actaId = actasPorParcial[parcialId];
      if (!actaId) {
        const nuevaActa = await abrirParcial({
          grupoMateriaId,
          parcialId,
          profesorId: 1, //
          fechaApertura: new Date().toISOString(),
        });
        actaId = nuevaActa.id;
        setActasPorParcial((prev) => ({ ...prev, [parcialId]: actaId }));
      }

      await upsertCalificacion({
        calificacionParcialId: actaId,
        grupoMateriaId,
        inscripcionId: estudiante.idInscripcion,
        tipoEvaluacionEnum: TipoEvaluacion.Examen,
        nombre: "Calificación del Parcial",
        pesoEvaluacion: 100,
        maxPuntos: 100,
        puntos: calificacion,
        fechaAplicacion: new Date().toISOString(),
      });

      toast.success("Calificación guardada correctamente");

      setEstudiantes((prev) =>
        prev.map((est) => {
          if (est.idEstudiante === estudiante.idEstudiante) {
            const nuevasCalif = { ...est.calificaciones, [parcialId]: calificacion };

            const parcialesPrevios = parciales.filter(p => p.orden < 4);
            const califsPrevias = parcialesPrevios
              .map(p => nuevasCalif[p.id])
              .filter((c): c is number => c !== undefined);

            const calificacionFinal = califsPrevias.length > 0
              ? califsPrevias.reduce((sum, c) => sum + c, 0) / califsPrevias.length
              : undefined;

            return {
              ...est,
              calificaciones: nuevasCalif,
              editando: { ...est.editando, [parcialId]: false },
              calificacionFinal,
            };
          }
          return est;
        })
      );
    } catch (error) {
      console.error("Error saving calificacion:", error);
      toast.error("Error al guardar la calificación");
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (idEstudiante: number, parcialId: number, value: string) => {
    setEstudiantes((prev) =>
      prev.map((est) => {
        if (est.idEstudiante === idEstudiante) {
          return {
            ...est,
            calificacionesTemp: { ...est.calificacionesTemp, [parcialId]: value },
          };
        }
        return est;
      })
    );
  };

  const getColorClass = (calificacion: number | undefined) => {
    if (calificacion === undefined) return "text-gray-400";
    if (calificacion >= 70) return "text-green-600";
    if (calificacion >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const parcialesPrevios = parciales.filter(p => p.orden < 4);
  const parcialFinal = parciales.find(p => p.orden === 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificaciones por Parcial</CardTitle>
        <CardDescription>
          Captura las calificaciones de los estudiantes por cada parcial. La calificación final (P4) se calcula automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando estudiantes...</div>
        ) : estudiantes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay estudiantes inscritos en esta materia.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sticky left-0 bg-white z-10">Matrícula</TableHead>
                  <TableHead className="min-w-[200px] sticky left-[100px] bg-white z-10">Nombre</TableHead>
                  {parcialesPrevios.map((parcial) => (
                    <TableHead key={parcial.id} className="text-center min-w-[120px]">
                      {parcial.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[120px] bg-blue-50">
                    {parcialFinal?.name || "Final"}
                  </TableHead>
                  <TableHead className="text-center min-w-[100px]">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantes.map((estudiante) => (
                  <TableRow key={estudiante.idEstudiante}>
                    <TableCell className="font-medium sticky left-0 bg-white">
                      {estudiante.matricula}
                    </TableCell>
                    <TableCell className="sticky left-[100px] bg-white">
                      {estudiante.nombreCompleto}
                    </TableCell>
                    {parcialesPrevios.map((parcial) => (
                      <TableCell key={parcial.id} className="text-center">
                        {estudiante.editando[parcial.id] ? (
                          <div className="flex gap-1 items-center justify-center">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={estudiante.calificacionesTemp[parcial.id]}
                              onChange={(e) => handleChange(estudiante.idEstudiante, parcial.id, e.target.value)}
                              className="w-16 text-center"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSave(estudiante, parcial.id)}
                              disabled={saving === `${estudiante.idEstudiante}-${parcial.id}`}
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancel(estudiante.idEstudiante, parcial.id)}
                              disabled={saving === `${estudiante.idEstudiante}-${parcial.id}`}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(estudiante.idEstudiante, parcial.id)}
                            className={`font-semibold hover:underline ${getColorClass(estudiante.calificaciones[parcial.id])}`}
                          >
                            {estudiante.calificaciones[parcial.id] !== undefined
                              ? estudiante.calificaciones[parcial.id]!.toFixed(1)
                              : "-"}
                          </button>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center bg-blue-50">
                      <span className={`font-bold text-lg ${getColorClass(estudiante.calificacionFinal)}`}>
                        {estudiante.calificacionFinal !== undefined
                          ? estudiante.calificacionFinal.toFixed(1)
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {estudiante.calificacionFinal !== undefined ? (
                        <Badge variant={estudiante.calificacionFinal >= 70 ? "default" : "destructive"}>
                          {estudiante.calificacionFinal >= 70 ? "Aprobado" : "Reprobado"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
