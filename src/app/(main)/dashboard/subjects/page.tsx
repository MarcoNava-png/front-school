"use client";

import { useEffect, useState, useMemo } from "react";

import { BookOpen, ChevronDown, ChevronUp, Edit, Filter, GraduationCap, Hash, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { getCampusList } from "@/services/campus-service";
import { deleteMatterPlan, getMatterPlanList } from "@/services/matter-plan-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { Campus } from "@/types/campus";
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
  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<MatterPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<MatterPlan | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [planes, setPlanes] = useState<StudyPlan[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [expandedCuatrimestres, setExpandedCuatrimestres] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, planesRes, campusesRes] = await Promise.all([
        getMatterPlanList(),
        getStudyPlansList({ page: 1, pageSize: 100 }),
        getCampusList()
      ]);
      setSubjects(subjectsRes ?? []);
      setPlanes(planesRes?.items ?? []);
      setCampuses(campusesRes?.items ?? []);
    } catch {
      setError("Error al cargar datos");
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlanes = useMemo(() => {
    if (selectedCampusId === "all") return planes;
    return planes.filter(p => p.idCampus?.toString() === selectedCampusId);
  }, [planes, selectedCampusId]);

  useEffect(() => {
    if (selectedCampusId !== "all") {
      const planStillValid = filteredPlanes.some(p => p.idPlanEstudios.toString() === selectedPlanId);
      if (!planStillValid) {
        setSelectedPlanId("all");
      }
    }
  }, [selectedCampusId, filteredPlanes, selectedPlanId]);

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

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.nombreMateria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.materia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.claveMateria?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan =
        selectedPlanId === "all" || s.idPlanEstudios?.toString() === selectedPlanId;

      let matchesCampus = true;
      if (selectedCampusId !== "all") {
        const plan = planes.find(p => p.idPlanEstudios === s.idPlanEstudios);
        matchesCampus = plan?.idCampus?.toString() === selectedCampusId;
      }

      return matchesSearch && matchesPlan && matchesCampus;
    });
  }, [subjects, searchTerm, selectedPlanId, selectedCampusId, planes]);

  const subjectsByCuatrimestre = useMemo(() => {
    const grouped: Record<number, MatterPlan[]> = {};
    filteredSubjects.forEach((s) => {
      const cuatri = s.cuatrimestre ?? 0;
      if (!grouped[cuatri]) {
        grouped[cuatri] = [];
      }
      grouped[cuatri].push(s);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([cuatri, materias]) => ({
        cuatrimestre: Number(cuatri),
        materias
      }));
  }, [filteredSubjects]);

  const toggleCuatrimestre = (cuatri: number) => {
    setExpandedCuatrimestres(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cuatri)) {
        newSet.delete(cuatri);
      } else {
        newSet.add(cuatri);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCuatrimestres(new Set(subjectsByCuatrimestre.map(g => g.cuatrimestre)));
  };

  const collapseAll = () => {
    setExpandedCuatrimestres(new Set());
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCampusId("all");
    setSelectedPlanId("all");
  };

  const hasActiveFilters = searchTerm || selectedCampusId !== "all" || selectedPlanId !== "all";

  const selectedPlanName = useMemo(() => {
    if (selectedPlanId === "all") return null;
    return planes.find(p => p.idPlanEstudios.toString() === selectedPlanId)?.nombrePlanEstudios;
  }, [selectedPlanId, planes]);

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
            <Button onClick={loadData} className="mt-4 w-full">
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

      {/* Filtros */}
      <Card>
        <CardHeader className="border-b bg-muted/40 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" style={{ color: '#14356F' }} />
                  Filtros
                </CardTitle>
                <CardDescription>
                  Selecciona Campus y Plan de Estudios para ver las materias
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Filtros en cascada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campus */}
              <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los campus</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.idCampus} value={campus.idCampus.toString()}>
                      {campus.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Plan de Estudios */}
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Plan de Estudios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los planes</SelectItem>
                  {filteredPlanes.map((plan) => (
                    <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                      {plan.nombrePlanEstudios}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Listado por Cuatrimestre */}
      {selectedPlanId !== "all" && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{selectedPlanName}</h2>
            <p className="text-muted-foreground text-sm">
              {filteredSubjects.length} materias en {subjectsByCuatrimestre.length} cuatrimestres
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expandir todos
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Colapsar todos
            </Button>
          </div>
        </div>
      )}

      {subjectsByCuatrimestre.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <BookOpen className="h-12 w-12" />
              <span className="text-lg">No se encontraron materias</span>
              <span className="text-sm">Selecciona un campus y plan de estudios para ver las materias</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subjectsByCuatrimestre.map(({ cuatrimestre, materias }) => {
            const isExpanded = expandedCuatrimestres.has(cuatrimestre);
            return (
              <Card key={cuatrimestre} className="overflow-hidden">
                <button
                  onClick={() => toggleCuatrimestre(cuatrimestre)}
                  className="w-full"
                >
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ background: 'linear-gradient(to right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ background: 'linear-gradient(to bottom right, #14356F, #1e4a8f)' }}
                        >
                          <span className="text-white font-bold text-lg">{cuatrimestre}</span>
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-lg">
                            {cuatrimestre === 0 ? "Sin cuatrimestre asignado" : `${cuatrimestre}° Cuatrimestre`}
                          </CardTitle>
                          <CardDescription>
                            {materias.length} materia{materias.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow
                          className="hover:bg-transparent"
                          style={{ background: 'linear-gradient(to right, #14356F, #1e4a8f)' }}
                        >
                          <TableHead className="font-semibold text-white">Clave</TableHead>
                          <TableHead className="font-semibold text-white">Nombre</TableHead>
                          <TableHead className="font-semibold text-white text-center">Créditos</TableHead>
                          <TableHead className="font-semibold text-white text-center">Tipo</TableHead>
                          <TableHead className="font-semibold text-white text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materias.map((s, index) => (
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
                              <div className="flex items-center justify-center gap-1">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="font-semibold">{s.creditos ?? 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={s.esOptativa ? "secondary" : "default"}
                                className={s.esOptativa ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}
                              >
                                {s.esOptativa ? "Optativa" : "Obligatoria"}
                              </Badge>
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

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
        onSuccess={loadData}
      />

      <ImportSubjectsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        planes={planes}
        onSuccess={loadData}
      />
    </div>
  );
}
