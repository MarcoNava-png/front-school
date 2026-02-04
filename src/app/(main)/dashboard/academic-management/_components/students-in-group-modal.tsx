
"use client";

import { useEffect, useState } from "react";

import { Mail, Phone, User, Users, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEstudiantesDelGrupoDirecto, getStudentsInGroup, type EstudiantesDelGrupoResponse } from "@/services/groups-service";
import { StudentsInGroup } from "@/types/group";

interface StudentsInGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idGrupo: number;
  nombreGrupo: string;
}

interface StudentDisplay {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  planEstudios?: string;
  estado?: string;
  fechaInscripcion: string;
  materiasInscritas?: number;
  fuente: 'directo' | 'materias';
}

export function StudentsInGroupModal({ open, onOpenChange, idGrupo, nombreGrupo }: StudentsInGroupModalProps) {
  const [students, setStudents] = useState<StudentDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);

  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open, idGrupo]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const [directos, porMaterias] = await Promise.allSettled([
        getEstudiantesDelGrupoDirecto(idGrupo),
        getStudentsInGroup(idGrupo),
      ]);

      const allStudents: StudentDisplay[] = [];
      const seenIds = new Set<number>();

      if (directos.status === 'fulfilled' && directos.value.estudiantes) {
        for (const est of directos.value.estudiantes) {
          if (!seenIds.has(est.idEstudiante)) {
            seenIds.add(est.idEstudiante);
            allStudents.push({
              idEstudiante: est.idEstudiante,
              matricula: est.matricula,
              nombreCompleto: est.nombreCompleto,
              email: est.email,
              telefono: est.telefono,
              planEstudios: est.planEstudios,
              estado: est.estado,
              fechaInscripcion: est.fechaInscripcion,
              fuente: 'directo',
            });
          }
        }
      }

      if (porMaterias.status === 'fulfilled' && porMaterias.value.estudiantes) {
        for (const est of porMaterias.value.estudiantes) {
          if (!seenIds.has(est.idEstudiante)) {
            seenIds.add(est.idEstudiante);
            allStudents.push({
              idEstudiante: est.idEstudiante,
              matricula: est.matricula,
              nombreCompleto: est.nombreCompleto,
              email: est.email,
              telefono: est.telefono,
              planEstudios: est.planEstudios,
              estado: est.estado,
              fechaInscripcion: est.fechaInscripcion,
              materiasInscritas: est.materiasInscritas,
              fuente: 'materias',
            });
          }
        }
      }

      allStudents.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

      setStudents(allStudents);
      setTotalEstudiantes(allStudents.length);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Error al cargar los estudiantes");
      setStudents([]);
      setTotalEstudiantes(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#14356F' }} />
            Estudiantes del Grupo {nombreGrupo}
          </DialogTitle>
          <DialogDescription>
            {loading ? "Cargando..." : `${totalEstudiantes} estudiante${totalEstudiantes !== 1 ? "s" : ""} inscrito${totalEstudiantes !== 1 ? "s" : ""}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: '#14356F' }}></div>
              Cargando estudiantes...
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No hay estudiantes en este grupo</p>
              <p className="text-gray-500 text-sm mt-1">
                Los estudiantes aparecerán aquí cuando se inscriban
              </p>
            </div>
          )}

          {!loading && students.length > 0 && (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.idEstudiante}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{student.nombreCompleto}</h4>
                        <Badge
                          variant="outline"
                          className="font-mono"
                          style={{ background: 'rgba(20, 53, 111, 0.05)', color: '#14356F', borderColor: 'rgba(20, 53, 111, 0.2)' }}
                        >
                          {student.matricula}
                        </Badge>
                        {student.estado && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {student.estado}
                          </Badge>
                        )}
                        {student.fuente === 'directo' && (
                          <Badge variant="secondary" className="text-xs">
                            Inscripción directa
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {student.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span>{student.email}</span>
                          </div>
                        )}

                        {student.telefono && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{student.telefono}</span>
                          </div>
                        )}

                        {student.planEstudios && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>{student.planEstudios}</span>
                          </div>
                        )}

                        {student.materiasInscritas !== undefined && student.materiasInscritas > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Materias:</span>
                            <span className="font-medium" style={{ color: '#14356F' }}>{student.materiasInscritas}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>Inscrito el: {new Date(student.fechaInscripcion).toLocaleDateString('es-MX')}</span>
                      </div>
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
