import {
  CancelarPagoRequest,
  CerrarCorteRequest,
  CorteCaja,
  GenerarCorteCajaRequest,
  MedioPago,
  PagoRegistrado,
  RecibosParaCobro,
  RegistrarPagoRequest,
  ResumenCorteCaja,
  ResumenCorteCajaDetallado,
  UsuarioCajero,
} from "@/types/payment";

import apiClient from "./api-client";

// ============================================================================
// TIPOS (mantener compatibilidad con backend)
// ============================================================================

export interface RegistrarPagoDto {
  fechaPagoUtc: string; // ISO string
  idMedioPago: number;
  monto: number;
  moneda: string; // "MXN"
  referencia?: string;
  notas?: string;
  estatus: number; // 0 = CONFIRMADO
}

export interface AplicacionLineaDto {
  idReciboDetalle: number;
  monto: number;
}

export interface AplicarPagoDto {
  idPago: number;
  aplicaciones: AplicacionLineaDto[];
}

export interface PagoDto {
  idPago: number;
  fechaPagoUtc: string;
  idMedioPago: number;
  monto: number;
  moneda: string;
  referencia?: string | null;
  notas?: string | null;
  estatus: number;
}

export interface PagoConEstudiante extends PagoDto {
  nombreEstudiante?: string;
  matricula?: string;
}

// ============================================================================
// SERVICIOS - LEGACY (mantener compatibilidad)
// ============================================================================

/**
 * Registra un nuevo pago en el sistema (versión legacy)
 * @param payload Datos del pago a registrar
 * @returns ID del pago creado
 */
export async function registrarPago(payload: RegistrarPagoDto): Promise<number> {
  const { data } = await apiClient.post<number>(`/Pagos`, payload);
  return data;
}

/**
 * Aplica un pago registrado a uno o varios recibos
 * @param payload Datos de aplicación del pago
 * @returns IDs de las aplicaciones creadas
 */
export async function aplicarPago(payload: AplicarPagoDto): Promise<number[]> {
  const { data } = await apiClient.post<number[]>(`/Pagos/aplicar`, payload);
  return data;
}

/**
 * Obtiene la información de un pago específico
 * @param id ID del pago
 * @returns Datos del pago
 */
export async function obtenerPago(id: number): Promise<PagoDto> {
  const { data } = await apiClient.get<PagoDto>(`/Pagos/${id}`);
  return data;
}

/**
 * Obtiene los pagos realizados en un rango de fechas (Corte de caja - legacy)
 * @param fechaInicio Fecha inicio del corte
 * @param fechaFin Fecha fin del corte
 * @param usuarioId ID del usuario (opcional)
 * @returns Lista de pagos
 */
export async function corteCaja(
  fechaInicio: string,
  fechaFin: string,
  usuarioId?: string
): Promise<PagoDto[]> {
  const params = new URLSearchParams();
  params.append("fechaInicio", fechaInicio);
  params.append("fechaFin", fechaFin);
  if (usuarioId) {
    params.append("usuarioId", usuarioId);
  }

  const { data } = await apiClient.get<PagoDto[]>(`/Pagos/corte-caja?${params.toString()}`);
  return data;
}

// ============================================================================
// SERVICIOS - MÓDULO DE CAJA (NUEVO)
// ============================================================================

/**
 * Busca recibos pendientes para cobro
 * @param criterio Matrícula, folio de recibo, o nombre del estudiante
 * @returns Información del estudiante y sus recibos pendientes
 */
export async function buscarRecibosParaCobro(
  criterio: string
): Promise<RecibosParaCobro> {
  const { data } = await apiClient.get<RecibosParaCobro>(
    `/caja/recibos-pendientes?criterio=${encodeURIComponent(criterio)}`
  );
  return data;
}

/**
 * Registra un pago completo (nuevo flujo de caja)
 * @param payload Datos del pago con recibos seleccionados
 * @returns Información del pago registrado
 */
export async function registrarPagoCaja(
  payload: RegistrarPagoRequest
): Promise<PagoRegistrado> {
  const { data } = await apiClient.post<PagoRegistrado>("/caja/pago", payload);
  return data;
}

/**
 * Cancela un pago registrado
 * @param payload Datos de la cancelación
 */
export async function cancelarPago(payload: CancelarPagoRequest): Promise<void> {
  await apiClient.post(`/caja/pago/${payload.idPago}/cancelar`, {
    motivo: payload.motivo,
    autorizadoPor: payload.autorizadoPor,
  });
}

/**
 * Obtiene el resumen del corte de caja actual
 * @param fechaInicio Fecha inicio (opcional)
 * @param fechaFin Fecha fin (opcional)
 * @param usuarioId ID del usuario (opcional)
 * @returns Resumen del corte con pagos y totales
 */
export async function obtenerResumenCorteCaja(
  fechaInicio?: string,
  fechaFin?: string,
  usuarioId?: string
): Promise<ResumenCorteCaja> {
  const params = new URLSearchParams();
  if (fechaInicio) {
    params.append("fechaInicio", fechaInicio);
  }
  if (fechaFin) {
    params.append("fechaFin", fechaFin);
  }
  if (usuarioId) {
    params.append("usuarioId", usuarioId);
  }

  const { data } = await apiClient.get<ResumenCorteCaja>(
    `/caja/corte?${params.toString()}`
  );
  return data;
}

/**
 * Cierra el corte de caja actual
 * @param payload Datos del cierre
 * @returns Corte de caja cerrado
 */
export async function cerrarCorteCaja(payload: CerrarCorteRequest): Promise<CorteCaja> {
  const { data } = await apiClient.post<CorteCaja>("/caja/corte/cerrar", payload);
  return data;
}

/**
 * Obtiene todos los cortes de caja
 * @param usuarioId Filtrar por usuario (opcional)
 * @param fechaInicio Filtrar desde fecha (opcional)
 * @param fechaFin Filtrar hasta fecha (opcional)
 * @returns Lista de cortes de caja
 */
export async function obtenerCortesCaja(
  usuarioId?: string,
  fechaInicio?: string,
  fechaFin?: string
): Promise<CorteCaja[]> {
  const params = new URLSearchParams();
  if (usuarioId) {
    params.append("usuarioId", usuarioId);
  }
  if (fechaInicio) {
    params.append("fechaInicio", fechaInicio);
  }
  if (fechaFin) {
    params.append("fechaFin", fechaFin);
  }

  const { data } = await apiClient.get<CorteCaja[]>(
    `/caja/cortes?${params.toString()}`
  );
  return data;
}

/**
 * Obtiene un corte de caja específico por ID
 * @param id ID del corte
 * @returns Corte de caja con detalles
 */
export async function obtenerCorteCajaPorId(id: number): Promise<CorteCaja> {
  const { data } = await apiClient.get<CorteCaja>(`/caja/cortes/${id}`);
  return data;
}

/**
 * Descarga el PDF de un corte de caja
 * @param id ID del corte
 * @returns Blob del PDF
 */
export async function descargarCorteCajaPDF(id: number): Promise<Blob> {
  const response = await apiClient.get(`/caja/cortes/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

// ============================================================================
// SERVICIOS - MEDIOS DE PAGO
// ============================================================================

/**
 * Obtiene todos los medios de pago activos
 * @returns Lista de medios de pago
 */
export async function obtenerMediosPago(): Promise<MedioPago[]> {
  // TODO: Implementar endpoint /medios-pago en el backend
  // Mientras tanto, retorna datos mock
  try {
    const { data } = await apiClient.get<MedioPago[]>("/medios-pago");
    return data;
  } catch {
    // Si el endpoint no existe, retorna datos mock
    console.warn("⚠️ Endpoint /medios-pago no encontrado. Usando datos mock temporales.");
    return [
      {
        idMedioPago: 1,
        nombre: "Efectivo",
        requiereReferencia: false,
        activo: true,
      },
      {
        idMedioPago: 2,
        nombre: "Transferencia",
        requiereReferencia: true,
        activo: true,
      },
      {
        idMedioPago: 3,
        nombre: "Tarjeta",
        requiereReferencia: true,
        activo: true,
      },
    ];
  }
}

/**
 * Descarga comprobante de pago en PDF
 * @param idPago ID del pago
 * @returns Blob del PDF
 */
export async function descargarComprobantePago(idPago: number): Promise<Blob> {
  const response = await apiClient.get(`/pagos/${idPago}/comprobante`, {
    responseType: "blob",
  });
  return response.data;
}

// ============================================================================
// NUEVO ENDPOINT - REGISTRAR Y APLICAR EN UNA SOLA OPERACIÓN
// ============================================================================

export interface RegistrarYAplicarPagoDto {
  idRecibo: number;
  fechaPagoUtc?: string; // ISO string, opcional (usa fecha actual si no se proporciona)
  idMedioPago: number;
  monto: number;
  moneda?: string; // "MXN" por defecto
  referencia?: string;
  notas?: string;
  estatus?: number; // 0 = CONFIRMADO por defecto
}

export interface RegistrarYAplicarPagoResultDto {
  idPago: number;
  idRecibo: number;
  montoAplicado: number;
  saldoAnterior: number;
  saldoNuevo: number;
  estatusReciboAnterior: string;
  estatusReciboNuevo: string;
  reciboPagadoCompletamente: boolean;
}

/**
 * Registra un pago y lo aplica automáticamente a un recibo en una sola operación atómica.
 * Este endpoint crea automáticamente el detalle del recibo si no existe.
 * ES EL MÉTODO RECOMENDADO PARA PAGOS.
 *
 * @param payload Datos del pago con el ID del recibo
 * @returns Resultado del pago con estatus actualizado
 */
export async function registrarYAplicarPago(payload: RegistrarYAplicarPagoDto): Promise<RegistrarYAplicarPagoResultDto> {
  const { data } = await apiClient.post<RegistrarYAplicarPagoResultDto>(`/Pagos/registrar-y-aplicar`, {
    ...payload,
    fechaPagoUtc: payload.fechaPagoUtc ?? new Date().toISOString(),
    moneda: payload.moneda ?? "MXN",
    estatus: payload.estatus ?? 0, // CONFIRMADO
  });
  return data;
}

// ============================================================================
// CORTE DE CAJA DETALLADO
// ============================================================================

/**
 * Obtiene la lista de usuarios que han realizado cobros (cajeros)
 * @returns Lista de cajeros con estadísticas
 */
export async function obtenerCajeros(): Promise<UsuarioCajero[]> {
  const { data } = await apiClient.get<UsuarioCajero[]>("/caja/cajeros");
  return data;
}

/**
 * Genera un corte de caja detallado con información completa de pagos
 * @param request Parámetros del corte (usuario opcional, fechas)
 * @returns Resumen detallado del corte de caja
 */
export async function generarCorteCajaDetallado(
  request: GenerarCorteCajaRequest
): Promise<ResumenCorteCajaDetallado> {
  const { data } = await apiClient.post<ResumenCorteCajaDetallado>(
    "/caja/corte/generar",
    request
  );
  return data;
}

/**
 * Genera y descarga el PDF del corte de caja
 * @param request Parámetros del corte
 * @returns Blob del PDF
 */
export async function generarPdfCorteCaja(
  request: GenerarCorteCajaRequest
): Promise<Blob> {
  const response = await apiClient.post("/caja/corte/pdf", request, {
    responseType: "blob",
  });
  return response.data;
}
