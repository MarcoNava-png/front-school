export enum PaymentStatus {
  CONFIRMADO = 0,
  RECHAZADO = 1,
  CANCELADO = 2,
}

export interface Payment {
  idPago: number;
  folioPago?: string;
  fechaPagoUtc: string;
  idMedioPago: number;
  monto: number;
  moneda: string;
  referencia?: string;
  notas?: string;
  estatus: PaymentStatus;
  idUsuarioCaja?: string;
  idCaja?: number | null;
  idCorteCaja?: number | null;
  canceladoPor?: string | null;
  fechaCancelacion?: string | null;
  motivoCancelacion?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Campos calculados (joins)
  medioPago?: string;
  nombreUsuario?: string;
  lineasAplicadas?: number;
}

export interface RegisterPaymentDto {
  fechaPagoUtc: string;
  idMedioPago: number;
  monto: number;
  moneda: string;
  referencia?: string;
  notas?: string;
  estatus: number;
}

export interface ApplyPaymentDto {
  idPago: number;
  aplicaciones: PaymentApplication[];
}

export interface PaymentApplication {
  idReciboDetalle: number;
  monto: number;
}

export interface PaymentFilters {
  fechaInicio?: string;
  fechaFin?: string;
  usuarioId?: string;
  estatus?: PaymentStatus;
  idMedioPago?: number;
}

// ============================================================================
// MÓDULO DE CAJA
// ============================================================================

export interface MedioPago {
  idMedioPago: number;
  nombre: string;
  requiereReferencia: boolean;
  activo: boolean;
}

export interface RecibosParaCobro {
  estudiante?: {
    idEstudiante: number;
    matricula: string;
    nombreCompleto: string;
    email?: string;
    telefono?: string;
  };
  recibos: import('./receipt').Receipt[];
  totalAdeudo: number;
  multiple?: boolean;
  estudiantes?: {
    idEstudiante: number;
    matricula: string;
    nombreCompleto: string;
  }[];
}

export interface RegistrarPagoRequest {
  idUsuarioCaja?: string;
  idCaja?: number;
  fechaPago: string;
  idMedioPago: number;
  monto: number;
  referencia?: string;
  notas?: string;
  recibosSeleccionados: {
    idRecibo: number;
    montoAplicar: number;
  }[];
  descuentoAutorizado?: {
    monto: number;
    autorizadoPor: string;
    motivo: string;
  };
}

export interface PagoRegistrado {
  idPago: number;
  folioPago: string;
  monto: number;
  recibosAfectados: number[];
  comprobante?: string;
}

export interface CancelarPagoRequest {
  idPago: number;
  motivo: string;
  autorizadoPor: string;
}

// ============================================================================
// CORTE DE CAJA
// ============================================================================

export interface CorteCaja {
  idCorteCaja: number;
  folioCorteCaja: string;
  fechaInicio: string;
  fechaFin: string;
  idUsuarioCaja: string;
  idCaja?: number | null;
  montoInicial: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalTarjeta: number;
  totalGeneral: number;
  cerrado: boolean;
  fechaCierre?: string | null;
  cerradoPor?: string | null;
  observaciones?: string | null;
  createdAt?: string;

  // Campos calculados
  nombreUsuario?: string;
  cantidadPagos?: number;
}

export interface ResumenCorteCaja {
  pagos: Payment[];
  totales: {
    cantidad: number;
    efectivo: number;
    transferencia: number;
    tarjeta: number;
    total: number;
  };
}

export interface CerrarCorteRequest {
  montoInicial?: number;
  observaciones?: string;
}

// ============================================================================
// CORTE DE CAJA DETALLADO
// ============================================================================

export interface UsuarioCajero {
  idUsuario: string;
  nombreCompleto: string;
  email?: string;
  totalCobros: number;
  ultimoCobro?: string;
}

export interface CajeroInfo {
  idUsuario: string;
  nombreCompleto: string;
  email?: string;
}

export interface PagoDetallado {
  idPago: number;
  folioPago?: string;
  fechaPagoUtc: string;
  horaPago?: string;
  idMedioPago: number;
  medioPago?: string;
  monto: number;
  moneda: string;
  referencia?: string;
  notas?: string;
  estatus: number;
  estatusNombre?: string;
  // Información del estudiante
  idEstudiante?: number;
  matricula?: string;
  nombreEstudiante?: string;
  // Información del concepto
  concepto?: string;
  folioRecibo?: string;
}

export interface GenerarCorteCajaRequest {
  idUsuarioCaja?: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ResumenCorteCajaDetallado {
  cajero?: CajeroInfo;
  fechaInicio: string;
  fechaFin: string;
  pagos: PagoDetallado[];
  totales: {
    cantidad: number;
    efectivo: number;
    transferencia: number;
    tarjeta: number;
    total: number;
  };
}
