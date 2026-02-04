
"use client";

import { useEffect, useState } from "react";

import { BookOpen, Clock, Users, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAcademicPeriods } from "@/services/catalogs-service";
import {
  enrollStudentInGrupoMateria,
  getAvailableGruposMaterias,
  getStudentInscripciones,
} from "@/services/students-service";
import { AcademicPeriod } from "@/types/catalog";
import { GrupoMateria, InscripcionGrupoMateriaRequest, InscripcionGrupoMateriaResponse } from "@/types/student";

interface EnrollGrupoMateriaModalProps {
  open: boolean;
  studentId: number | null;
  studentName?: string;
  onClose: () => void;
  onEnrollmentSuccess: () => void;
}

export function EnrollGrupoMateriaModal({
  open,
  studentId,
  studentName,
  onClose,
  onEnrollmentSuccess,
}: EnrollGrupoMateriaModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [gruposMaterias, setGruposMaterias] = useState<GrupoMateria[]>([]);
  const [selectedGrupoMateriaId, setSelectedGrupoMateriaId] = useState<string>("");
  const [currentInscriptions, setCurrentInscriptions] = useState<InscripcionGrupoMateriaResponse[]>([]);

  useEffect(() => {
    if (open && studentId) {
      loadData();
    } else {
      resetForm();
    }
  }, [open, studentId]);

  useEffect(() => {
    if (selectedPeriodId) {
      loadGruposMaterias();
    } else {
      setGruposMaterias([]);
      setSelectedGrupoMateriaId("");
    }
  }, [selectedPeriodId]);

  const loadData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const [periodsData, inscripcionesData] = await Promise.all([
        getAcademicPeriods(),
        getStudentInscripciones(studentId),
      ]);

      setAcademicPeriods(periodsData);
      setCurrentInscriptions(inscripcionesData);

      const activePeriod = periodsData.find((p) => p.status === 1);
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.idPeriodoAcademico.toString());
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const loadGruposMaterias = async () => {
    if (!studentId || !selectedPeriodId) return;

    setLoading(true);
    try {
      const data = await getAvailableGruposMaterias(studentId, parseInt(selectedPeriodId));
      setGruposMaterias(data);
    } catch (error) {
      console.error("Error al cargar grupos-materias:", error);
      toast.error("Error al cargar las materias disponibles");
      setGruposMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPeriodId("");
    setSelectedGrupoMateriaId("");
    setGruposMaterias([]);
    setCurrentInscriptions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !selectedGrupoMateriaId) {
      toast.error("Debe seleccionar un grupo-materia");
      return;
    }

    setSubmitting(true);
    try {
      const request: InscripcionGrupoMateriaRequest = {
        idEstudiante: studentId,
        idGrupoMateria: parseInt(selectedGrupoMateriaId),
        fechaInscripcion: new Date().toISOString(),
      };

      console.log("Inscribiendo a grupo-materia:", request);

      const result = await enrollStudentInGrupoMateria(request);

      console.log("Inscripción exitosa:", result);

      toast.success(
        <div className="space-y-1">
          <p className="font-bold">Inscripción exitosa</p>
          <p className="text-xs">
            {result.nombreMateria} - Grupo {result.grupo}
          </p>
        </div>,
        { duration: 5000 },
      );

      onEnrollmentSuccess();
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error("Error al inscribir:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.mensaje ?? err?.message ?? "Error al inscribir al estudiante en la materia";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGrupoMateria = gruposMaterias.find(
    (gm) => gm.idGrupoMateria.toString() === selectedGrupoMateriaId,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Inscribir a Grupo-Materia
          </DialogTitle>
          <DialogDescription>
            Inscribir al estudiante {studentName ?? `#${studentId}`} en una materia para el periodo académico
          </DialogDescription>
        </DialogHeader>

        {loading && !gruposMaterias.length ? (
          <div className="py-8 text-center text-sm text-gray-500">Cargando información...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentInscriptions.length > 0 && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Inscripciones Actuales ({currentInscriptions.length})
                </h3>
                <div className="space-y-2">
                  {currentInscriptions.slice(0, 5).map((insc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white rounded px-3 py-2">
                      <span className="font-medium">{insc.nombreMateria}</span>
                      <span className="text-gray-600">Grupo {insc.grupo}</span>
                      <span className="px-2 py-1 rounded text-[10px] bg-green-100 text-green-800">{insc.estado}</span>
                    </div>
                  ))}
                  {currentInscriptions.length > 5 && (
                    <p className="text-[10px] text-gray-500 text-center">
                      ...y {currentInscriptions.length - 5} más
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-sm">Selección de Materia</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo" className="text-xs">
                    Periodo Académico *
                  </Label>
                  <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Seleccione un periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicPeriods.map((period) => (
                        <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                          {period.nombre} ({period.clave})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriodId && (
                  <div className="space-y-2">
                    <Label htmlFor="grupomateria" className="text-xs">
                      Grupo-Materia * {loading && <span className="text-gray-500">(Cargando...)</span>}
                    </Label>
                    <Select
                      value={selectedGrupoMateriaId}
                      onValueChange={setSelectedGrupoMateriaId}
                      disabled={loading || gruposMaterias.length === 0}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Seleccione una materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {gruposMaterias.map((gm) => (
                          <SelectItem key={gm.idGrupoMateria} value={gm.idGrupoMateria.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {gm.nombreMateria} ({gm.claveMateria})
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Grupo {gm.grupo} • {gm.disponibles}/{gm.cupoMaximo} disponibles
                                {gm.nombreProfesor && ` • ${gm.nombreProfesor}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {gruposMaterias.length === 0 && !loading && (
                      <p className="text-[10px] text-orange-600">
                        No hay materias disponibles para este periodo o estudiante
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {selectedGrupoMateria && (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <h3 className="font-semibold text-sm mb-3">Detalle de la Materia Seleccionada</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-green-700 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Materia</p>
                      <p className="font-medium">
                        {selectedGrupoMateria.nombreMateria} ({selectedGrupoMateria.claveMateria})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-green-700 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Disponibilidad</p>
                      <p className="font-medium">
                        {selectedGrupoMateria.disponibles} de {selectedGrupoMateria.cupoMaximo} lugares
                      </p>
                    </div>
                  </div>

                  {selectedGrupoMateria.nombreProfesor && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-green-700 mt-0.5" />
                      <div>
                        <p className="text-gray-600">Profesor</p>
                        <p className="font-medium">{selectedGrupoMateria.nombreProfesor}</p>
                      </div>
                    </div>
                  )}

                  {selectedGrupoMateria.horario && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-green-700 mt-0.5" />
                      <div>
                        <p className="text-gray-600">Horario</p>
                        <p className="font-medium">{selectedGrupoMateria.horario}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {selectedGrupoMateria && selectedGrupoMateria.disponibles === 0 && (
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-orange-800">Grupo lleno</p>
                    <p className="text-orange-700">
                      Este grupo no tiene cupos disponibles. La inscripción podría requerir autorización especial.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || !selectedGrupoMateriaId} className="text-xs">
                {submitting ? "Procesando..." : "Confirmar Inscripción"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
