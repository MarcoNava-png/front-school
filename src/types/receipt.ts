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
  fechaEmision: string;
  fechaVencimiento: string;
  estatus: ReceiptStatus | number | string;
  estatusNombre?: string;
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
  nombrePeriodo?: string;
  codigoGrupo?: string;
  recargoCalculado?: number;
  totalAPagarHoy?: number;
  diasVencido?: number;
}

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

export interface ReceiptFilters {
  idPeriodoAcademico?: number | null;
  idEstudiante?: number | null;
  estatus?: ReceiptStatus | ReceiptStatus[] | null;
  soloVencidos?: boolean;
  matricula?: string;
  folio?: string;
}

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
  estrategiaEmision: number;
  numeroRecibos: number;
  diaVencimiento: number;
  creadoPor: string;
  fechaCreacion: string;
  modificadoPor?: string | null;
  fechaModificacion?: string | null;
  detalles?: PlantillaCobroDetalle[];
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
  aplicaEnRecibo?: number | null;
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
  estrategiaEmision: number;
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
  aplicaEnRecibo?: number | null;
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

export type PayloadCreatePlantilla = CreatePlantillaCobroDto;

export interface ConceptoPago {
  idConceptoPago: number;
  clave: string;
  nombre: string;
  descripcion: string;
  conceptoTipo?: number;
  conceptoAplica?: number;
  esObligatorio?: boolean;
  periodicidadMeses?: number;
  activo?: boolean;
  tipo?: 'INSCRIPCION' | 'COLEGIATURA' | 'EXAMEN' | 'CONSTANCIA' | 'CREDENCIAL' | 'SEGURO' | 'OTRO';
  permiteBeca?: boolean;
  status?: number;
}

export interface BecaCatalogo {
  idBeca: number;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  tipo: 'PORCENTAJE' | 'MONTO';
  valor: number;
  topeMensual?: number | null;
  idConceptoPago?: number | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  conceptoPago?: {
    idConceptoPago: number;
    nombre: string;
    clave: string;
  } | null;
}

export interface CrearBecaCatalogoPayload {
  clave: string;
  nombre: string;
  descripcion?: string | null;
  tipo: 'PORCENTAJE' | 'MONTO';
  valor: number;
  topeMensual?: number | null;
  idConceptoPago?: number | null;
}

export interface ActualizarBecaCatalogoPayload {
  nombre: string;
  descripcion?: string | null;
  tipo: 'PORCENTAJE' | 'MONTO';
  valor: number;
  topeMensual?: number | null;
  idConceptoPago?: number | null;
  activo: boolean;
}

export interface BecaEstudiante {
  idBecaAsignacion: number;
  idEstudiante: number;
  idBeca?: number | null;
  idConceptoPago?: number | null;
  idPeriodoAcademico?: number | null;
  tipo: 'PORCENTAJE' | 'MONTO';
  valor: number;
  topeMensual?: number | null;
  vigenciaDesde: string;
  vigenciaHasta?: string | null;
  activo: boolean;
  observaciones?: string | null;
  beca?: BecaCatalogo | null;
  nombreConcepto?: string;
  matriculaEstudiante?: string;
  nombreEstudiante?: string;
  periodoAcademico?: {
    idPeriodoAcademico: number;
    nombre: string;
    clave?: string;
    fechaInicio?: string;
    fechaFin?: string;
  } | null;
}

export interface PayloadCreateBeca {
  idEstudiante: number;
  tipoBeca: 'PORCENTAJE' | 'MONTO';
  valor: number;
  idConceptoPago?: number | null;
  vigenciaDesde: string;
  vigenciaHasta?: string | null;
  topeMensual?: number | null;
  observaciones?: string | null;
}

export interface PayloadAsignarBecaCatalogo {
  idEstudiante: number;
  idBeca: number;
  idPeriodoAcademico?: number | null;
  vigenciaDesde: string;
  vigenciaHasta?: string | null;
  observaciones?: string | null;
}

export interface PayloadActualizarBeca {
  idPeriodoAcademico?: number | null;
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
  observaciones?: string | null;
  activo?: boolean | null;
}

export type CreateBecaEstudianteDto = PayloadCreateBeca;

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
