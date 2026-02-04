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

export interface RegistrarPagoDto {
  fechaPagoUtc: string;
  idMedioPago: number;
  monto: number;
  moneda: string;
  referencia?: string;
  notas?: string;
  estatus: number;
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
  idEstudiante?: number | null;
  matricula?: string | null;
  nombreEstudiante?: string | null;
  concepto?: string | null;
  folioRecibo?: string | null;
}

export interface PagoConEstudiante extends PagoDto {
  nombreEstudiante?: string;
  matricula?: string;
}

export async function registrarPago(payload: RegistrarPagoDto): Promise<number> {
  const { data } = await apiClient.post<number>(`/Pagos`, payload);
  return data;
}

export async function aplicarPago(payload: AplicarPagoDto): Promise<number[]> {
  const { data } = await apiClient.post<number[]>(`/Pagos/aplicar`, payload);
  return data;
}

export async function obtenerPago(id: number): Promise<PagoDto> {
  const { data } = await apiClient.get<PagoDto>(`/Pagos/${id}`);
  return data;
}

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

export async function buscarRecibosParaCobro(
  criterio: string
): Promise<RecibosParaCobro> {
  const { data } = await apiClient.get<RecibosParaCobro>(
    `/caja/recibos-pendientes?criterio=${encodeURIComponent(criterio)}`
  );
  return data;
}

export async function buscarTodosLosRecibos(
  criterio: string
): Promise<RecibosParaCobro> {
  const { data } = await apiClient.get<RecibosParaCobro>(
    `/caja/recibos-todos?criterio=${encodeURIComponent(criterio)}`
  );
  return data;
}

export async function registrarPagoCaja(
  payload: RegistrarPagoRequest
): Promise<PagoRegistrado> {
  const { data } = await apiClient.post<PagoRegistrado>("/caja/pago", payload);
  return data;
}

export async function cancelarPago(payload: CancelarPagoRequest): Promise<void> {
  await apiClient.post(`/caja/pago/${payload.idPago}/cancelar`, {
    motivo: payload.motivo,
    autorizadoPor: payload.autorizadoPor,
  });
}

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

export async function cerrarCorteCaja(payload: CerrarCorteRequest): Promise<CorteCaja> {
  const { data } = await apiClient.post<CorteCaja>("/caja/corte/cerrar", payload);
  return data;
}

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

export async function obtenerCorteCajaPorId(id: number): Promise<CorteCaja> {
  const { data } = await apiClient.get<CorteCaja>(`/caja/cortes/${id}`);
  return data;
}

export async function descargarCorteCajaPDF(id: number): Promise<Blob> {
  const response = await apiClient.get(`/caja/cortes/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

export async function obtenerMediosPago(): Promise<MedioPago[]> {
  const { data } = await apiClient.get<MedioPago[]>("/catalogos/medios-pago");
  return data;
}

export async function descargarComprobantePago(idPago: number): Promise<Blob> {
  const response = await apiClient.get(`/pagos/${idPago}/comprobante`, {
    responseType: "blob",
  });
  return response.data;
}

export async function descargarReciboPdf(idRecibo: number): Promise<Blob> {
  const response = await apiClient.get(`/recibos/${idRecibo}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

export async function imprimirReciboPdf(idRecibo: number, folio?: string): Promise<void> {
  const blob = await descargarReciboPdf(idRecibo);
  const url = window.URL.createObjectURL(blob);
  const nombreArchivo = `Recibo_${folio || idRecibo}_${new Date().toISOString().split('T')[0]}.pdf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;

  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.focus();
  }

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export async function quitarRecargoRecibo(idRecibo: number, motivo: string): Promise<{ message: string; recargoCondonado: number }> {
  const { data } = await apiClient.post(`/caja/recibos/${idRecibo}/quitar-recargo`, { motivo });
  return data;
}

export interface ModificarDetalleResultado {
  exitoso: boolean;
  mensaje: string;
  montoAnterior: number;
  montoNuevo: number;
  nuevoTotal: number;
  nuevoSaldo: number;
}

export interface ModificarRecargoResultado {
  exitoso: boolean;
  mensaje: string;
  recargoAnterior: number;
  recargoNuevo: number;
  nuevoTotal: number;
}

export async function modificarDetalleRecibo(
  idRecibo: number,
  idReciboDetalle: number,
  nuevoMonto: number,
  motivo: string
): Promise<ModificarDetalleResultado> {
  const { data } = await apiClient.put(`/caja/recibos/${idRecibo}/detalles/${idReciboDetalle}`, {
    nuevoMonto,
    motivo,
  });
  return data;
}

export async function modificarRecargoRecibo(
  idRecibo: number,
  nuevoRecargo: number,
  motivo: string
): Promise<ModificarRecargoResultado> {
  const { data } = await apiClient.put(`/caja/recibos/${idRecibo}/recargo`, {
    nuevoRecargo,
    motivo,
  });
  return data;
}

export interface RegistrarYAplicarPagoDto {
  idRecibo: number;
  fechaPagoUtc?: string;
  idMedioPago: number;
  monto: number;
  moneda?: string;
  referencia?: string;
  notas?: string;
  estatus?: number;
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

export async function registrarYAplicarPago(payload: RegistrarYAplicarPagoDto): Promise<RegistrarYAplicarPagoResultDto> {
  const { data } = await apiClient.post<RegistrarYAplicarPagoResultDto>(`/Pagos/registrar-y-aplicar`, {
    ...payload,
    fechaPagoUtc: payload.fechaPagoUtc ?? new Date().toISOString(),
    moneda: payload.moneda ?? "MXN",
    estatus: payload.estatus ?? 0,
  });
  return data;
}

export async function obtenerCajeros(): Promise<UsuarioCajero[]> {
  const { data } = await apiClient.get<UsuarioCajero[]>("/caja/cajeros");
  return data;
}

export async function generarCorteCajaDetallado(
  request: GenerarCorteCajaRequest
): Promise<ResumenCorteCajaDetallado> {
  const { data } = await apiClient.post<ResumenCorteCajaDetallado>(
    "/caja/corte/generar",
    request
  );
  return data;
}

export async function generarPdfCorteCaja(
  request: GenerarCorteCajaRequest
): Promise<Blob> {
  const response = await apiClient.post("/caja/corte/pdf", request, {
    responseType: "blob",
  });
  return response.data;
}
