"use client";

import { useEffect, useState } from "react";

import { Plus, Trash2, Loader2, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { getCampusList } from "@/services/campus-service";
import { crearPlantilla, actualizarPlantilla, obtenerConceptosPago, obtenerCuatrimestresPorPlan, generarPreviewRecibos, ReciboPreview } from "@/services/plantillas-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { AcademicPeriod } from "@/types/academic-period";
import { Campus } from "@/types/campus";
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
  aplicaEnRecibo: number | null;
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

  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<StudyPlan[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [periodosAcademicos, setPeriodosAcademicos] = useState<AcademicPeriod[]>([]);
  const [cuatrimestresDisponibles, setCuatrimestresDisponibles] = useState<number[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");

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

  const [detalles, setDetalles] = useState<DetalleLocal[]>([]);

  const [previewRecibos, setPreviewRecibos] = useState<ReciboPreview[]>([]);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

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
      const [conceptosData, planesData, periodosData, campusData] = await Promise.all([
        obtenerConceptosPago(true),
        getStudyPlansList(),
        getAcademicPeriodsList(),
        getCampusList(),
      ]);

      setConceptos(conceptosData);
      setPlanesEstudio(planesData.items);
      setPeriodosAcademicos(periodosData.items);
      setCampuses(campusData.items);
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
      setCuatrimestresDisponibles([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
  }

  function cargarDatosPlantilla(plantilla: PlantillaCobro) {
    setNombrePlantilla(plantilla.nombrePlantilla);
    const plan = planesEstudio.find((p) => p.idPlanEstudios === plantilla.idPlanEstudios);
    if (plan) {
      setSelectedCampus(plan.idCampus.toString());
    }
    setIdPlanEstudios(plantilla.idPlanEstudios.toString());
    setNumeroCuatrimestre(plantilla.numeroCuatrimestre.toString());
    setIdPeriodoAcademico(plantilla.idPeriodoAcademico?.toString() ?? "");
    setNumeroRecibos(plantilla.numeroRecibos.toString());
    setDiaVencimiento(plantilla.diaVencimiento.toString());
    setEstrategiaEmision(plantilla.estrategiaEmision.toString());
    setFechaVigenciaInicio(
      plantilla.fechaVigenciaInicio
        ? new Date(plantilla.fechaVigenciaInicio).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );

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
    setSelectedCampus("");
    setIdPlanEstudios("");
    setNumeroCuatrimestre("");
    setIdPeriodoAcademico("");
    setNumeroRecibos("4");
    setDiaVencimiento("10");
    setEstrategiaEmision("0");
    setFechaVigenciaInicio(new Date().toISOString().split("T")[0]);
    setDetalles([]);
    setCuatrimestresDisponibles([]);
    setPreviewRecibos([]);
    setMostrarPreview(false);
  }

  async function generarPreview() {
    if (detalles.length === 0) {
      setPreviewRecibos([]);
      return;
    }

    setLoadingPreview(true);
    try {
      let fechaInicio = fechaVigenciaInicio;
      if (idPeriodoAcademico) {
        const periodo = periodosAcademicos.find(p => p.idPeriodoAcademico.toString() === idPeriodoAcademico);
        if (periodo?.fechaInicio) {
          fechaInicio = periodo.fechaInicio;
        }
      }

      const response = await generarPreviewRecibos({
        numeroRecibos: parseInt(numeroRecibos) || 4,
        diaVencimiento: parseInt(diaVencimiento) || 10,
        fechaInicioPeriodo: fechaInicio,
        conceptos: detalles.map(d => ({
          descripcion: d.descripcion || d.nombreConcepto || "Concepto",
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          aplicaEnRecibo: d.aplicaEnRecibo,
        })),
      });

      setPreviewRecibos(response.recibos);
      setMostrarPreview(true);
    } catch (error) {
      console.error("Error al generar preview:", error);
      generarPreviewLocal();
    } finally {
      setLoadingPreview(false);
    }
  }

  function parsearFechaLocal(fechaStr: string): { año: number; mes: number; dia: number } {
    const fechaParte = fechaStr.split("T")[0];
    const partes = fechaParte.split("-");
    return {
      año: parseInt(partes[0]),
      mes: parseInt(partes[1]) - 1,
      dia: parseInt(partes[2]),
    };
  }

  function generarPreviewLocal() {
    const numRec = parseInt(numeroRecibos) || 4;
    const dia = parseInt(diaVencimiento) || 10;

    let añoBase: number;
    let mesBase: number;

    if (idPeriodoAcademico) {
      const periodo = periodosAcademicos.find(p => p.idPeriodoAcademico.toString() === idPeriodoAcademico);
      if (periodo?.fechaInicio) {
        const { año, mes } = parsearFechaLocal(periodo.fechaInicio);
        añoBase = año;
        mesBase = mes;
      } else {
        const hoy = new Date();
        añoBase = hoy.getFullYear();
        mesBase = hoy.getMonth();
      }
    } else {
      const { año, mes } = parsearFechaLocal(fechaVigenciaInicio);
      añoBase = año;
      mesBase = mes;
    }

    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const recibos: ReciboPreview[] = [];
    for (let i = 0; i < numRec; i++) {
      let mes = mesBase + i;
      let año = añoBase;

      while (mes > 11) {
        mes -= 12;
        año += 1;
      }

      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      const diaFinal = Math.min(dia, diasEnMes);

      const fechaVenc = new Date(año, mes, diaFinal);

      const conceptosRecibo = detalles
        .filter(d => d.aplicaEnRecibo === null || d.aplicaEnRecibo === (i + 1) || (d.aplicaEnRecibo === -1 && (i + 1) === numRec))
        .map(d => ({
          concepto: d.descripcion || d.nombreConcepto || "Concepto",
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          importe: d.cantidad * d.precioUnitario,
        }));

      recibos.push({
        numeroRecibo: i + 1,
        fechaVencimiento: `${diaFinal.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}/${año}`,
        mesCorrespondiente: `${nombresMeses[mes]} ${año}`,
        conceptos: conceptosRecibo,
        subtotal: conceptosRecibo.reduce((sum, c) => sum + c.importe, 0),
      });
    }

    setPreviewRecibos(recibos);
    setMostrarPreview(true);
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
    const esInscripcion = concepto.nombre.toLowerCase().includes("inscripci") ??
                          concepto.clave?.toLowerCase().includes("insc");

    setDetalles([
      ...detalles,
      {
        idConceptoPago: concepto.idConceptoPago,
        descripcion: concepto.nombre,
        cantidad: 1,
        precioUnitario: 0,
        orden: detalles.length + 1,
        aplicaEnRecibo: esInscripcion ? 1 : null,
        nombreConcepto: concepto.nombre,
      },
    ]);

    toast.success(`${concepto.nombre} agregado. Ingresa el precio.`);
  }

  function eliminarDetalle(index: number) {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles.map((d, i) => ({ ...d, orden: i + 1 })));
  }

  function actualizarDetalle(index: number, campo: keyof DetalleLocal, valor: unknown) {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      [campo]: valor,
    };

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
        aplicaEnRecibo = 1;
        break;
    }

    actualizarDetalle(index, "aplicaEnRecibo", aplicaEnRecibo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nombrePlantilla.trim()) {
      toast.error("Ingresa el nombre de la plantilla");
      return;
    }

    if (!idPlanEstudios) {
      toast.error("Selecciona el plan de estudios");
      return;
    }

    if (!numeroCuatrimestre) {
      toast.error(`Selecciona el ${periodicidadLabel.toLowerCase()}`);
      return;
    }

    if (detalles.length === 0) {
      toast.error("Agrega al menos un concepto de pago");
      return;
    }

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
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al guardar plantilla";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const planesFiltrados = selectedCampus
    ? planesEstudio.filter((p) => p.idCampus === parseInt(selectedCampus))
    : planesEstudio;

  const planSeleccionado = idPlanEstudios
    ? planesEstudio.find((p) => p.idPlanEstudios === parseInt(idPlanEstudios))
    : null;

  const periodicidadLabel = planSeleccionado?.periodicidad?.toLowerCase().includes("semest")
    ? "Semestre"
    : "Cuatrimestre";

  function handleCampusChange(value: string) {
    setSelectedCampus(value);
    setIdPlanEstudios("");
    setNumeroCuatrimestre("");
    setCuatrimestresDisponibles([]);
  }

  const numRecibos = parseInt(numeroRecibos) || 1;

  const totalPrimerRecibo = detalles
    .filter((d) => d.aplicaEnRecibo === null || d.aplicaEnRecibo === 1)
    .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);

  const totalRecibosRegulares = detalles
    .filter((d) => d.aplicaEnRecibo === null)
    .reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0);

  const totalGeneral = detalles.reduce((sum, d) => {
    if (d.aplicaEnRecibo === null) {
      return sum + d.precioUnitario * d.cantidad * numRecibos;
    } else {
      return sum + d.precioUnitario * d.cantidad;
    }
  }, 0);

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {plantillaToEdit ? "Editar Plantilla de Cobro" : "Nueva Plantilla de Cobro"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Cargando datos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[900px] xl:max-w-[1100px] h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">
            {plantillaToEdit ? "Editar Plantilla de Cobro" : "Nueva Plantilla de Cobro"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Define cómo se generarán los recibos para un plan de estudios y periodo específico
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <form id="plantilla-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-4">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base text-blue-600">Información General</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="nombre" className="text-xs sm:text-sm">
                    Nombre de la Plantilla <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={nombrePlantilla}
                    onChange={(e) => setNombrePlantilla(e.target.value)}
                    placeholder={`Ej: Lic. Administración - 1er ${periodicidadLabel}`}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="campus" className="text-xs sm:text-sm">
                    Campus <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCampus}
                    onValueChange={handleCampusChange}
                    disabled={!!plantillaToEdit}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecciona un campus" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {campuses.map((campus) => (
                        <SelectItem key={campus.idCampus} value={campus.idCampus.toString()}>
                          {campus.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <Label htmlFor="plan" className="text-xs sm:text-sm">
                    Plan de Estudios <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={idPlanEstudios}
                    onValueChange={setIdPlanEstudios}
                    disabled={!selectedCampus || !!plantillaToEdit}
                  >
                    <SelectTrigger className="text-sm w-full [&>span]:truncate [&>span]:block [&>span]:max-w-[calc(100%-20px)]">
                      <SelectValue placeholder={selectedCampus ? "Selecciona un plan de estudios" : "Primero selecciona un campus"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] max-w-[90vw] sm:max-w-[600px]">
                      {planesFiltrados.map((plan) => (
                        <SelectItem key={plan.idPlanEstudios} value={plan.idPlanEstudios.toString()} className="max-w-full">
                          <span className="line-clamp-2">
                            {plan.clavePlanEstudios} - {plan.nombrePlanEstudios}
                            {plan.periodicidad ? ` (${plan.periodicidad})` : ""}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="cuatrimestre" className="text-xs sm:text-sm">
                    {periodicidadLabel} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={numeroCuatrimestre}
                    onValueChange={setNumeroCuatrimestre}
                    disabled={!idPlanEstudios || !!plantillaToEdit}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder={`Selecciona el ${periodicidadLabel.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(cuatrimestresDisponibles.length > 0
                        ? cuatrimestresDisponibles
                        : [1, 2, 3, 4, 5, 6, 7, 8, 9]
                      ).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}° {periodicidadLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="periodo" className="text-xs sm:text-sm">Periodo Académico (Opcional)</Label>
                  <Select value={idPeriodoAcademico ?? "todos"} onValueChange={(v) => setIdPeriodoAcademico(v === "todos" ? "" : v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Todos los periodos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="estrategia" className="text-xs sm:text-sm">Estrategia</Label>
                  <Select value={estrategiaEmision} onValueChange={setEstrategiaEmision}>
                    <SelectTrigger className="text-sm">
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

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="recibos" className="text-xs sm:text-sm">
                    N° Recibos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recibos"
                    type="number"
                    min="1"
                    max="12"
                    value={numeroRecibos}
                    onChange={(e) => setNumeroRecibos(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="dia" className="text-xs sm:text-sm">
                    Día Venc. <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dia"
                    type="number"
                    min="1"
                    max="31"
                    value={diaVencimiento}
                    onChange={(e) => setDiaVencimiento(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-blue-600">Conceptos de Pago</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs sm:text-sm text-blue-700 mr-1 sm:mr-2 self-center font-medium">Agregar:</span>
                {conceptos.slice(0, 4).map((concepto) => (
                  <Button
                    key={concepto.idConceptoPago}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => agregarConceptoRapido(concepto)}
                    className="text-xs h-7 sm:h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[80px] sm:max-w-none">{concepto.nombre}</span>
                  </Button>
                ))}
                {conceptos.length > 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarDetalle}
                    className="text-xs h-7 sm:h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Otro...
                  </Button>
                )}
              </div>

              {detalles.length === 0 ? (
                <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg border-gray-200">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    No hay conceptos agregados. Usa los botones de arriba para agregar conceptos.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {detalles.map((detalle, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                            #{index + 1}
                          </Badge>
                          <Select
                            value={detalle.idConceptoPago.toString()}
                            onValueChange={(v) => actualizarDetalle(index, "idConceptoPago", parseInt(v))}
                          >
                            <SelectTrigger className="flex-1 text-xs sm:text-sm min-w-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                          <Label className="text-xs font-medium text-blue-700">Precio *</Label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={detalle.precioUnitario || ""}
                              onChange={(e) => actualizarDetalle(index, "precioUnitario", parseFloat(e.target.value) || 0)}
                              className="pl-7 text-sm font-semibold border-blue-200 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={detalle.cantidad || ""}
                            onChange={(e) => actualizarDetalle(index, "cantidad", parseInt(e.target.value) || 1)}
                            className="text-center text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Aplica en</Label>
                          <Select
                            value={getAplicaEnReciboValue(detalle)}
                            onValueChange={(v) => setAplicaEnReciboFromSelect(index, v)}
                          >
                            <SelectTrigger className="text-xs sm:text-sm">
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
                          <Label className="text-xs text-muted-foreground">Importe</Label>
                          <div className="h-9 flex items-center justify-center px-2 bg-green-50 border border-green-200 rounded-md font-bold text-green-700 text-sm">
                            ${(detalle.precioUnitario * detalle.cantidad).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {getAplicaEnReciboValue(detalle) === "especifico" && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-muted-foreground">N° de recibo:</span>
                          <Input
                            type="number"
                            min="1"
                            max={parseInt(numeroRecibos) || 4}
                            value={detalle.aplicaEnRecibo ?? ""}
                            onChange={(e) => actualizarDetalle(index, "aplicaEnRecibo", parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {detalles.length > 0 && (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-2 border border-blue-100">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-700">Total primer recibo:</span>
                    <span className="font-semibold text-blue-900">
                      ${totalPrimerRecibo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-blue-700">Total recibos regulares (c/u):</span>
                    <span className="font-semibold text-blue-900">
                      ${totalRecibosRegulares.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                    <span className="text-blue-700 text-xs sm:text-sm">Total del periodo ({numRecibos} recibos):</span>
                    <span className="text-blue-900 text-sm sm:text-base">
                      ${totalGeneral.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generarPreviewLocal}
                      disabled={loadingPreview}
                      className="w-full text-xs bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {loadingPreview ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3 mr-1" />
                      )}
                      Ver fechas de vencimiento
                    </Button>
                  </div>
                </div>
              )}
              {mostrarPreview && previewRecibos.length > 0 && (
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-green-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Vista Previa de Recibos
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMostrarPreview(false)}
                      className="h-6 text-xs text-green-700 hover:text-green-900"
                    >
                      Ocultar
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {previewRecibos.map((recibo) => (
                      <div
                        key={recibo.numeroRecibo}
                        className={`p-2 sm:p-3 rounded-md border ${
                          recibo.numeroRecibo === 1
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white border-green-100"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs sm:text-sm">
                            Recibo #{recibo.numeroRecibo}
                            {recibo.numeroRecibo === 1 && (
                              <Badge variant="outline" className="ml-2 text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                                Incluye inscripción
                              </Badge>
                            )}
                          </span>
                          <span className="font-bold text-sm text-green-700">
                            ${recibo.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium text-green-700">{recibo.mesCorrespondiente}</span>
                          <span>•</span>
                          <span>Vence: <strong>{recibo.fechaVencimiento}</strong></span>
                        </div>
                        {recibo.conceptos.length > 0 && (
                          <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                            {recibo.conceptos.map((c, i) => (
                              <span key={i}>
                                {c.concepto}
                                {i < recibo.conceptos.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    <strong>Nota:</strong> Las fechas se calculan a partir de la fecha de inicio del periodo académico seleccionado.
                  </div>
                </div>
              )}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="plantilla-form"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white order-1 sm:order-2"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {plantillaToEdit ? "Actualizar" : "Crear Plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
