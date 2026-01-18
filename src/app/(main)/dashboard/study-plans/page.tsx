"use client";

import { useEffect, useState } from "react";

import { Award, Calendar, Edit, GraduationCap, Layers, Search, Trash2, Upload } from "lucide-react";
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
import { deleteStudyPlan, getStudyPlansList } from "@/services/study-plans-service";
import { StudyPlan } from "@/types/study-plan";

import { CreateStudyPlanDialog } from "./_components/create-study-plan-dialog";
import { ImportStudyPlansModal } from "./_components/import-study-plans-modal";

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<StudyPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await getStudyPlansList();
      if (res && Array.isArray(res.items)) {
        setPlans(res.items);
      } else {
        setPlans([]);
      }
    } catch {
      setError("Error al cargar planes de estudio");
      toast.error("Error al cargar los planes de estudio");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (plan: StudyPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteStudyPlan = async () => {
    if (!planToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStudyPlan(planToDelete.idPlanEstudios);
      setPlans((prev) => prev.filter((p) => p.idPlanEstudios !== planToDelete.idPlanEstudios));
      toast.success("Plan de estudios eliminado exitosamente");
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
          return;
        }
      }
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el plan";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.nombrePlanEstudios?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clavePlanEstudios?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const activos = plans.length; // Todos los planes se consideran activos
  const niveles = new Set(plans.map(p => p.idNivelEducativo).filter(Boolean));

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando planes de estudio...</span>
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
            <Button onClick={loadPlans} className="mt-4 w-full">
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
              <GraduationCap className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Planes de Estudio
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los planes de estudio de los programas académicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <CreateStudyPlanDialog open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Planes</CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {plans.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Activos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {activos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Niveles Educativos</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {niveles.size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">Inactivos</CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              {plans.length - activos}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Planes de Estudio</CardTitle>
              <CardDescription>
                {filteredPlans.length} planes encontrados
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
                <TableHead className="font-semibold text-white">Nombre del Plan</TableHead>
                <TableHead className="font-semibold text-white text-center">Cuatrimestres</TableHead>
                <TableHead className="font-semibold text-white text-center">RVOE</TableHead>
                <TableHead className="font-semibold text-white">Estado</TableHead>
                <TableHead className="font-semibold text-white text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8" />
                      <span>No se encontraron planes de estudio</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan, index) => (
                  <TableRow
                    key={plan.idPlanEstudios}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono"
                        style={{ background: 'rgba(20, 53, 111, 0.05)', color: '#14356F', borderColor: 'rgba(20, 53, 111, 0.2)' }}
                      >
                        {plan.clavePlanEstudios ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded"
                          style={{ background: 'rgba(20, 53, 111, 0.1)' }}
                        >
                          <Award className="h-4 w-4" style={{ color: '#14356F' }} />
                        </div>
                        <div>
                          <span className="font-medium block">{plan.nombrePlanEstudios}</span>
                          {plan.version && (
                            <span className="text-xs text-muted-foreground">v{plan.version}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold">{plan.duracionMeses ? Math.ceil(plan.duracionMeses / 4) : "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Layers className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{plan.rvoe ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => {
                            toast.info("Función de editar próximamente");
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={() => openDeleteDialog(plan)}
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
        title="Eliminar Plan de Estudios"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el plan de estudios:"
        itemName={planToDelete?.nombrePlanEstudios}
        onConfirm={handleDeleteStudyPlan}
        isDeleting={isDeleting}
      />

      <ImportStudyPlansModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={loadPlans}
      />
    </div>
  );
}
