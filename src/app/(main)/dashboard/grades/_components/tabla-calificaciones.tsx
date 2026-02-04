"use client";

import { useState, useEffect } from "react";

import { Edit, Save, AlertCircle } from "lucide-react";
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
  getCalificacionesPorGrupo
} from "@/services/calificaciones-service";
import { getStudentsByGroupSubject } from "@/services/groups-service";
import { TipoEvaluacion } from "@/types/calificaciones";
import type { StudentInGroup } from "@/types/group";

interface TablaCalificacionesProps {
  grupoMateriaId: number;
  parcialId: number;
}

interface EstudianteConCalificacion extends StudentInGroup {
  calificacion?: number;
  editando: boolean;
  calificacionTemp?: string;
}

export function TablaCalificaciones({ grupoMateriaId, parcialId }: TablaCalificacionesProps) {
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteConCalificacion[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [calificacionParcialId, setCalificacionParcialId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [grupoMateriaId, parcialId]);

  const loadData = async () => {
    setLoading(true);
    try {
      let actaId: number | null = null;
      try {
        const actas = await getCalificacionesPorGrupo(grupoMateriaId, parcialId);
        if (actas.length > 0) {
          actaId = actas[0].id;
          setCalificacionParcialId(actaId);
        }
      } catch {
        console.log("No existe acta, se creará al guardar la primera calificación");
      }

      const estudiantesInscritos = await getStudentsByGroupSubject(grupoMateriaId);

      let calificaciones: { inscripcionId: number; aporteParcial: number }[] = [];
      try {
        const concentrado = await getConcentradoGrupoParcial(grupoMateriaId, parcialId);
        calificaciones = concentrado.calificaciones;
      } catch {
        console.log("No hay calificaciones registradas aún");
      }

      const estudiantesConCalif: EstudianteConCalificacion[] = estudiantesInscritos.map((est) => {
        const calif = calificaciones.find((c) => c.inscripcionId === est.idInscripcion);
        return {
          ...est,
          calificacion: calif?.aporteParcial,
          editando: false,
          calificacionTemp: calif?.aporteParcial?.toString() || "",
        };
      });

      setEstudiantes(estudiantesConCalif);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idEstudiante: number) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.idEstudiante === idEstudiante
          ? { ...est, editando: true, calificacionTemp: est.calificacion?.toString() || "" }
          : est
      )
    );
  };

  const handleCancel = (idEstudiante: number) => {
    setEstudiantes((prev) =>
      prev.map((est) => (est.idEstudiante === idEstudiante ? { ...est, editando: false } : est))
    );
  };

  const handleSave = async (estudiante: EstudianteConCalificacion) => {
    const calificacion = parseFloat(estudiante.calificacionTemp || "0");

    if (calificacion < 0 || calificacion > 100) {
      toast.error("La calificación debe estar entre 0 y 100");
      return;
    }

    if (!estudiante.idInscripcion) {
      toast.error("No se encontró la inscripción del estudiante");
      return;
    }

    setSaving(estudiante.idEstudiante);
    try {
      let actaId = calificacionParcialId;
      if (!actaId) {
        const nuevaActa = await abrirParcial({
          grupoMateriaId,
          parcialId,
          profesorId: 1,
          fechaApertura: new Date().toISOString(),
        });
        actaId = nuevaActa.id;
        setCalificacionParcialId(actaId);
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
        prev.map((est) =>
          est.idEstudiante === estudiante.idEstudiante
            ? { ...est, calificacion, editando: false }
            : est
        )
      );
    } catch (error) {
      console.error("Error saving calificacion:", error);
      toast.error("Error al guardar la calificación");
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (idEstudiante: number, value: string) => {
    setEstudiantes((prev) =>
      prev.map((est) => (est.idEstudiante === idEstudiante ? { ...est, calificacionTemp: value } : est))
    );
  };

  const promedioGrupo =
    estudiantes.length > 0
      ? estudiantes.filter((e) => e.calificacion !== undefined).reduce((sum, e) => sum + (e.calificacion || 0), 0) /
        estudiantes.filter((e) => e.calificacion !== undefined).length
      : 0;

  const estudiantesConCalif = estudiantes.filter((e) => e.calificacion !== undefined).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calificaciones del Parcial</CardTitle>
            <CardDescription>Captura las calificaciones de los estudiantes</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Estudiantes: <span className="font-semibold">{estudiantes.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Con calificación:{" "}
              <span className="font-semibold">
                {estudiantesConCalif}/{estudiantes.length}
              </span>
            </p>
            {estudiantesConCalif > 0 && (
              <p className="text-sm text-gray-600">
                Promedio: <span className="font-semibold text-blue-600">{promedioGrupo.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
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
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Matrícula</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead className="w-[150px] text-center">Calificación</TableHead>
                  <TableHead className="w-[100px] text-center">Estado</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantes.map((estudiante) => (
                  <TableRow key={estudiante.idEstudiante}>
                    <TableCell className="font-medium">{estudiante.matricula}</TableCell>
                    <TableCell>{estudiante.nombreCompleto}</TableCell>
                    <TableCell className="text-center">
                      {estudiante.editando ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={estudiante.calificacionTemp}
                          onChange={(e) => handleChange(estudiante.idEstudiante, e.target.value)}
                          className="w-20 mx-auto text-center"
                          autoFocus
                        />
                      ) : estudiante.calificacion !== undefined ? (
                        <span
                          className={`font-semibold ${
                            estudiante.calificacion >= 70
                              ? "text-green-600"
                              : estudiante.calificacion >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {estudiante.calificacion.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudiante.calificacion !== undefined ? (
                        <Badge variant={estudiante.calificacion >= 70 ? "default" : "destructive"}>
                          {estudiante.calificacion >= 70 ? "Aprobado" : "Reprobado"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {estudiante.editando ? (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleSave(estudiante)}
                            disabled={saving === estudiante.idEstudiante}
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {saving === estudiante.idEstudiante ? "..." : "Guardar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(estudiante.idEstudiante)}
                            disabled={saving === estudiante.idEstudiante}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(estudiante.idEstudiante)}>
                          <Edit className="w-4 h-4" />
                        </Button>
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
