"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, CheckCircle, Clock, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTeacherToSubject } from "@/services/groups-service";
import { getTeachersList, validateTeacherSchedule } from "@/services/teacher-service";
import { GrupoMateria } from "@/types/group";
import { Teacher, TeacherScheduleConflict } from "@/types/teacher";

interface AssignTeacherModalProps {
  open: boolean;
  onClose: () => void;
  grupoMateria: GrupoMateria | null;
  onSuccess: () => void;
}

export function AssignTeacherModal({ open, onClose, grupoMateria, onSuccess }: AssignTeacherModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [conflict, setConflict] = useState<TeacherScheduleConflict | null>(null);

  const campusId = 1;

  useEffect(() => {
    if (open) {
      loadTeachers();
      if (grupoMateria?.idProfesor) {
        setSelectedTeacherId(grupoMateria.idProfesor.toString());
      } else {
        setSelectedTeacherId("0");
      }
      setConflict(null);
    }
  }, [open, grupoMateria]);

  useEffect(() => {
    if (selectedTeacherId && selectedTeacherId !== "0" && grupoMateria?.horarioJson && grupoMateria.horarioJson.length > 0) {
      validateSchedule();
    } else {
      setConflict(null);
    }
  }, [selectedTeacherId]);

  const loadTeachers = async () => {
    try {
      const response = await getTeachersList(campusId, 1, 1000);
      setTeachers(response.items || []);
    } catch (error) {
      console.error("Error al cargar profesores:", error);
      toast.error("Error al cargar la lista de profesores");
    }
  };

  const validateSchedule = async () => {
    if (!selectedTeacherId || !grupoMateria?.horarioJson) return;

    setValidating(true);
    try {
      const result = await validateTeacherSchedule(
        parseInt(selectedTeacherId),
        grupoMateria.horarioJson,
        grupoMateria.idGrupoMateria
      );
      setConflict(result);
    } catch (error) {
      console.error("Error al validar horario:", error);
      toast.error("Error al validar el horario del profesor");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!grupoMateria) return;

    if (conflict?.tieneConflicto) {
      toast.error("No se puede asignar el profesor porque tiene conflictos de horario");
      return;
    }

    setLoading(true);
    try {
      const profesorId = selectedTeacherId === "0" ? null : parseInt(selectedTeacherId);
      await assignTeacherToSubject(
        grupoMateria.idGrupoMateria,
        profesorId
      );
      toast.success(
        profesorId
          ? "Profesor asignado correctamente"
          : "Profesor removido de la materia"
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al asignar profesor:", error);
      toast.error("Error al asignar el profesor a la materia");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (!grupoMateria) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Asignar Profesor
          </DialogTitle>
          <DialogDescription>
            {grupoMateria.nombreMateria} ({grupoMateria.claveMateria})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Materia:</span>{" "}
                  {grupoMateria.nombreMateria}
                </div>
                <div>
                  <span className="font-semibold">Clave:</span>{" "}
                  {grupoMateria.claveMateria}
                </div>
                <div>
                  <span className="font-semibold">Créditos:</span>{" "}
                  {grupoMateria.creditos}
                </div>
                <div>
                  <span className="font-semibold">Cupo:</span>{" "}
                  {grupoMateria.inscritos}/{grupoMateria.cupo}
                </div>
                {grupoMateria.aula && (
                  <div>
                    <span className="font-semibold">Aula:</span>{" "}
                    {grupoMateria.aula}
                  </div>
                )}
              </div>

              {grupoMateria.horarioJson && grupoMateria.horarioJson.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    Horario de la materia
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {grupoMateria.horarioJson.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="font-semibold text-blue-900 text-sm">
                          {h.dia}
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          {formatTime(h.horaInicio)} - {formatTime(h.horaFin)}
                        </div>
                        {h.aula && (
                          <div className="text-xs text-gray-600 mt-1">
                            Aula: {h.aula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="teacher">Profesor</Label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
              disabled={loading || validating}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Selecciona un profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin asignar</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.idProfesor} value={teacher.idProfesor.toString()}>
                    {teacher.nombreCompleto} - {teacher.noEmpleado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {validating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              Validando horario del profesor...
            </div>
          )}

          {conflict && !validating && selectedTeacherId && selectedTeacherId !== "0" && (
            <Card className={conflict.tieneConflicto ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
              <CardContent className="pt-6">
                {conflict.tieneConflicto ? (
                  <>
                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-4">
                      <XCircle className="w-5 h-5" />
                      Conflictos de horario detectados
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conflict.conflictos.map((c, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                          <div className="font-medium text-sm text-red-900 mb-2">
                            {c.nombreMateria}
                          </div>
                          <div className="space-y-1 text-xs text-red-700">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Grupo:</span> {c.grupo}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="font-semibold">{c.dia}:</span> {formatTime(c.horaInicio)} - {formatTime(c.horaFin)}
                            </div>
                            {c.aula && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Aula:</span> {c.aula}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-red-200 text-sm text-red-700">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      El profesor ya tiene {conflict.conflictos.length} clase{conflict.conflictos.length > 1 ? 's' : ''} asignada{conflict.conflictos.length > 1 ? 's' : ''} en este horario.
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    No hay conflictos de horario. El profesor puede ser asignado.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(!grupoMateria.horarioJson || grupoMateria.horarioJson.length === 0) && selectedTeacherId && selectedTeacherId !== "0" && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">
                    Esta materia no tiene horarios asignados. No se puede validar conflictos.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || validating || (conflict?.tieneConflicto ?? false)}
          >
            {loading ? "Asignando..." : selectedTeacherId === "0" ? "Remover Profesor" : "Asignar Profesor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
