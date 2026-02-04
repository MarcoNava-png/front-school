"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { BookOpen, Building2, ExternalLink, GraduationCap, Mail, Phone, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCampusList } from "@/services/campus-service";
import { getAcademicPeriods, getGrupos, getStudyPlans } from "@/services/catalogs-service";
import { getEstudiantesDelGrupoDirecto, getStudentsInGroup } from "@/services/groups-service";
import { Campus } from "@/types/campus";
import { AcademicPeriod, Grupo, StudyPlan } from "@/types/catalog";

interface StudentDisplay {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  planEstudios?: string;
  estado?: string;
  fechaInscripcion?: string;
  materiasInscritas?: number;
  fuente: 'directo' | 'materias';
}

export default function StudentsPage() {
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [students, setStudents] = useState<StudentDisplay[]>([]);

  const [selectedCampusId, setSelectedCampusId] = useState<string>("all");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const filteredPlans = useMemo(() => {
    if (selectedCampusId === "all") return studyPlans;
    return studyPlans.filter((plan) => plan.idCampus?.toString() === selectedCampusId);
  }, [studyPlans, selectedCampusId]);

  const filteredGrupos = useMemo(() => {
    if (!selectedPlanId) return grupos;
    return grupos.filter((g) => g.idPlanEstudios?.toString() === selectedPlanId);
  }, [grupos, selectedPlanId]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.nombreCompleto.toLowerCase().includes(term) ||
        s.matricula.toLowerCase().includes(term) ||
        (s.email && s.email.toLowerCase().includes(term))
    );
  }, [students, searchTerm]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filteredPlans.length > 0) {
      const currentPlanExists = filteredPlans.some((p) => p.idPlanEstudios.toString() === selectedPlanId);
      if (!currentPlanExists) {
        setSelectedPlanId(filteredPlans[0].idPlanEstudios.toString());
      }
    } else {
      setSelectedPlanId("");
    }
  }, [filteredPlans]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [campusData, plansData, periodsData] = await Promise.all([
        getCampusList(),
        getStudyPlans(),
        getAcademicPeriods(),
      ]);

      setCampusList(campusData.items || []);
      setStudyPlans(plansData);
      setAcademicPeriods(periodsData);

      const periodoActual = periodsData.find((p) => p.esPeriodoActual);
      if (periodoActual) {
        setSelectedPeriodId(periodoActual.idPeriodoAcademico.toString());
      } else if (periodsData.length > 0) {
        setSelectedPeriodId(periodsData[0].idPeriodoAcademico.toString());
      }

      if (plansData.length > 0) {
        setSelectedPlanId(plansData[0].idPlanEstudios.toString());
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos iniciales");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadGrupos = async () => {
    try {
      const gruposData = await getGrupos(parseInt(selectedPeriodId));
      setGrupos(gruposData);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      toast.error("Error al cargar grupos");
    }
  };

  const loadStudents = useCallback(async () => {
    if (!selectedGrupoId) return;
    setLoading(true);
    try {
      const idGrupo = parseInt(selectedGrupoId);

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
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast.error("Error al cargar estudiantes");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGrupoId]);

  useEffect(() => {
    if (selectedPeriodId) {
      loadGrupos();
    }
  }, [selectedPeriodId]);

  useEffect(() => {
    if (selectedGrupoId) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedGrupoId, loadStudents]);

  useEffect(() => {
    setSelectedGrupoId("");
    setStudents([]);
  }, [selectedPlanId]);

  const selectedGrupo = grupos.find((g) => g.idGrupo.toString() === selectedGrupoId);

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: "#14356F" }}
          ></div>
          <p className="text-gray-600 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))",
              }}
            >
              <Users className="w-8 h-8" style={{ color: "#14356F" }} />
            </div>
            Estudiantes por Grupo
          </h1>
          <p className="text-muted-foreground mt-1">Consulta los estudiantes inscritos en cada grupo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="campus" className="text-sm font-medium !text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: "#14356F" }} />
            Campus
          </Label>
          <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
            <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900">
              <SelectValue placeholder="Todos los campus" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
              <SelectItem
                value="all"
                className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 cursor-pointer"
              >
                Todos los campus
              </SelectItem>
              {campusList.map((campus) => (
                <SelectItem
                  key={campus.idCampus}
                  value={campus.idCampus.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 cursor-pointer"
                >
                  {campus.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan" className="text-sm font-medium !text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" style={{ color: "#14356F" }} />
            Licenciatura
          </Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full border-2 border-gray-400 bg-white !text-gray-900">
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent
              className="!bg-white !text-gray-900 z-[9999] max-h-[300px] border-2"
              style={{ borderColor: "#14356F" }}
            >
              {filteredPlans.length === 0 ? (
                <div className="p-4 text-center text-gray-900 bg-gray-100">No hay planes disponibles</div>
              ) : (
                filteredPlans.map((plan) => (
                  <SelectItem
                    key={plan.idPlanEstudios}
                    value={plan.idPlanEstudios.toString()}
                    className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 cursor-pointer min-h-[40px]"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(20, 53, 111, 0.1)", color: "#14356F" }}
                      >
                        {plan.clavePlanEstudios}
                      </span>
                      {plan.nombrePlanEstudios}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period" className="text-sm font-medium !text-gray-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: "#14356F" }} />
            Periodo Académico
          </Label>
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900">
              <SelectValue placeholder="Selecciona un periodo" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
              {academicPeriods.map((period) => (
                <SelectItem
                  key={period.idPeriodoAcademico}
                  value={period.idPeriodoAcademico.toString()}
                  className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-900">{period.nombre}</span>
                    {period.esPeriodoActual && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: "#14356F", color: "white" }}
                      >
                        Actual
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grupo" className="text-sm font-medium !text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "#14356F" }} />
            Grupo
          </Label>
          <Select value={selectedGrupoId} onValueChange={setSelectedGrupoId}>
            <SelectTrigger className="w-full bg-white border-gray-300 !text-gray-900">
              <SelectValue placeholder="Selecciona un grupo" />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900 z-[9999] max-h-[300px]">
              {filteredGrupos.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No hay grupos disponibles</div>
              ) : (
                filteredGrupos.map((grupo) => (
                  <SelectItem
                    key={grupo.idGrupo}
                    value={grupo.idGrupo.toString()}
                    className="!text-gray-900 !bg-white hover:!bg-[#14356F]/10 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ backgroundColor: "rgba(20, 53, 111, 0.1)", color: "#14356F" }}
                      >
                        {grupo.codigoGrupo}
                      </span>
                      {grupo.nombreGrupo}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedGrupo && (
        <div
          className="rounded-lg p-4 border-2"
          style={{
            background: "linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))",
            borderColor: "rgba(20, 53, 111, 0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" style={{ color: "#14356F" }} />
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#14356F" }}>
                  Grupo {selectedGrupo.codigoGrupo} - {selectedGrupo.nombreGrupo}
                </h2>
                <p style={{ color: "#1e4a8f" }} className="text-sm">
                  {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? "s" : ""} inscrito
                  {filteredStudents.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: "#14356F" }}></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      ) : !selectedGrupoId ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Selecciona un grupo</p>
          <p className="text-gray-500 text-sm mt-1">Elige un grupo para ver los estudiantes inscritos</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay estudiantes en este grupo</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Los estudiantes aparecerán aquí cuando se inscriban"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.idEstudiante}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{student.nombreCompleto}</h4>
                    <Badge
                      variant="outline"
                      className="font-mono"
                      style={{
                        background: "rgba(20, 53, 111, 0.05)",
                        color: "#14356F",
                        borderColor: "rgba(20, 53, 111, 0.2)",
                      }}
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
                        <GraduationCap className="w-4 h-4 flex-shrink-0" />
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
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#14356F] hover:text-white transition-colors"
                  >
                    <Link href={`/dashboard/students/${student.idEstudiante}/panel`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Panel
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
