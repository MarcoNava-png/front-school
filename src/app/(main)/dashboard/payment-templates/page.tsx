"use client";

import { useEffect, useState } from "react";

import { Plus, Edit, Power, Eye, Calendar, Loader2, Trash2, AlertCircle, FileText, Search } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { getCampusList } from "@/services/campus-service";
import {
  listarPlantillas,
  cambiarEstadoPlantilla,
  eliminarPlantilla,
} from "@/services/plantillas-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { AcademicPeriod } from "@/types/academic-period";
import { Campus } from "@/types/campus";
import { PlantillaCobro } from "@/types/receipt";
import { StudyPlan } from "@/types/study-plan";

import { CreatePlantillaModal } from "./_components/create-plantilla-modal";
import { GenerarRecibosModal } from "./_components/generar-recibos-modal";
import { VistaPreviaModal } from "./_components/vista-previa-modal";

const ESTRATEGIAS_LABEL: Record<number, string> = {
  0: "Mensual",
  1: "Único",
  2: "Personalizado",
};

export default function PaymentTemplatesPage() {
  const [plantillas, setPlantillas] = useState<PlantillaCobro[]>([]);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<StudyPlan[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCampus, setSelectedCampus] = useState<string>("TODOS");
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("TODOS");
  const [selectedPlan, setSelectedPlan] = useState<string>("TODOS");
  const [soloActivas, setSoloActivas] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<PlantillaCobro | null>(null);
  const [vistaPreviaPlantilla, setVistaPreviaPlantilla] = useState<PlantillaCobro | null>(null);
  const [plantillaToDelete, setPlantillaToDelete] = useState<PlantillaCobro | null>(null);
  const [generarRecibosPlantilla, setGenerarRecibosPlantilla] = useState<PlantillaCobro | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarPlantillas();
  }, [selectedPeriodo, selectedPlan, soloActivas]);

  async function cargarDatosIniciales() {
    setLoading(true);
    try {
      const [periodosData, planesData, campusData] = await Promise.all([
        getAcademicPeriodsList(),
        getStudyPlansList(),
        getCampusList(),
      ]);
      setPeriodos(periodosData.items);
      setPlanesEstudio(planesData.items);
      setCampuses(campusData.items);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      setError("Error al cargar datos iniciales");
    }
    await cargarPlantillas();
  }

  async function cargarPlantillas() {
    setLoading(true);
    setError(null);
    try {
      const params: {
        soloActivas?: boolean;
        idPeriodoAcademico?: number;
        idPlanEstudios?: number;
      } = {};

      if (soloActivas) {
        params.soloActivas = true;
      }

      if (selectedPeriodo !== "TODOS") {
        params.idPeriodoAcademico = parseInt(selectedPeriodo);
      }

      if (selectedPlan !== "TODOS") {
        params.idPlanEstudios = parseInt(selectedPlan);
      }

      const data = await listarPlantillas(params);
      setPlantillas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar plantillas";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarEstado(idPlantilla: number, esActiva: boolean) {
    try {
      await cambiarEstadoPlantilla(idPlantilla, esActiva);
      toast.success(esActiva ? "Plantilla activada" : "Plantilla desactivada");
      cargarPlantillas();
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al cambiar estado";
      toast.error(errorMessage);
    }
  }

  async function handleEliminar() {
    if (!plantillaToDelete) return;

    try {
      await eliminarPlantilla(plantillaToDelete.idPlantillaCobro);
      toast.success("Plantilla eliminada exitosamente");
      setPlantillaToDelete(null);
      cargarPlantillas();
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al eliminar plantilla";
      toast.error(errorMessage);
    }
  }

  function handleEdit(plantilla: PlantillaCobro) {
    setEditingPlantilla(plantilla);
    setCreateModalOpen(true);
  }

  function handleCloseModal() {
    setCreateModalOpen(false);
    setEditingPlantilla(null);
    cargarPlantillas();
  }

  function getNombrePlan(idPlanEstudios: number): string {
    const plan = planesEstudio.find((p) => p.idPlanEstudios === idPlanEstudios);
    return plan ? `${plan.clavePlanEstudios} - ${plan.nombrePlanEstudios}` : `Plan #${idPlanEstudios}`;
  }

  function getPeriodicidadLabel(idPlanEstudios: number): string {
    const plan = planesEstudio.find((p) => p.idPlanEstudios === idPlanEstudios);
    if (!plan) return "Periodo";
    return plan.periodicidad?.toLowerCase().includes("semest") ? "Semestre" : "Cuatrimestre";
  }

  const planesFiltrados = selectedCampus === "TODOS"
    ? planesEstudio
    : planesEstudio.filter((p) => p.idCampus === parseInt(selectedCampus));

  function handleCampusChange(value: string) {
    setSelectedCampus(value);
    setSelectedPlan("TODOS");
  }

  if (loading && plantillas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">Cargando plantillas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <span className="truncate">Plantillas de Cobro</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configura plantillas de cobro por plan de estudios y periodo
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{error}</span>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={cargarPlantillas}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Campus</label>
              <Select value={selectedCampus} onValueChange={handleCampusChange}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Seleccionar campus" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="TODOS">Todos los campus</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.idCampus} value={campus.idCampus.toString()}>
                      {campus.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Plan de Estudios</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="TODOS">Todos los planes</SelectItem>
                  {planesFiltrados.map((plan) => (
                    <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                      <span className="truncate">
                        {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
                        {plan.periodicidad ? ` (${plan.periodicidad})` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Periodo Académico</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="TODOS">Todos los periodos</SelectItem>
                  {periodos.map((p) => (
                    <SelectItem key={p.idPeriodoAcademico} value={p.idPeriodoAcademico.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Estado</label>
              <Select
                value={soloActivas ? "activas" : "todas"}
                onValueChange={(v) => setSoloActivas(v === "activas")}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="activas">Solo activas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={cargarPlantillas}
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">Plantillas Registradas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {plantillas.length} plantilla{plantillas.length !== 1 ? "s" : ""} encontrada{plantillas.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {plantillas.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground px-4">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No hay plantillas registradas</p>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primera plantilla
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-600 hover:bg-blue-600">
                        <TableHead className="text-white font-semibold">Nombre</TableHead>
                        <TableHead className="text-white font-semibold">Plan de Estudios</TableHead>
                        <TableHead className="text-white font-semibold text-center">Periodo</TableHead>
                        <TableHead className="text-white font-semibold text-center">Recibos</TableHead>
                        <TableHead className="text-white font-semibold text-center">Vencimiento</TableHead>
                        <TableHead className="text-white font-semibold text-center">Conceptos</TableHead>
                        <TableHead className="text-white font-semibold text-center">Estado</TableHead>
                        <TableHead className="text-white font-semibold text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plantillas.map((plantilla, index) => (
                        <TableRow
                          key={plantilla.idPlantillaCobro}
                          className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                        >
                          <TableCell className="font-medium">{plantilla.nombrePlantilla}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="truncate max-w-[200px]">
                                {plantilla.nombrePlanEstudios ?? getNombrePlan(plantilla.idPlanEstudios)}
                              </div>
                              {plantilla.nombrePeriodo && (
                                <div className="text-muted-foreground text-xs truncate">
                                  {plantilla.nombrePeriodo}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {plantilla.numeroCuatrimestre}° {getPeriodicidadLabel(plantilla.idPlanEstudios)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div>{plantilla.numeroRecibos}</div>
                              <div className="text-muted-foreground text-xs">
                                {ESTRATEGIAS_LABEL[plantilla.estrategiaEmision] ?? "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">Día {plantilla.diaVencimiento}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-gray-100">
                              {plantilla.totalConceptos ?? plantilla.detalles?.length ?? 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {plantilla.esActiva ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Activa
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                Inactiva
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setGenerarRecibosPlantilla(plantilla)}
                                title="Generar recibos masivamente"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVistaPreviaPlantilla(plantilla)}
                                title="Vista previa"
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(plantilla)}
                                title="Editar"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCambiarEstado(plantilla.idPlantillaCobro, !plantilla.esActiva)}
                                title={plantilla.esActiva ? "Desactivar" : "Activar"}
                                className={`h-8 w-8 p-0 ${
                                  plantilla.esActiva
                                    ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPlantillaToDelete(plantilla)}
                                title="Eliminar"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <div className="md:hidden space-y-3 px-4 pb-4">
                {plantillas.map((plantilla, index) => (
                  <Card
                    key={plantilla.idPlantillaCobro}
                    className={`overflow-hidden ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm truncate flex-1 mr-2">
                        {plantilla.nombrePlantilla}
                      </h3>
                      {plantilla.esActiva ? (
                        <Badge className="bg-green-500 text-white hover:bg-green-500 text-xs">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs">
                          Inactiva
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Plan de Estudios</span>
                          <p className="font-medium truncate">
                            {plantilla.nombrePlanEstudios ?? getNombrePlan(plantilla.idPlanEstudios)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">{getPeriodicidadLabel(plantilla.idPlanEstudios)}</span>
                          <p className="font-medium">{plantilla.numeroCuatrimestre}°</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Recibos</span>
                          <p className="font-medium">
                            {plantilla.numeroRecibos} ({ESTRATEGIAS_LABEL[plantilla.estrategiaEmision] ?? "N/A"})
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Vencimiento</span>
                          <p className="font-medium">Día {plantilla.diaVencimiento}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Conceptos</span>
                          <p className="font-medium">
                            {plantilla.totalConceptos ?? plantilla.detalles?.length ?? 0}
                          </p>
                        </div>
                        {plantilla.nombrePeriodo && (
                          <div>
                            <span className="text-muted-foreground text-xs">Periodo</span>
                            <p className="font-medium truncate">{plantilla.nombrePeriodo}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGenerarRecibosPlantilla(plantilla)}
                          className="flex-1 text-xs h-9 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Generar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVistaPreviaPlantilla(plantilla)}
                          className="h-9 w-9 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plantilla)}
                          className="h-9 w-9 p-0 text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCambiarEstado(plantilla.idPlantillaCobro, !plantilla.esActiva)}
                          className={`h-9 w-9 p-0 ${
                            plantilla.esActiva
                              ? "text-green-600 border-green-200 hover:bg-green-50"
                              : "text-gray-400 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlantillaToDelete(plantilla)}
                          className="h-9 w-9 p-0 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <CreatePlantillaModal
        open={createModalOpen}
        onClose={handleCloseModal}
        plantillaToEdit={editingPlantilla}
      />

      {vistaPreviaPlantilla && (
        <VistaPreviaModal
          plantilla={vistaPreviaPlantilla}
          open={!!vistaPreviaPlantilla}
          onClose={() => setVistaPreviaPlantilla(null)}
        />
      )}
      <AlertDialog open={!!plantillaToDelete} onOpenChange={() => setPlantillaToDelete(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Eliminar Plantilla</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que deseas eliminar la plantilla{" "}
              <span className="font-semibold">&quot;{plantillaToDelete?.nombrePlantilla}&quot;</span>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {generarRecibosPlantilla && (
        <GenerarRecibosModal
          plantilla={generarRecibosPlantilla}
          open={!!generarRecibosPlantilla}
          onClose={() => setGenerarRecibosPlantilla(null)}
          periodicidadLabel={getPeriodicidadLabel(generarRecibosPlantilla.idPlanEstudios)}
        />
      )}
    </div>
  );
}
