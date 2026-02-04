"use client";

import { useEffect, useState } from "react";

import { Award, Calendar, Edit, GraduationCap, Layers, Search, Trash2, Upload, Power, Building2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { TablePagination } from "@/components/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCampusList } from "@/services/campus-service";
import { deleteStudyPlan, getStudyPlansList, toggleStudyPlanStatus, StudyPlanFilters } from "@/services/study-plans-service";
import { Campus } from "@/types/campus";
import { StudyPlan } from "@/types/study-plan";

import { CreateStudyPlanDialog } from "./_components/create-study-plan-dialog";
import { EditStudyPlanDialog } from "./_components/edit-study-plan-dialog";
import { ImportStudyPlansModal } from "./_components/import-study-plans-modal";

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<StudyPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [incluirInactivos, setIncluirInactivos] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<StudyPlan | null>(null);

  useEffect(() => {
    getCampusList()
      .then((res) => setCampusList(res.items))
      .catch(() => toast.error("Error al cargar campus"));
  }, []);

  useEffect(() => {
    loadPlans();
  }, [selectedCampus, incluirInactivos]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const filters: StudyPlanFilters = {
        incluirInactivos,
      };
      if (selectedCampus !== "all") {
        filters.idCampus = parseInt(selectedCampus);
      }
      const res = await getStudyPlansList(filters);
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

  const openEditDialog = (plan: StudyPlan) => {
    setPlanToEdit(plan);
    setEditDialogOpen(true);
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

  const handleToggleStatus = async (plan: StudyPlan) => {
    try {
      const updated = await toggleStudyPlanStatus(plan.idPlanEstudios);
      setPlans((prev) =>
        prev.map((p) => (p.idPlanEstudios === plan.idPlanEstudios ? updated : p))
      );
      toast.success(
        updated.activo
          ? "Plan de estudios activado"
          : "Plan de estudios desactivado"
      );
    } catch {
      toast.error("Error al cambiar el estado del plan");
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.nombrePlanEstudios?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clavePlanEstudios?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const activos = plans.filter((p) => p.activo).length;
  const inactivos = plans.filter((p) => !p.activo).length;
  const niveles = new Set(plans.map((p) => p.idNivelEducativo).filter(Boolean));

  const getPeriodLabel = (periodicidad: string) => {
    if (!periodicidad) return "Periodos";
    const lower = periodicidad.toLowerCase();
    if (lower.includes("cuatrimest")) return "Cuatrimestres";
    if (lower.includes("semest")) return "Semestres";
    if (lower.includes("anual")) return "Anos";
    if (lower.includes("trimest")) return "Trimestres";
    return "Periodos";
  };

  const getPeriodCount = (plan: StudyPlan) => {
    if (!plan.duracionMeses) return "-";
    const periodicidad = plan.periodicidad?.toLowerCase() || "";
    if (periodicidad.includes("cuatrimest")) {
      return Math.ceil(plan.duracionMeses / 4);
    }
    if (periodicidad.includes("semest")) {
      return Math.ceil(plan.duracionMeses / 6);
    }
    if (periodicidad.includes("trimest")) {
      return Math.ceil(plan.duracionMeses / 3);
    }
    if (periodicidad.includes("anual")) {
      return Math.ceil(plan.duracionMeses / 12);
    }
    return Math.ceil(plan.duracionMeses / 4);
  };

  if (loading && plans.length === 0) {
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
            Gestiona los planes de estudio de los programas academicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <CreateStudyPlanDialog open={open} setOpen={setOpen} onSuccess={loadPlans} />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:w-64 space-y-2">
              <Label className="text-sm font-semibold">Campus</Label>
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-full">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Todos los campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los campus</SelectItem>
                  {campusList.map((c) => (
                    <SelectItem key={c.idCampus} value={c.idCampus.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirInactivos"
                checked={incluirInactivos}
                onCheckedChange={(checked) => setIncluirInactivos(!!checked)}
              />
              <Label htmlFor="incluirInactivos" className="text-sm cursor-pointer">
                Incluir inactivos
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {inactivos}
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
                onChange={(e) => handleSearch(e.target.value)}
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
                <TableHead className="font-semibold text-white">Campus</TableHead>
                <TableHead className="font-semibold text-white text-center">Periodos</TableHead>
                <TableHead className="font-semibold text-white text-center">RVOE</TableHead>
                <TableHead className="font-semibold text-white">Estado</TableHead>
                <TableHead className="font-semibold text-white text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8" />
                      <span>No se encontraron planes de estudio</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlans.map((plan, index) => (
                  <TableRow
                    key={plan.idPlanEstudios}
                    className={`${index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"} ${!plan.activo ? "opacity-60" : ""}`}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono"
                        style={{ background: 'rgba(20, 53, 111, 0.05)', color: '#14356F', borderColor: 'rgba(20, 53, 111, 0.2)' }}
                      >
                        {plan.clavePlanEstudios ?? "-"}
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{plan.nombreCampus || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className="font-semibold">{getPeriodCount(plan)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getPeriodLabel(plan.periodicidad)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Layers className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{plan.rvoe ?? "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={plan.activo ? "default" : "secondary"}
                        className={plan.activo
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
                      >
                        {plan.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                onClick={() => openEditDialog(plan)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 w-8 p-0 ${plan.activo
                                  ? "hover:bg-orange-100 hover:text-orange-600"
                                  : "hover:bg-green-100 hover:text-green-600"}`}
                                onClick={() => handleToggleStatus(plan)}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {plan.activo ? "Desactivar" : "Activar"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                onClick={() => openDeleteDialog(plan)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredPlans.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Plan de Estudios"
        description="Esta accion no se puede deshacer. Se eliminara permanentemente el plan de estudios:"
        itemName={planToDelete?.nombrePlanEstudios}
        onConfirm={handleDeleteStudyPlan}
        isDeleting={isDeleting}
      />

      <ImportStudyPlansModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportSuccess={loadPlans}
      />

      <EditStudyPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={planToEdit}
        onSuccess={loadPlans}
      />
    </div>
  );
}
