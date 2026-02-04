"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Loader2,
  Search,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAcademicPeriods, getGrupos, getStudyPlans } from "@/services/catalogs-service";
import {
  executePromocion,
  ExecutePromocionRequest,
  EstudiantePreview,
  previewPromocion,
  PreviewPromocionResult,
} from "@/services/groups-service";
import { AcademicPeriod, Grupo, StudyPlan } from "@/types/catalog";

export default function PromotionsPage() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  const [previewData, setPreviewData] = useState<PreviewPromocionResult | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);

  const [validarPagos, setValidarPagos] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadGroups();
    } else {
      setGrupos([]);
      setSelectedGroupId("");
    }
  }, [selectedPlanId]);

  useEffect(() => {
    setPreviewData(null);
    setSelectedStudents(new Set());
  }, [selectedGroupId, selectedPeriodId]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [plansData, periodsData] = await Promise.all([
        getStudyPlans(),
        getAcademicPeriods(),
      ]);
      setStudyPlans(plansData);
      setAcademicPeriods(periodsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos iniciales");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const allGroups = await getGrupos();
      const filteredGroups = allGroups.filter(
        (g) => g.idPlanEstudios.toString() === selectedPlanId
      );
      setGrupos(filteredGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
      toast.error("Error al cargar los grupos");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedGroupId || !selectedPeriodId) {
      toast.error("Selecciona un grupo origen y un periodo destino");
      return;
    }

    setLoadingPreview(true);
    try {
      const result = await previewPromocion({
        idGrupoActual: parseInt(selectedGroupId),
        idPeriodoAcademicoDestino: parseInt(selectedPeriodId),
      });
      setPreviewData(result);
      const eligibleIds = result.estudiantes
        .filter((e) => e.esElegible)
        .map((e) => e.idEstudiante);
      setSelectedStudents(new Set(eligibleIds));
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Error al cargar el preview de promoción");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (!previewData || selectedStudents.size === 0) {
      toast.error("Selecciona al menos un estudiante para promover");
      return;
    }

    setExecuting(true);
    try {
      const allStudentIds = previewData.estudiantes.map((e) => e.idEstudiante);
      const excludedIds = allStudentIds.filter((id) => !selectedStudents.has(id));

      const request: ExecutePromocionRequest = {
        idGrupoActual: parseInt(selectedGroupId),
        idPeriodoAcademicoDestino: parseInt(selectedPeriodId),
        crearGrupoSiguienteAutomaticamente: true,
        validarPagos: validarPagos,
        estudiantesExcluidos: excludedIds.length > 0 ? excludedIds : undefined,
      };

      const result = await executePromocion(request);

      toast.success(
        `Promoción completada: ${result.totalEstudiantesPromovidos} estudiantes promovidos al grupo ${result.grupoDestino}`
      );

      setPreviewData(null);
      setSelectedStudents(new Set());
      setSelectedGroupId("");
      setSelectedPeriodId("");
    } catch (error: any) {
      console.error("Error executing promotion:", error);
      toast.error(error.response?.data?.message || "Error al ejecutar la promoción");
    } finally {
      setExecuting(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (!previewData) return;

    const eligibleIds = previewData.estudiantes
      .filter((e) => e.esElegible)
      .map((e) => e.idEstudiante);

    if (selectedStudents.size === eligibleIds.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(eligibleIds));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

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
                background:
                  "linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))",
              }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: "#14356F" }} />
            </div>
            Promoción de Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Promueve estudiantes al siguiente cuatrimestre validando pagos y requisitos
          </p>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" style={{ color: "#14356F" }} />
            Selección de Grupo y Periodo
          </CardTitle>
          <CardDescription>
            Selecciona el grupo origen y el periodo destino para la promoción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Study Plan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Licenciatura</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="w-full border-2 border-gray-300">
                  <SelectValue placeholder="Selecciona una licenciatura" />
                </SelectTrigger>
                <SelectContent>
                  {studyPlans.map((plan) => (
                    <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                      {plan.nombrePlanEstudios}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Grupo Origen</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
                disabled={!selectedPlanId || loadingGroups}
              >
                <SelectTrigger className="w-full border-2 border-gray-300">
                  <SelectValue
                    placeholder={
                      loadingGroups ? "Cargando grupos..." : "Selecciona el grupo origen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo.idGrupo} value={grupo.idGrupo.toString()}>
                      {grupo.nombreGrupo} ({grupo.codigoGrupo}) - {grupo.turno}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Periodo Destino</Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="w-full border-2 border-gray-300">
                  <SelectValue placeholder="Selecciona el periodo destino" />
                </SelectTrigger>
                <SelectContent>
                  {academicPeriods.map((period) => (
                    <SelectItem
                      key={period.idPeriodoAcademico}
                      value={period.idPeriodoAcademico.toString()}
                    >
                      {period.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validarPagos"
                checked={validarPagos}
                onCheckedChange={(checked) => setValidarPagos(!!checked)}
              />
              <Label htmlFor="validarPagos" className="text-sm cursor-pointer">
                Validar pagos al corriente
              </Label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handlePreview}
              disabled={!selectedGroupId || !selectedPeriodId || loadingPreview}
              className="text-white"
              style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
            >
              {loadingPreview ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>
      {previewData && (
        <>
          <Card
            className="border-2"
            style={{
              borderColor: "rgba(20, 53, 111, 0.3)",
              background:
                "linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))",
            }}
          >
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Grupo Origen</p>
                  <div
                    className="px-6 py-3 rounded-lg font-bold text-lg"
                    style={{ background: "#14356F", color: "white" }}
                  >
                    {previewData.codigoGrupoOrigen}
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#1e4a8f" }}>
                    {previewData.grupoOrigen}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cuatrimestre {previewData.cuatrimestreOrigen}
                  </p>
                </div>
                <div className="flex items-center">
                  <ChevronRight className="w-8 h-8 text-gray-400 hidden md:block" />
                  <ArrowRight className="w-8 h-8 text-gray-400 md:hidden" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Grupo Destino</p>
                  <div
                    className="px-6 py-3 rounded-lg font-bold text-lg"
                    style={{
                      background: previewData.grupoDestinoExiste ? "#059669" : "#9ca3af",
                      color: "white",
                    }}
                  >
                    {previewData.codigoGrupoDestino || `${previewData.cuatrimestreDestino}XX`}
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#059669" }}>
                    {previewData.grupoDestino || "Se creará automáticamente"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cuatrimestre {previewData.cuatrimestreDestino} - {previewData.periodoDestino}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-4">
            <Card
              className="border-2"
              style={{
                borderColor: "rgba(20, 53, 111, 0.2)",
                background:
                  "linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))",
              }}
            >
              <CardHeader className="pb-2">
                <CardDescription style={{ color: "#1e4a8f" }} className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Estudiantes
                </CardDescription>
                <CardTitle className="text-3xl" style={{ color: "#14356F" }}>
                  {previewData.totalEstudiantes}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-600 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Elegibles
                </CardDescription>
                <CardTitle className="text-3xl text-green-700">
                  {previewData.estudiantesElegibles}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Con Pagos Pendientes
                </CardDescription>
                <CardTitle className="text-3xl text-amber-700">
                  {previewData.estudiantesConPagosPendientes}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-red-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Saldo Pendiente Total
                </CardDescription>
                <CardTitle className="text-2xl text-red-700">
                  {formatCurrency(previewData.totalSaldoPendiente)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Estudiantes para Promoción
                  </CardTitle>
                  <CardDescription>
                    Selecciona los estudiantes que deseas promover al siguiente cuatrimestre
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-lg px-4 py-1"
                  style={{ borderColor: "#14356F", color: "#14356F" }}
                >
                  {selectedStudents.size} seleccionados
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            previewData.estudiantes.filter((e) => e.esElegible).length > 0 &&
                            selectedStudents.size ===
                              previewData.estudiantes.filter((e) => e.esElegible).length
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead className="text-center">Elegibilidad</TableHead>
                      <TableHead className="text-center">Pagos</TableHead>
                      <TableHead className="text-right">Saldo Pendiente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.estudiantes.map((student) => (
                      <StudentRow
                        key={student.idEstudiante}
                        student={student}
                        isSelected={selectedStudents.has(student.idEstudiante)}
                        onToggle={() => toggleStudent(student.idEstudiante)}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewData(null);
                    setSelectedStudents(new Set());
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleExecutePromotion}
                  disabled={selectedStudents.size === 0 || executing}
                  className="text-white min-w-[200px]"
                  style={{ background: "linear-gradient(to right, #059669, #10b981)" }}
                >
                  {executing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <GraduationCap className="w-4 h-4 mr-2" />
                  )}
                  Promover {selectedStudents.size} Estudiante{selectedStudents.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!previewData && selectedGroupId && selectedPeriodId && !loadingPreview && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Haz clic en &quot;Vista Previa&quot; para ver los estudiantes elegibles
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Se validarán requisitos académicos y estado de pagos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudentRow({
  student,
  isSelected,
  onToggle,
  formatCurrency,
}: {
  student: EstudiantePreview;
  isSelected: boolean;
  onToggle: () => void;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <TableRow className={isSelected ? "bg-blue-50" : ""}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={!student.esElegible}
        />
      </TableCell>
      <TableCell className="font-mono font-medium">{student.matricula}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{student.nombreCompleto}</p>
          {student.email && <p className="text-xs text-gray-500">{student.email}</p>}
        </div>
      </TableCell>
      <TableCell className="text-center">
        {student.esElegible ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Elegible
          </Badge>
        ) : (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {student.motivoNoElegible || "No elegible"}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-center">
        {student.tienePagosPendientes ? (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {student.recibosPendientes} recibo{student.recibosPendientes !== 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Al corriente
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {student.saldoPendiente > 0 ? (
          <span className="text-red-600 font-medium">{formatCurrency(student.saldoPendiente)}</span>
        ) : (
          <span className="text-gray-400">$0.00</span>
        )}
      </TableCell>
    </TableRow>
  );
}
