"use client";

import { useState, useEffect, useMemo } from "react";

import { useParams, useRouter } from "next/navigation";

import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  AlertTriangle,
  Filter
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getKardexEstudiante } from "@/services/students-service";
import type { KardexData, MateriaKardex } from "@/types/student";

export default function KardexPage() {
  const params = useParams();
  const router = useRouter();
  const idEstudiante = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [kardexData, setKardexData] = useState<KardexData | null>(null);

  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("todos");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("todos");
  const [vistaAgrupada, setVistaAgrupada] = useState(false);

  useEffect(() => {
    loadKardex();
  }, [idEstudiante]);

  const loadKardex = async () => {
    setLoading(true);
    try {
      const kardex = await getKardexEstudiante(idEstudiante);
      setKardexData(kardex);
    } catch (error) {
      console.error("Error loading kardex:", error);
      toast.error("Error al cargar el kárdex del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    toast.info("Generación de PDF en desarrollo");
  };

  const getColorByGrade = (grade: number | null) => {
    if (grade === null) return "text-gray-400";
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-green-500";
    if (grade >= 70) return "text-blue-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const periodos = useMemo(() => {
    if (!kardexData) return [];
    const uniquePeriodos = [...new Set(kardexData.materias.map(m => m.periodoAcademico).filter(Boolean))];
    return uniquePeriodos.sort();
  }, [kardexData]);

  const grupos = useMemo(() => {
    if (!kardexData) return [];
    const uniqueGrupos = [...new Set(kardexData.materias.map(m => m.grupo).filter(Boolean))];
    return uniqueGrupos.sort();
  }, [kardexData]);

  const materiasFiltradas = useMemo(() => {
    if (!kardexData) return [];

    return kardexData.materias.filter(materia => {
      const matchPeriodo = selectedPeriodo === "todos" || materia.periodoAcademico === selectedPeriodo;
      const matchGrupo = selectedGrupo === "todos" || materia.grupo === selectedGrupo;
      return matchPeriodo && matchGrupo;
    });
  }, [kardexData, selectedPeriodo, selectedGrupo]);

  const materiasPorPeriodo = useMemo(() => {
    const grupos: { [key: string]: MateriaKardex[] } = {};

    materiasFiltradas.forEach(materia => {
      const periodo = materia.periodoAcademico;
      if (!grupos[periodo]) {
        grupos[periodo] = [];
      }
      grupos[periodo].push(materia);
    });

    return grupos;
  }, [materiasFiltradas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500">Cargando kárdex...</div>
        </div>
      </div>
    );
  }

  if (!kardexData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo cargar el kárdex</p>
        </div>
      </div>
    );
  }

  const porcentajeAvance = (kardexData.creditosAcumulados / kardexData.creditosTotal) * 100;
  const materiasAprobadas = materiasFiltradas.filter(m => m.estatus === "Aprobada");
  const materiasReprobadas = materiasFiltradas.filter(m => m.estatus === "Reprobada");
  const materiasCursando = materiasFiltradas.filter(m => m.estatus === "Cursando");

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              Kárdex Académico
            </h1>
            <p className="text-gray-600 mt-1">
              {kardexData.estudiante.nombreCompleto} - {kardexData.estudiante.matricula}
            </p>
          </div>
        </div>
        <Button onClick={generatePDF} className="gap-2">
          <Download className="w-4 h-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Promedio General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {kardexData.promedioGeneral.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Escala 0-100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {kardexData.creditosAcumulados}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${porcentajeAvance}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {porcentajeAvance.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              de {kardexData.creditosTotal} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {kardexData.materiasAprobadas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              de {kardexData.materiasTotal} materias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Reprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {kardexData.materiasReprobadas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {kardexData.materiasCursando} cursando actualmente
            </p>
          </CardContent>
        </Card>
      </div>
      {!kardexData.puedeReinscribirse && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Bloqueo de Reinscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {kardexData.motivosBloqueo.map((motivo, idx) => (
                <li key={idx} className="text-red-700">{motivo}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Periodo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo Académico</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los periodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los periodos</SelectItem>
                  {periodos.map(periodo => (
                    <SelectItem key={periodo} value={periodo}>
                      {periodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo</label>
              <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grupos</SelectItem>
                  {grupos.map(grupo => (
                    <SelectItem key={grupo} value={grupo}>
                      Grupo {grupo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{materiasFiltradas.length}</span> de{" "}
              <span className="font-semibold">{kardexData.materias.length}</span> materias
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Agrupar por periodo</span>
              <Button
                variant={vistaAgrupada ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaAgrupada(!vistaAgrupada)}
              >
                {vistaAgrupada ? "Vista agrupada" : "Vista lista"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Historial Académico
              </CardTitle>
              <CardDescription>
                Registro completo de materias cursadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todas">
                Todas ({materiasFiltradas.length})
              </TabsTrigger>
              <TabsTrigger value="aprobadas">
                Aprobadas ({materiasAprobadas.length})
              </TabsTrigger>
              <TabsTrigger value="reprobadas">
                Reprobadas ({materiasReprobadas.length})
              </TabsTrigger>
              <TabsTrigger value="cursando">
                Cursando ({materiasCursando.length})
              </TabsTrigger>
            </TabsList>

            {["todas", "aprobadas", "reprobadas", "cursando"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                {vistaAgrupada ? (
                  <div className="space-y-4">
                    {Object.entries(materiasPorPeriodo)
                      .filter(([, materiasDelPeriodo]) => {
                        const filtradas = materiasDelPeriodo.filter(m => {
                          if (tab === "aprobadas") return m.estatus === "Aprobada";
                          if (tab === "reprobadas") return m.estatus === "Reprobada";
                          if (tab === "cursando") return m.estatus === "Cursando";
                          return true;
                        });
                        return filtradas.length > 0;
                      })
                      .map(([periodo, materiasDelPeriodo]) => {
                        const materiasPeriodoFiltradas = materiasDelPeriodo.filter(m => {
                          if (tab === "aprobadas") return m.estatus === "Aprobada";
                          if (tab === "reprobadas") return m.estatus === "Reprobada";
                          if (tab === "cursando") return m.estatus === "Cursando";
                          return true;
                        });

                        return (
                          <Card key={periodo} className="border-2">
                            <CardHeader className="pb-3 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{periodo}</CardTitle>
                                <Badge variant="outline">
                                  {materiasPeriodoFiltradas.length} materias
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Clave</TableHead>
                                      <TableHead>Materia</TableHead>
                                      <TableHead className="text-center">Créditos</TableHead>
                                      <TableHead>Grupo</TableHead>
                                      <TableHead className="text-center">P1</TableHead>
                                      <TableHead className="text-center">P2</TableHead>
                                      <TableHead className="text-center">P3</TableHead>
                                      <TableHead className="text-center">Final</TableHead>
                                      <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {materiasPeriodoFiltradas.map((materia) => (
                                      <TableRow key={materia.idInscripcion}>
                                        <TableCell className="font-mono text-sm">
                                          {materia.claveMateria}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {materia.nombreMateria}
                                        </TableCell>
                                        <TableCell className="text-center">
                                          {materia.creditos}
                                        </TableCell>
                                        <TableCell>{materia.grupo}</TableCell>
                                        <TableCell className="text-center">
                                          <span className={getColorByGrade(materia.parciales.p1 || null)}>
                                            {materia.parciales.p1?.toFixed(1) || "-"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <span className={getColorByGrade(materia.parciales.p2 || null)}>
                                            {materia.parciales.p2?.toFixed(1) || "-"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <span className={getColorByGrade(materia.parciales.p3 || null)}>
                                            {materia.parciales.p3?.toFixed(1) || "-"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <span className={`font-bold ${getColorByGrade(materia.calificacionFinal)}`}>
                                            {materia.calificacionFinal?.toFixed(1) || "-"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge
                                            variant={
                                              materia.estatus === "Aprobada"
                                                ? "default"
                                                : materia.estatus === "Reprobada"
                                                ? "destructive"
                                                : "secondary"
                                            }
                                          >
                                            {materia.estatus}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clave</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead className="text-center">Créditos</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead className="text-center">P1</TableHead>
                        <TableHead className="text-center">P2</TableHead>
                        <TableHead className="text-center">P3</TableHead>
                        <TableHead className="text-center">Final</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materiasFiltradas
                        .filter(m => {
                          if (tab === "aprobadas") return m.estatus === "Aprobada";
                          if (tab === "reprobadas") return m.estatus === "Reprobada";
                          if (tab === "cursando") return m.estatus === "Cursando";
                          return true;
                        })
                        .map((materia) => (
                          <TableRow key={materia.idInscripcion}>
                            <TableCell className="font-mono text-sm">
                              {materia.claveMateria}
                            </TableCell>
                            <TableCell className="font-medium">
                              {materia.nombreMateria}
                            </TableCell>
                            <TableCell className="text-center">
                              {materia.creditos}
                            </TableCell>
                            <TableCell>{materia.grupo}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {materia.periodoAcademico}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={getColorByGrade(materia.parciales.p1 || null)}>
                                {materia.parciales.p1?.toFixed(1) || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={getColorByGrade(materia.parciales.p2 || null)}>
                                {materia.parciales.p2?.toFixed(1) || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={getColorByGrade(materia.parciales.p3 || null)}>
                                {materia.parciales.p3?.toFixed(1) || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-bold ${getColorByGrade(materia.calificacionFinal)}`}>
                                {materia.calificacionFinal?.toFixed(1) || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  materia.estatus === "Aprobada"
                                    ? "default"
                                    : materia.estatus === "Reprobada"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {materia.estatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
