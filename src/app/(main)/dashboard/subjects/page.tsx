"use client";

import { useEffect, useState } from "react";

import { BookOpen, Edit, GraduationCap, Hash, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMatterPlan, getMatterPlanList } from "@/services/matter-plan-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { MatterPlan } from "@/types/matter-plan";
import { StudyPlan } from "@/types/study-plan";

import { CreateSubjectDialog } from "./_components/create-subject-dialog";
import { EditSubjectDialog } from "./_components/edit-subject-dialog";
import { ImportSubjectsModal } from "./_components/import-subjects-modal";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<MatterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<MatterPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<MatterPlan | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [planes, setPlanes] = useState<StudyPlan[]>([]);

  useEffect(() => {
    loadSubjects();
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      const res = await getStudyPlansList(1, 100);
      setPlanes(res?.data ?? []);
    } catch {
      // Silently fail - planes are optional for import
    }
  };

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await getMatterPlanList();
      setSubjects(res ?? []);
    } catch {
      setError("Error al cargar materias");
      toast.error("Error al cargar las materias");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (subject: MatterPlan) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMatterPlan(subjectToDelete.idMateriaPlan);
      setSubjects((prev) => prev.filter((s) => s.idMateriaPlan !== subjectToDelete.idMateriaPlan));
      toast.success("Materia eliminada exitosamente");
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
          return;
        }
      }
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la materia";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (subject: MatterPlan) => {
    setSubjectToEdit(subject);
    setEditDialogOpen(true);
  };

  const filteredSubjects = subjects.filter((s) =>
    s.nombreMateria?.toLowerCase().includes(searchTerm.toLowerCase()) ??
    s.materia?.toLowerCase().includes(searchTerm.toLowerCase()) ??
    s.claveMateria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalCreditos = subjects.reduce((sum, s) => sum + (s.creditos ?? 0), 0);
  const cuatrimestres = new Set(subjects.map(s => s.cuatrimestre).filter(Boolean));

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando materias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
            <Button onClick={loadSubjects} className="mt-4 w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
            >
              <BookOpen className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Materias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de materias del plan de estudios
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportModalOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <CreateSubjectDialog open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Materias</CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {subjects.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Total Créditos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {totalCreditos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Cuatrimestres</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {cuatrimestres.size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">Promedio Créditos</CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              {subjects.length > 0 ? Math.round(totalCreditos / subjects.length) : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Materias</CardTitle>
              <CardDescription>
                {filteredSubjects.length} materias encontradas
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow
                className="hover:bg-transparent"
                style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
              >
                <TableHead className="font-semibold text-white">Clave</TableHead>
                <TableHead className="font-semibold text-white">Nombre</TableHead>
                <TableHead className="font-semibold text-white text-center">Cuatrimestre</TableHead>
                <TableHead className="font-semibold text-white text-center">Créditos</TableHead>
                <TableHead className="font-semibold text-white">Plan de Estudios</TableHead>
                <TableHead className="font-semibold text-white text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                      <span>No se encontraron materias</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((s, index) => (
                  <TableRow
                    key={s.idMateriaPlan}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono"
                        style={{ background: 'rgba(20, 53, 111, 0.05)', color: '#14356F', borderColor: 'rgba(20, 53, 111, 0.2)' }}
                      >
                        {s.claveMateria ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded"
                          style={{ background: 'rgba(20, 53, 111, 0.1)' }}
                        >
                          <BookOpen className="h-4 w-4" style={{ color: '#14356F' }} />
                        </div>
                        <span className="font-medium">{s.nombreMateria ?? s.materia}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        {s.cuatrimestre}°
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{s.creditos ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-xs">{s.nombrePlanEstudios ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => openEditDialog(s)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={() => openDeleteDialog(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Materia"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente la materia:"
        itemName={subjectToDelete?.nombreMateria ?? subjectToDelete?.materia}
        onConfirm={handleDeleteSubject}
        isDeleting={isDeleting}
      />

      <EditSubjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        subject={subjectToEdit}
        onSuccess={loadSubjects}
      />

      <ImportSubjectsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        planes={planes}
        onSuccess={loadSubjects}
      />
    </div>
  );
}
