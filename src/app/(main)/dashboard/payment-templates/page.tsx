"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Power, Eye, Calendar, Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getAcademicPeriodsList } from "@/services/academic-period-service";
import {
  listarPlantillas,
  cambiarEstadoPlantilla,
  eliminarPlantilla,
} from "@/services/plantillas-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { AcademicPeriod } from "@/types/academic-period";
import { PlantillaCobro } from "@/types/receipt";
import { StudyPlan } from "@/types/study-plan";
import { CreatePlantillaModal } from "./_components/create-plantilla-modal";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("TODOS");
  const [selectedPlan, setSelectedPlan] = useState<string>("TODOS");
  const [soloActivas, setSoloActivas] = useState(false);

  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<PlantillaCobro | null>(null);
  const [vistaPreviaPlantilla, setVistaPreviaPlantilla] = useState<PlantillaCobro | null>(null);
  const [plantillaToDelete, setPlantillaToDelete] = useState<PlantillaCobro | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    cargarPlantillas();
  }, [selectedPeriodo, selectedPlan, soloActivas]);

  async function cargarDatosIniciales() {
    setLoading(true);
    try {
      const [periodosData, planesData] = await Promise.all([
        getAcademicPeriodsList(),
        getStudyPlansList(),
      ]);
      setPeriodos(periodosData.items);
      setPlanesEstudio(planesData.items);
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
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cambiar estado";
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
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar plantilla";
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

  if (loading && plantillas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando plantillas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Plantillas de Cobro
          </h1>
          <p className="text-muted-foreground">
            Configura plantillas de cobro por plan de estudios y cuatrimestre
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="link" className="ml-2 p-0 h-auto" onClick={cargarPlantillas}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan de Estudios</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los planes</SelectItem>
                  {planesEstudio.map((plan) => (
                    <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                      {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo Académico</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={soloActivas ? "activas" : "todas"}
                onValueChange={(v) => setSoloActivas(v === "activas")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="activas">Solo activas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={cargarPlantillas} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Plantillas */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Registradas ({plantillas.length})</CardTitle>
          <CardDescription>
            Gestiona las plantillas de cobro para diferentes planes de estudio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plantillas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay plantillas registradas</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera plantilla
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Plan de Estudios</TableHead>
                  <TableHead>Cuatrimestre</TableHead>
                  <TableHead>Recibos</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Conceptos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plantillas.map((plantilla) => (
                  <TableRow key={plantilla.idPlantillaCobro}>
                    <TableCell className="font-medium">{plantilla.nombrePlantilla}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{plantilla.nombrePlanEstudios || getNombrePlan(plantilla.idPlanEstudios)}</div>
                        {plantilla.nombrePeriodo && (
                          <div className="text-muted-foreground text-xs">{plantilla.nombrePeriodo}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plantilla.numeroCuatrimestre}°</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{plantilla.numeroRecibos} recibos</div>
                        <div className="text-muted-foreground text-xs">
                          {ESTRATEGIAS_LABEL[plantilla.estrategiaEmision] || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Día {plantilla.diaVencimiento}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {plantilla.totalConceptos ?? plantilla.detalles?.length ?? 0} conceptos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plantilla.esActiva ? (
                        <Badge variant="default">Activa</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVistaPreviaPlantilla(plantilla)}
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plantilla)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCambiarEstado(plantilla.idPlantillaCobro, !plantilla.esActiva)
                          }
                          title={plantilla.esActiva ? "Desactivar" : "Activar"}
                        >
                          <Power
                            className={`w-4 h-4 ${plantilla.esActiva ? "text-green-600" : "text-gray-400"}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPlantillaToDelete(plantilla)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
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

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!plantillaToDelete} onOpenChange={() => setPlantillaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Plantilla</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la plantilla &quot;{plantillaToDelete?.nombrePlantilla}&quot;?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
