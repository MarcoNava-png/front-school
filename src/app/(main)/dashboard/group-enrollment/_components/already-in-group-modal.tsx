"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle, ArrowRight, BookOpen } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlreadyInGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  groupCode?: string;
}

export function AlreadyInGroupModal({
  open,
  onOpenChange,
  studentName,
  groupCode,
}: AlreadyInGroupModalProps) {
  const router = useRouter();

  const handleGoToGroups = () => {
    onOpenChange(false);
    router.push("/dashboard/academic-management");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Estudiante ya inscrito en grupo
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p className="text-base text-foreground">
                El estudiante <strong>{studentName}</strong> ya está inscrito en el grupo{" "}
                <strong>{groupCode}</strong>.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Solo falta inscribir a las materias
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Para completar la inscripción, ve a la sección de{" "}
                      <strong>Gestión Académica → Grupos</strong> y asigna las materias
                      correspondientes al estudiante.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          <Button onClick={handleGoToGroups} className="gap-2">
            Ir a Grupos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
