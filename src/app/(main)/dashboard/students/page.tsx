
"use client";
import { useCallback, useEffect, useState } from "react";

import { BookOpen, Filter, GraduationCap, Search, UserCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getAcademicPeriods, getGrupos, getStudyPlans } from "@/services/catalogs-service";
import {
  getAvailableGruposMaterias,
  getStudentsByGrupo,
  getStudentsByGrupoMateria,
  getStudentsList,
} from "@/services/students-service";
import { AcademicPeriod, Grupo, StudyPlan } from "@/types/catalog";
import { GrupoMateria, Student, StudentsResponse } from "@/types/student";

import { getStudentsColumns } from "./_components/columns";
import { CreateStudentModal } from "./_components/create-student-modal";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<StudentsResponse | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [gruposMaterias, setGruposMaterias] = useState<GrupoMateria[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all");
  const [selectedStudyPlanId, setSelectedStudyPlanId] = useState<string>("all");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("all");
  const [selectedGrupoMateriaId, setSelectedGrupoMateriaId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterType, setFilterType] = useState<"plan" | "grupo" | "grupomateria" | "none">("none");

  const loadStudents = useCallback(() => {
    setLoading(true);
    getStudentsList()
      .then((res) => {
        setStudents(res);
        setAllStudents(res.items ?? []);
      })
      .catch(() => setError("Error de red"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStudents();
    loadInitialData();
  }, [loadStudents]);

  useEffect(() => {
    if (selectedPeriodId && selectedPeriodId !== "all") {
      loadGrupos();
      loadGruposMaterias();
    } else {
      setGrupos([]);
      setGruposMaterias([]);
      setSelectedGrupoId("all");
      setSelectedGrupoMateriaId("all");
    }
  }, [selectedPeriodId]);

  useEffect(() => {
    if (selectedGrupoMateriaId && selectedGrupoMateriaId !== "all") {
      setFilterType("grupomateria");
      filterStudentsByGrupoMateria();
    } else if (selectedGrupoId && selectedGrupoId !== "all") {
      setFilterType("grupo");
      filterStudentsByGrupo();
    } else if (selectedStudyPlanId && selectedStudyPlanId !== "all") {
      setFilterType("plan");
      filterStudentsByPlan();
    } else if (allStudents.length > 0) {
      setFilterType("none");
      setStudents({ ...students!, items: allStudents });
    }
  }, [selectedGrupoMateriaId, selectedGrupoId, selectedStudyPlanId]);

  const loadInitialData = async () => {
    try {
      const [periods, plans] = await Promise.all([getAcademicPeriods(), getStudyPlans()]);
      setAcademicPeriods(periods);
      setStudyPlans(plans);

      const currentPeriod = periods.find((p: AcademicPeriod) => p.esPeriodoActual);
      if (currentPeriod) {
        setSelectedPeriodId(currentPeriod.idPeriodoAcademico.toString());
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const loadGrupos = async () => {
    try {
      setFilterLoading(true);
      const gruposData = await getGrupos(parseInt(selectedPeriodId));
      setGrupos(gruposData);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      toast.error("Error al cargar grupos");
    } finally {
      setFilterLoading(false);
    }
  };

  const loadGruposMaterias = async () => {
    try {
      setFilterLoading(true);
      const grupos = await getAvailableGruposMaterias(undefined, parseInt(selectedPeriodId));
      setGruposMaterias(grupos);
    } catch (error) {
      console.error("Error al cargar grupos-materias:", error);
      toast.error("Error al cargar grupos-materias");
    } finally {
      setFilterLoading(false);
    }
  };

  const filterStudentsByPlan = () => {
    const filtered = allStudents.filter((s) => s.idPlanActual?.toString() === selectedStudyPlanId);
    setStudents({
      items: filtered,
      totalItems: filtered.length,
      pageNumber: 1,
      pageSize: filtered.length,
      totalPages: 1,
    });
  };

  const filterStudentsByGrupo = async () => {
    try {
      setFilterLoading(true);
      const filteredStudents = await getStudentsByGrupo(parseInt(selectedGrupoId));
      setStudents({
        items: filteredStudents,
        totalItems: filteredStudents.length,
        pageNumber: 1,
        pageSize: filteredStudents.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Error al filtrar estudiantes:", error);
      toast.error("Error al filtrar estudiantes");
    } finally {
      setFilterLoading(false);
    }
  };

  const filterStudentsByGrupoMateria = async () => {
    try {
      setFilterLoading(true);
      const filteredStudents = await getStudentsByGrupoMateria(parseInt(selectedGrupoMateriaId));
      setStudents({
        items: filteredStudents,
        totalItems: filteredStudents.length,
        pageNumber: 1,
        pageSize: filteredStudents.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Error al filtrar estudiantes:", error);
      toast.error("Error al filtrar estudiantes");
    } finally {
      setFilterLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedPeriodId("all");
    setSelectedStudyPlanId("all");
    setSelectedGrupoId("all");
    setSelectedGrupoMateriaId("all");
    setSearchTerm("");
    setFilterType("none");
    setStudents({ ...students!, items: allStudents });
  };

  const currentPeriodId = selectedPeriodId !== "all" ? parseInt(selectedPeriodId) : undefined;

  const table = useDataTableInstance({
    data: students?.items ?? [],
    columns: getStudentsColumns(loadStudents, currentPeriodId),
    getRowId: (row) => row.idEstudiante.toString(),
  });

  // Estadísticas
  const totalStudents = allStudents.length;
  const activeStudents = allStudents.filter(s => s.activo !== false).length;
  const uniquePlans = new Set(allStudents.map(s => s.idPlanActual).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando estudiantes...</span>
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
            <Button onClick={loadStudents} className="mt-4 w-full">
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
              <Users className="h-8 w-8" style={{ color: '#14356F' }} />
            </div>
            Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión y seguimiento de estudiantes inscritos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="border-2"
          style={{ borderColor: 'rgba(20, 53, 111, 0.2)', background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))' }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: '#1e4a8f' }}>Total Estudiantes</CardDescription>
            <CardTitle className="text-4xl" style={{ color: '#14356F' }}>
              {totalStudents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Activos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {activeStudents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Planes de Estudio</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {uniquePlans}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">Mostrados</CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              {students?.items?.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="studyPlan" className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">Plan de Estudios</span>
                </Label>
                <Select
                  value={selectedStudyPlanId}
                  onValueChange={(value) => {
                    setSelectedStudyPlanId(value);
                    setSelectedPeriodId("all");
                    setSelectedGrupoId("all");
                    setSelectedGrupoMateriaId("all");
                  }}
                >
                  <SelectTrigger className="text-sm w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los planes</SelectItem>
                    {studyPlans.map((plan) => (
                      <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                        {plan.nombrePlanEstudios}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="period" className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">Periodo Académico</span>
                </Label>
                <Select
                  value={selectedPeriodId}
                  onValueChange={(value) => {
                    setSelectedPeriodId(value);
                    setSelectedStudyPlanId("all");
                  }}
                >
                  <SelectTrigger className="text-sm w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue placeholder="Selecciona un periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los periodos</SelectItem>
                    {academicPeriods.map((period) => (
                      <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                        {period.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="grupo" className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">Código de Grupo</span>
                </Label>
                <Select
                  value={selectedGrupoId}
                  onValueChange={(value) => {
                    setSelectedGrupoId(value);
                    setSelectedGrupoMateriaId("all");
                    setSelectedStudyPlanId("all");
                  }}
                  disabled={selectedPeriodId === "all" || filterLoading}
                >
                  <SelectTrigger className="text-sm w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.idGrupo} value={grupo.idGrupo.toString()}>
                        {grupo.codigoGrupo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="grupoMateria" className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">Grupo-Materia</span>
                </Label>
                <Select
                  value={selectedGrupoMateriaId}
                  onValueChange={(value) => {
                    setSelectedGrupoMateriaId(value);
                    setSelectedGrupoId("all");
                    setSelectedStudyPlanId("all");
                  }}
                  disabled={selectedPeriodId === "all" || filterLoading}
                >
                  <SelectTrigger className="text-sm w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue placeholder="Selecciona grupo-materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {gruposMaterias.map((gm) => (
                      <SelectItem key={gm.idGrupoMateria} value={gm.idGrupoMateria.toString()}>
                        {gm.nombreMateria} - Grupo {gm.grupo} ({gm.inscritos}/{gm.cupoMaximo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-t">
              <Button onClick={clearFilters} variant="outline" size="sm" className="shrink-0">
                <X className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>

              {filterType !== "none" && students?.items && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 px-3 py-2 max-w-full sm:max-w-[60%] flex items-center gap-2"
                  title={
                    filterType === "plan"
                      ? studyPlans.find((p) => p.idPlanEstudios.toString() === selectedStudyPlanId)?.nombrePlanEstudios
                      : filterType === "grupo"
                      ? grupos.find((g) => g.idGrupo.toString() === selectedGrupoId)?.codigoGrupo
                      : gruposMaterias.find((gm) => gm.idGrupoMateria.toString() === selectedGrupoMateriaId)?.nombreMateria
                  }
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {students.items.length} estudiante(s)
                    {filterType === "plan" &&
                      ` en ${studyPlans.find((p) => p.idPlanEstudios.toString() === selectedStudyPlanId)?.nombrePlanEstudios}`}
                    {filterType === "grupo" &&
                      ` en grupo ${grupos.find((g) => g.idGrupo.toString() === selectedGrupoId)?.codigoGrupo}`}
                    {filterType === "grupomateria" &&
                      ` en ${gruposMaterias.find((gm) => gm.idGrupoMateria.toString() === selectedGrupoMateriaId)?.nombreMateria}`}
                  </span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateStudentModal open={open} onOpenChange={setOpen} />

      {/* Table */}
      {filterLoading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Filtrando estudiantes...</span>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b bg-muted/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Listado de Estudiantes</CardTitle>
                <CardDescription>
                  {students?.items?.length ?? 0} estudiantes encontrados
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable table={table} columns={getStudentsColumns(loadStudents, currentPeriodId)} />
          </CardContent>
          <div className="p-4 border-t">
            <DataTablePagination table={table} />
          </div>
        </Card>
      )}
    </div>
  );
}
