/* eslint-disable complexity */
"use client";

import { useEffect, useState } from "react";

import { Mail, Phone, User, Users } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStudentsInGroup } from "@/services/groups-service";
import { StudentsInGroup } from "@/types/group";

interface StudentsInGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idGrupo: number;
  nombreGrupo: string;
}

export function StudentsInGroupModal({ open, onOpenChange, idGrupo, nombreGrupo }: StudentsInGroupModalProps) {
  const [data, setData] = useState<StudentsInGroup | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open, idGrupo]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const studentsData = await getStudentsInGroup(idGrupo);
      setData(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Error al cargar los estudiantes");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Estudiantes del Grupo {nombreGrupo}
          </DialogTitle>
          <DialogDescription>
            {data ? `${data.totalEstudiantes} estudiante${data.totalEstudiantes !== 1 ? "s" : ""} inscrito${data.totalEstudiantes !== 1 ? "s" : ""}` : "Cargando..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading */}
          {loading && (
            <div className="text-center py-8 text-sm text-gray-500">
              Cargando estudiantes...
            </div>
          )}

          {/* Empty State */}
          {!loading && data && data.estudiantes.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No hay estudiantes en este grupo</p>
              <p className="text-gray-500 text-sm mt-1">
                Los estudiantes aparecerán aquí cuando se inscriban
              </p>
            </div>
          )}

          {/* Students List */}
          {!loading && data && data.estudiantes.length > 0 && (
            <div className="space-y-3">
              {data.estudiantes.map((student) => (
                <div
                  key={student.idEstudiante}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{student.nombreCompleto}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {student.matricula}
                        </span>
                        {student.estado && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {student.estado}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{student.email}</span>
                        </div>

                        {student.telefono && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{student.telefono}</span>
                          </div>
                        )}

                        {student.planEstudios && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{student.planEstudios}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Materias inscritas:</span>
                          <span className="font-medium text-blue-600">{student.materiasInscritas}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Inscrito el: {new Date(student.fechaInscripcion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
