"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { crearPlantilla, actualizarPlantilla, obtenerConceptosPago, obtenerCuatrimestresPorPlan } from "@/services/plantillas-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { AcademicPeriod } from "@/types/academic-period";
import { PlantillaCobro, CreatePlantillaCobroDto, CreatePlantillaCobroDetalleDto, ConceptoPago } from "@/types/receipt";
import { StudyPlan } from "@/types/study-plan";

interface Props {
  open: boolean;
  onClose: () => void;
  plantillaToEdit?: PlantillaCobro | null;
}

interface DetalleLocal {
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  orden: number;
  aplicaEnRecibo: number | null; // null=todos, 1=primero, -1=último, n=recibo específico
  nombreConcepto?: string;
}

const ESTRATEGIAS_EMISION = [
  { value: 0, label: "Mensual" },
  { value: 1, label: "Único (todos al inicio)" },
  { value: 2, label: "Personalizado" },
];

const OPCIONES_APLICA_RECIBO = [
  { value: "todos", label: "Todos los recibos" },
  { value: "primero", label: "Primer recibo" },
  { value: "ultimo", label: "Último recibo" },
  { value: "especifico", label: "Recibo específico" },
];

export function CreatePlantillaModal({ open, onClose, plantillaToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Datos para selects
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<StudyPlan[]>([]);
  const [periodosAcademicos, setPeriodosAcademicos] = useState<AcademicPeriod[]>([]);
  const [cuatrimestresDisponibles, setCuatrimestresDisponibles] = useState<number[]>([]);

  // Form state
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [idPlanEstudios, setIdPlanEstudios] = useState<string>("");
  const [numeroCuatrimestre, setNumeroCuatrimestre] = useState<string>("");
  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("");
  const [numeroRecibos, setNumeroRecibos] = useState("4");
  const [diaVencimiento, setDiaVencimiento] = useState("10");
  const [estrategiaEmision, setEstrategiaEmision] = useState("0");
  const [fechaVigenciaInicio, setFechaVigenciaInicio] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Detalles (conceptos)
  const [detalles, setDetalles] = useState<DetalleLocal[]>([]);

  useEffect(() => {
    if (open) {
      cargarDatosIniciales();
    }
  }, [open]);

  useEffect(() => {
    if (plantillaToEdit && !loadingData) {
      cargarDatosPlantilla(plantillaToEdit);
    } else if (!plantillaToEdit && !loadingData) {
      resetForm();
    }
  }, [plantillaToEdit, loadingData]);

  // Cargar cuatrimestres cuando cambia el plan de estudios
  useEffect(() => {
    if (idPlanEstudios) {
      cargarCuatrimestres(parseInt(idPlanEstudios));
    } else {
      setCuatrimestresDisponibles([]);
    }
  }, [idPlanEstudios]);

  async function cargarDatosIniciales() {
    setLoadingData(true);
    try {
      const [conceptosData, planesData, periodosData] = await Promise.all([
        obtenerConceptosPago(true),
        getStudyPlansList(),
        getAcademicPeriodsList(),
      ]);

      setConceptos(conceptosData);
      setPlanesEstudio(planesData.items);
      setPeriodosAcademicos(periodosData.items);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Error al cargar datos. Algunos selectores pueden estar vacíos.");
    } finally {
      setLoadingData(false);
    }
  }

  async function cargarCuatrimestres(idPlan: number) {
    try {
      const cuatrimestres = await obtenerCuatrimestresPorPlan(idPlan);
      setCuatrimestresDisponibles(cuatrimestres);
    } catch {
      // Si falla, usar un rango por defecto
      setCuatrimestresDisponibles([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  }

  function cargarDatosPlantilla(plantilla: PlantillaCobro) {
    setNombrePlantilla(plantilla.nombrePlantilla);
    setIdPlanEstudios(plantilla.idPlanEstudios.toString());
    setNumeroCuatrimestre(plantilla.numeroCuatrimestre.toString());
    setIdPeriodoAcademico(plantilla.idPeriodoAcademico?.toString() || "");
    setNumeroRecibos(plantilla.numeroRecibos.toString());
    setDiaVencimiento(plantilla.diaVencimiento.toString());
    setEstrategiaEmision(plantilla.estrategiaEmision.toString());
    setFechaVigenciaInicio(
      plantilla.fechaVigenciaInicio
        ? new Date(plantilla.fechaVigenciaInicio).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );

    // Mapear detalles
    if (plantilla.detalles && plantilla.detalles.length > 0) {
      setDetalles(
        plantilla.detalles.map((d) => ({
          idConceptoPago: d.idConceptoPago,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          orden: d.orden,
          aplicaEnRecibo: d.aplicaEnRecibo ?? null,
          nombreConcepto: d.nombreConcepto,
        }))
      );
    } else {
      setDetalles([]);
    }
  }

  function resetForm() {
    setNombrePlantilla("");
    setIdPlanEstudios("");
    setNumeroCuatrimestre("");
    setIdPeriodoAcademico("");
    setNumeroRecibos("4");
    setDiaVencimiento("10");
    setEstrategiaEmision("0");
    setFechaVigenciaInicio(new Date().toISOString().split("T")[0]);
    setDetalles([]);
    setCuatrimestresDisponibles([]);
  }

  function agregarDetalle() {
    if (conceptos.length === 0) {
      toast.error("No hay conceptos de pago disponibles");
      return;
    }

    const primerConcepto = conceptos[0];
    setDetalles([
      ...detalles,
      {
        idConceptoPago: primerConcepto.idConceptoPago,
        descripcion: primerConcepto.nombre,
        cantidad: 1,
        precioUnitario: 0,
        orden: detalles.length + 1,
        aplicaEnRecibo: null,
        nombreConcepto: primerConcepto.nombre,
      },
    ]);
  }

  function agregarConceptoRapido(concepto: ConceptoPago) {
    // Determinar si es inscripción (aplica solo al primer recibo) o colegiatura (aplica a todos)
    const esInscripcion = concepto.nombre.toLowerCase().includes("inscripci") ||
                          concepto.clave?.toLowerCase().includes("insc");

    setDetalles([
      ...detalles,
      {
        idConceptoPago: concepto.idConceptoPago,
        descripcion: concepto.nombre,
        cantidad: 1,
        precioUnitario: 0, // El usuario debe ingresar el precio
        orden: detalles.length + 1,
        aplicaEnRecibo: esInscripcion ? 1 : null, // Inscripción solo en primer recibo, colegiatura en todos
        nombreConcepto: concepto.nombre,
      },
    ]);

    toast.success(`${concepto.nombre} agregado. Ingresa el precio.`);
  }

  function eliminarDetalle(index: number) {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    // Reordenar
    setDetalles(nuevosDetalles.map((d, i) => ({ ...d, orden: i + 1 })));
  }

  function actualizarDetalle(index: number, campo: keyof DetalleLocal, valor: unknown) {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      [campo]: valor,
    };

    // Si cambió el concepto, actualizar descripción y nombre
    if (campo === "idConceptoPago") {
      const concepto = conceptos.find((c) => c.idConceptoPago === valor);
      if (concepto) {
        nuevosDetalles[index].nombreConcepto = concepto.nombre;
        nuevosDetalles[index].descripcion = concepto.nombre;
      }
    }

    setDetalles(nuevosDetalles);
  }

  function getAplicaEnReciboValue(detalle: DetalleLocal): string {
    if (detalle.aplicaEnRecibo === null) return "todos";
    if (detalle.aplicaEnRecibo === 1) return "primero";
    if (detalle.aplicaEnRecibo === -1) return "ultimo";
    return "especifico";
  }

  function setAplicaEnReciboFromSelect(index: number, value: string) {
    const numRecibos = parseInt(numeroRecibos) || 4;
    let aplicaEnRecibo: number | null = null;

    switch (value) {
      case "todos":
        aplicaEnRecibo = null;
        break;
      case "primero":
        aplicaEnRecibo = 1;
        break;
      case "ultimo":
        aplicaEnRecibo = numRecibos;
        break;
      case "especifico":
        aplicaEnRecibo = 1; // Default al primer recibo
        break;
    }

    actualizarDetalle(index, "aplicaEnRecibo", aplicaEnRecibo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones
    if (!nombrePlantilla.trim()) {
      toast.error("Ingresa el nombre de la plantilla");
      return;
    }

    if (!idPlanEstudios) {
      toast.error("Selecciona el plan de estudios");
      return;
    }

    if (!numeroCuatrimestre) {
      toast.error("Selecciona el cuatrimestre");
      return;
    }

    if (detalles.length === 0) {
      toast.error("Agrega al menos un concepto de pago");
      return;
    }

    // Validar precios
    const preciosInvalidos = detalles.filter((d) => d.precioUnitario <= 0);
    if (preciosInvalidos.length > 0) {
      toast.error("Todos los precios deben ser mayores a 0");
      return;
    }

    setLoading(true);

    try {
      const detallesDto: CreatePlantillaCobroDetalleDto[] = detalles.map((d, index) => ({
        idConceptoPago: d.idConceptoPago,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        orden: index + 1,
        aplicaEnRecibo: d.aplicaEnRecibo,
      }));

      const dto: CreatePlantillaCobroDto = {
        nombrePlantilla,
        idPlanEstudios: parseInt(idPlanEstudios),
        numeroCuatrimestre: parseInt(numeroCuatrimestre),
        idPeriodoAcademico: idPeriodoAcademico ? parseInt(idPeriodoAcademico) : null,
        fechaVigenciaInicio: fechaVigenciaInicio,
        estrategiaEmision: parseInt(estrategiaEmision),
        numeroRecibos: parseInt(numeroRecibos),
        diaVencimiento: parseInt(diaVencimiento),
        detalles: detallesDto,
      };

      if (plantillaToEdit) {
        await actualizarPlantilla(plantillaToEdit.idPlantillaCobro, {
          nombrePlantilla: dto.nombrePlantilla,
          fechaVigenciaInicio: dto.fechaVigenciaInicio,
          estrategiaEmision: dto.estrategiaEmision,
          numeroRecibos: dto.numeroRecibos,
          diaVencimiento: dto.diaVencimiento,
          detalles: dto.detalles,
        });
        toast.success("Plantilla actualizada exitosamente");
      } else {
        await crearPlantilla(dto);
        toast.success("Plantilla creada exitosamente");
      }

      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al guardar plantilla";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Calcular totales
  const numRecibos = parseInt(numeroRecibos) || 1;

  const totalPrimerRecibo = detalles
    .filter((d) => d.aplicaEnRecibo === null || d.aplicaEnRecibo === 1)
    .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);

  const totalRecibosRegulares = detalles
    .filter((d) => d.aplicaEnRecibo === null)
    .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);

  const totalGeneral = detalles.reduce((sum, d) => {
    if (d.aplicaEnRecibo === null) {
      // Aplica a todos los recibos
      return sum + d.precioUnitario * d.cantidad * numRecibos;
    } else {
      // Aplica solo a un recibo específico
      return sum + d.precioUnitario * d.cantidad;
    }
  }, 0);

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-[1200px]">
          <DialogHeader>
            <DialogTitle>
              {plantillaToEdit ? "Editar Plantilla de Cobro" : "Nueva Plantilla de Cobro"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando datos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plantillaToEdit ? "Editar Plantilla de Cobro" : "Nueva Plantilla de Cobro"}
          </DialogTitle>
          <DialogDescription>
            Define cómo se generarán los recibos para un plan de estudios y cuatrimestre específico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="font-semibold">Información General</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre de la Plantilla <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={nombrePlantilla}
                  onChange={(e) => setNombrePlantilla(e.target.value)}
                  placeholder="Ej: Lic. Administración - 1er Cuatrimestre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">
                  Plan de Estudios <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={idPlanEstudios}
                  onValueChange={setIdPlanEstudios}
                  disabled={!!plantillaToEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan de estudios" />
                  </SelectTrigger>
                  <SelectContent>
                    {planesEstudio.map((plan) => (
                      <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()}>
                        {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuatrimestre">
                  Cuatrimestre/Semestre <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={numeroCuatrimestre}
                  onValueChange={setNumeroCuatrimestre}
                  disabled={!idPlanEstudios || !!plantillaToEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el cuatrimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cuatrimestresDisponibles.length > 0
                      ? cuatrimestresDisponibles
                      : [1, 2, 3, 4, 5, 6, 7, 8, 9]
                    ).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}° Cuatrimestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Periodo Académico (Opcional)</Label>
                <Select value={idPeriodoAcademico || "todos"} onValueChange={(v) => setIdPeriodoAcademico(v === "todos" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los periodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los periodos</SelectItem>
                    {periodosAcademicos.map((periodo) => (
                      <SelectItem
                        key={periodo.idPeriodoAcademico}
                        value={periodo.idPeriodoAcademico.toString()}
                      >
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estrategia">Estrategia de Emisión</Label>
                <Select value={estrategiaEmision} onValueChange={setEstrategiaEmision}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTRATEGIAS_EMISION.map((e) => (
                      <SelectItem key={e.value} value={e.value.toString()}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recibos">
                  Número de Recibos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recibos"
                  type="number"
                  min="1"
                  max="12"
                  value={numeroRecibos}
                  onChange={(e) => setNumeroRecibos(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dia">
                  Día de Vencimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dia"
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimiento}
                  onChange={(e) => setDiaVencimiento(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaVigencia">Fecha de Vigencia</Label>
                <Input
                  id="fechaVigencia"
                  type="date"
                  value={fechaVigenciaInicio}
                  onChange={(e) => setFechaVigenciaInicio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Conceptos de Pago */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Conceptos de Pago</h3>
            </div>

            {/* Botones rápidos para agregar conceptos comunes */}
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground mr-2 self-center">Agregar:</span>
              {conceptos.slice(0, 6).map((concepto) => (
                <Button
                  key={concepto.idConceptoPago}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => agregarConceptoRapido(concepto)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {concepto.nombre}
                </Button>
              ))}
              {conceptos.length > 6 && (
                <Button type="button" variant="outline" size="sm" onClick={agregarDetalle} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Otro...
                </Button>
              )}
            </div>

            {detalles.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  No hay conceptos agregados. Usa los botones de arriba para agregar conceptos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {detalles.map((detalle, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <Select
                          value={detalle.idConceptoPago.toString()}
                          onValueChange={(v) => actualizarDetalle(index, "idConceptoPago", parseInt(v))}
                        >
                          <SelectTrigger className="w-[280px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conceptos.map((c) => (
                              <SelectItem key={c.idConceptoPago} value={c.idConceptoPago.toString()}>
                                {c.clave} - {c.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarDetalle(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs font-medium text-primary">Precio Unitario *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={detalle.precioUnitario}
                            onChange={(e) => actualizarDetalle(index, "precioUnitario", parseFloat(e.target.value) || 0)}
                            className="pl-8 text-lg font-semibold border-primary/50 focus:border-primary"
                            placeholder="Ingresa el precio"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, "cantidad", parseInt(e.target.value) || 1)}
                          className="text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Aplica en</Label>
                        <Select
                          value={getAplicaEnReciboValue(detalle)}
                          onValueChange={(v) => setAplicaEnReciboFromSelect(index, v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPCIONES_APLICA_RECIBO.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Importe Total</Label>
                        <div className="h-9 flex items-center justify-center px-3 bg-green-50 border border-green-200 rounded-md font-bold text-green-700">
                          ${(detalle.precioUnitario * detalle.cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {getAplicaEnReciboValue(detalle) === "especifico" && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Número de recibo:</span>
                        <Input
                          type="number"
                          min="1"
                          max={parseInt(numeroRecibos)}
                          value={detalle.aplicaEnRecibo || 1}
                          onChange={(e) => actualizarDetalle(index, "aplicaEnRecibo", parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de Montos */}
            {detalles.length > 0 && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total primer recibo:</span>
                  <span className="font-semibold">
                    ${totalPrimerRecibo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total recibos regulares (c/u):</span>
                  <span className="font-semibold">
                    ${totalRecibosRegulares.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total general del periodo ({numRecibos} recibos):</span>
                  <span className="text-primary">
                    ${totalGeneral.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {plantillaToEdit ? "Actualizar" : "Crear Plantilla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
