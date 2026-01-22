// ============================================================================
// ENUMS
// ============================================================================

export enum ReceiptStatus {
  PENDIENTE = 0,
  PARCIAL = 1,
  PAGADO = 2,
  VENCIDO = 3,
  CANCELADO = 4,
  BONIFICADO = 5,
}

export enum EmissionStrategy {
  MENSUAL = 0,
  UNICO = 1,
  PERSONALIZADO = 2,
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface ReceiptLineItem {
  idReciboDetalle: number;
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  descuentoBeca?: number;
  importeNeto?: number;
  idPlantillaDetalle?: number | null;
  refTabla?: string | null;
  refId?: number | null;
}

export interface Receipt {
  idRecibo: number;
  folio?: string | null;
  idAspirante?: number | null;
  idEstudiante?: number | null;
  idPeriodoAcademico?: number | null;
  idGrupo?: number | null;
  idPlantillaCobro?: number | null;
  fechaEmision: string; // DateOnly from backend
  fechaVencimiento: string; // DateOnly from backend
  estatus: ReceiptStatus;
  subtotal: number;
  descuentoBeca?: number;
  descuento: number;
  descuentoAdicional?: number;
  recargos: number;
  total: number;
  saldo: number;
  notas?: string | null;
  creadoPor?: string;
  fechaCreacion?: string;
  canceladoPor?: string | null;
  fechaCancelacion?: string | null;
  motivoCancelacion?: string | null;
  detalles: ReceiptLineItem[];

  // Campos calculados (para UI)
  nombrePeriodo?: string;
  codigoGrupo?: string;
  recargoCalculado?: number;
  totalAPagarHoy?: number;
  diasVencido?: number;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

export interface GenerateReceiptsRequest {
  idEstudiante: number;
  idPeriodoAcademico: number;
  idGrupo?: number | null;
  idPlantillaCobro?: number | null;
  estrategia?: EmissionStrategy;
  diaVencimiento?: number;
  aplicarBecas?: boolean;
}

export interface RecalcularRecibosRequest {
  idEstudiante: number;
  idPeriodoAcademico: number;
}

export interface AjusteReciboRequest {
  idRecibo: number;
  tipoAjuste: 'DESCUENTO' | 'RECARGO' | 'BONIFICACION' | 'CANCELACION';
  monto: number;
  motivo: string;
  autorizadoPor: string;
}

// ============================================================================
// FILTERS
// ============================================================================

export interface ReceiptFilters {
  idPeriodoAcademico?: number | null;
  idEstudiante?: number | null;
  estatus?: ReceiptStatus | ReceiptStatus[] | null;
  soloVencidos?: boolean;
  matricula?: string;
  folio?: string;
}

// ============================================================================
// PLANTILLAS DE COBRO
// ============================================================================

export interface PlantillaCobro {
  idPlantillaCobro: number;
  nombrePlantilla: string;
  idPlanEstudios: number;
  numeroCuatrimestre: number;
  idPeriodoAcademico?: number | null;
  idTurno?: number | null;
  idModalidad?: number | null;
  version: number;
  esActiva: boolean;
  fechaVigenciaInicio: string;
  fechaVigenciaFin?: string | null;
  estrategiaEmision: number; // 0=Mensual, 1=Único, 2=Personalizado
  numeroRecibos: number;
  diaVencimiento: number;
  creadoPor: string;
  fechaCreacion: string;
  modificadoPor?: string | null;
  fechaModificacion?: string | null;
  detalles?: PlantillaCobroDetalle[];

  // Campos calculados (para UI)
  nombrePlan?: string;
  nombrePlanEstudios?: string;
  nombrePeriodo?: string;
  nombreTurno?: string;
  nombreModalidad?: string;
  totalConceptos?: number | null;
}

export interface PlantillaCobroDetalle {
  idPlantillaDetalle: number;
  idPlantillaCobro: number;
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  orden: number;
  aplicaEnRecibo?: number | null; // null=todos, número específico para recibo específico

  // Campos calculados
  nombreConcepto?: string;
  claveConcepto?: string;
  importe?: number;
}

export interface CreatePlantillaCobroDto {
  nombrePlantilla: string;
  idPlanEstudios: number;
  numeroCuatrimestre: number;
  idPeriodoAcademico?: number | null;
  idTurno?: number | null;
  idModalidad?: number | null;
  fechaVigenciaInicio: string;
  fechaVigenciaFin?: string | null;
  estrategiaEmision: number; // 0=Mensual, 1=Único, 2=Personalizado
  numeroRecibos: number;
  diaVencimiento: number;
  detalles: CreatePlantillaCobroDetalleDto[];
}

export interface CreatePlantillaCobroDetalleDto {
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  orden: number;
  aplicaEnRecibo?: number | null; // null=todos los recibos, 1=primer recibo, etc.
}

export interface UpdatePlantillaCobroDto {
  nombrePlantilla?: string;
  fechaVigenciaInicio?: string;
  fechaVigenciaFin?: string | null;
  estrategiaEmision?: number;
  numeroRecibos?: number;
  diaVencimiento?: number;
  detalles?: CreatePlantillaCobroDetalleDto[];
}

// Alias para compatibilidad hacia atrás
export type PayloadCreatePlantilla = CreatePlantillaCobroDto;

// ============================================================================
// CONCEPTOS DE PAGO
// ============================================================================

export interface ConceptoPago {
  idConceptoPago: number;
  clave: string;
  nombre: string; // Alias de descripcion para compatibilidad frontend
  descripcion: string; // Nombre que viene del backend
  // Propiedades del backend
  conceptoTipo?: number; // 0=Otro, 1=Colegiatura, 2=Inscripcion
  conceptoAplica?: number;
  esObligatorio?: boolean;
  periodicidadMeses?: number;
  activo?: boolean;
  // Propiedades para formularios del frontend
  tipo?: 'INSCRIPCION' | 'COLEGIATURA' | 'EXAMEN' | 'CONSTANCIA' | 'CREDENCIAL' | 'SEGURO' | 'OTRO';
  permiteBeca?: boolean;
  status?: number;
}

// ============================================================================
// BECAS
// ============================================================================

export interface BecaEstudiante {
  idBeca: number;
  idEstudiante: number;
  tipoBeca: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: number;
  idConceptoPago?: number | null;
  idPeriodoAcademico?: number | null;
  fechaInicio: string;
  fechaFin?: string | null;
  activa: boolean;
  observaciones?: string | null;

  // Campos calculados
  nombreConcepto?: string;
  nombrePeriodo?: string;
  matriculaEstudiante?: string;
  nombreEstudiante?: string;
}

export interface PayloadCreateBeca {
  idEstudiante: number;
  tipoBeca: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: number;
  idConceptoPago?: number | null;
  idPeriodoAcademico?: number | null;
  observaciones?: string | null;
}

// Alias para compatibilidad con modales
export type CreateBecaEstudianteDto = PayloadCreateBeca & {
  fechaInicio?: string;
  fechaFin?: string | null;
};

// ============================================================================
// REPORTES
// ============================================================================

export interface CarteraVencidaReporte {
  registros: CarteraVencidaItem[];
  totales: {
    cantidadRecibos: number;
    saldoPendiente: number;
    recargosAcumulados: number;
    adeudoTotal: number;
  };
}

export interface CarteraVencidaItem {
  matricula: string;
  nombreEstudiante: string;
  periodo: string;
  folio: string;
  fechaVencimiento: string;
  diasVencido: number;
  saldo: number;
  recargoAcumulado: number;
  totalAdeudo: number;
}

export interface IngresosPeriodoReporte {
  periodo: {
    idPeriodoAcademico: number;
    nombre: string;
  };
  detalleConceptos: IngresoConcepto[];
  totales: {
    montoEmitido: number;
    descuentos: number;
    montoCobrado: number;
    saldoPendiente: number;
  };
}

export interface IngresoConcepto {
  concepto: string;
  tipoConcepto: string;
  cantidadRecibos: number;
  montoEmitido: number;
  descuentosOtorgados: number;
  montoNeto: number;
  montoCobrado: number;
  saldoPendiente: number;
}

// ============================================================================
// GENERACIÓN MASIVA DE RECIBOS
// ============================================================================

export interface GenerarRecibosMasivosRequest {
  idPlantillaCobro: number;
  idPeriodoAcademico: number;
  soloSimular?: boolean;
  idEstudiantes?: number[] | null;
}

export interface ReciboEstudianteResumen {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  recibosGenerados: number;
  montoTotal: number;
  descuentoBecas: number;
  saldoFinal: number;
}

export interface GenerarRecibosMasivosResult {
  exitoso: boolean;
  mensaje: string;
  totalEstudiantes: number;
  totalRecibosGenerados: number;
  montoTotal: number;
  totalDescuentosBecas: number;
  estudiantesOmitidos: number;
  errores?: string[] | null;
  detalleEstudiantes?: ReciboEstudianteResumen[] | null;
}
