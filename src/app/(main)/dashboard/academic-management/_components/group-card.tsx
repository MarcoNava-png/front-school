"use client";

import { useState } from "react";

import {
  BookOpen,
  Calendar,
  MoreVertical,
  TrendingUp,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteGroup } from "@/services/groups-service";
import { GrupoResumen } from "@/types/group";

import { GroupSubjectsModal } from "./group-subjects-modal";
import { PromoteStudentsModal } from "./promote-students-modal";
import { StudentsInGroupModal } from "./students-in-group-modal";

interface GroupCardProps {
  grupo: GrupoResumen;
  numeroCuatrimestre?: number;
  onUpdate: () => void;
  periodicidadLabel?: string;
}

export function GroupCard({ grupo, numeroCuatrimestre, onUpdate, periodicidadLabel = "Cuatrimestre" }: GroupCardProps) {
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const ocupacion = grupo.capacidadMaxima > 0
    ? Math.round((grupo.totalEstudiantes / grupo.capacidadMaxima) * 100)
    : 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGroup(grupo.idGrupo);
      toast.success("Grupo eliminado exitosamente");
      setShowDeleteDialog(false);
      onUpdate();
    } catch (error: unknown) {
      console.error("Error deleting group:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message ?? err?.message ?? "Error al eliminar el grupo";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-lg text-gray-900">{grupo.nombreGrupo}</h4>
            <p className="text-sm text-gray-600">Código: {grupo.codigoGrupo}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSubjectsModal(true)}>
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Materias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowStudentsModal(true)}>
                <Users className="w-4 h-4 mr-2" />
                Ver Estudiantes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPromoteModal(true)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Promover Estudiantes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Grupo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{grupo.turno}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{grupo.periodoAcademico}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(20, 53, 111, 0.1)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" style={{ color: '#14356F' }} />
              <span className="text-xs font-medium" style={{ color: '#1e4a8f' }}>Estudiantes</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#14356F' }}>
              {grupo.totalEstudiantes}/{grupo.capacidadMaxima}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Materias</span>
            </div>
            <p className="text-xl font-bold text-green-900">{grupo.totalMaterias}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Ocupación</span>
            <span>{ocupacion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                ocupacion >= 90
                  ? "bg-red-500"
                  : ocupacion >= 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${ocupacion}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSubjectsModal(true)}
            className="w-full"
            style={{ borderColor: '#14356F', color: '#14356F' }}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Materias
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStudentsModal(true)}
            className="w-full"
            style={{ borderColor: '#14356F', color: '#14356F' }}
          >
            <Users className="w-4 h-4 mr-2" />
            Estudiantes
          </Button>
        </div>
      </div>
      <GroupSubjectsModal
        open={showSubjectsModal}
        onOpenChange={setShowSubjectsModal}
        idGrupo={grupo.idGrupo}
        nombreGrupo={grupo.nombreGrupo}
        idPlanEstudios={grupo.idPlanEstudios}
        codigoGrupo={grupo.codigoGrupo}
        numeroCuatrimestre={numeroCuatrimestre}
        periodicidadLabel={periodicidadLabel}
      />

      <StudentsInGroupModal
        open={showStudentsModal}
        onOpenChange={setShowStudentsModal}
        idGrupo={grupo.idGrupo}
        nombreGrupo={grupo.nombreGrupo}
      />

      <PromoteStudentsModal
        open={showPromoteModal}
        onOpenChange={setShowPromoteModal}
        idGrupo={grupo.idGrupo}
        nombreGrupo={grupo.nombreGrupo}
        onSuccess={onUpdate}
        periodicidadLabel={periodicidadLabel}
      />

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Grupo"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el grupo:"
        itemName={grupo.nombreGrupo}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </>
  );
}
