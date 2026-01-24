import {
  GenerateReceiptsRequest,
  Receipt,
  ReceiptFilters,
  RecalcularRecibosRequest,
  AjusteReciboRequest,
  CarteraVencidaReporte,
  IngresosPeriodoReporte,
  ReceiptStatus,
} from "@/types/receipt";

import apiClient from "./api-client";

// ============================================================================
// SERVICIOS DE RECIBOS
// ============================================================================

/**
 * Genera recibos para un estudiante en un periodo académico
 * @param payload Datos para generar los recibos
 * @returns Lista de recibos generados
 */
export async function generateReceipts(payload: GenerateReceiptsRequest): Promise<Receipt[]> {
  const { data } = await apiClient.post<Receipt[]>(`/recibos/generar`, payload);
  return data;
}

/**
 * Obtiene un recibo específico por su ID
 * @param id ID del recibo
 * @returns Datos completos del recibo con sus líneas de detalle
 */
export async function getReceiptById(id: number): Promise<Receipt | null> {
  try {
    const { data } = await apiClient.get<Receipt>(`/recibos/${id}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Busca recibo por folio
 * @param folio Folio del recibo
 * @returns Recibo encontrado o null
 */
export async function buscarReciboPorFolio(folio: string): Promise<Receipt | null> {
  try {
    const { data } = await apiClient.get<Receipt>(`/recibos/folio/${folio}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Respuesta del endpoint de administración de recibos
 */
interface RecibosAdminResponse {
  recibos: Receipt[];
  totalRegistros: number;
  paginaActual: number;
  totalPaginas: number;
  tamanioPagina: number;
  totalSaldoPendiente: number;
  totalRecargos: number;
  totalVencidos: number;
  totalPagados: number;
  totalPendientes: number;
}

/**
 * Lista recibos con filtros avanzados
 * @param filtros Filtros de búsqueda
 * @returns Lista de recibos
 */
export async function listarRecibos(filtros: ReceiptFilters): Promise<Receipt[]> {
  const params = new URLSearchParams();

  if (filtros.idPeriodoAcademico) {
    params.append("idPeriodoAcademico", filtros.idPeriodoAcademico.toString());
  }
  if (filtros.idEstudiante) {
    params.append("idEstudiante", filtros.idEstudiante.toString());
  }
  if (filtros.estatus) {
    if (Array.isArray(filtros.estatus)) {
      filtros.estatus.forEach((e) => params.append("estatus", e.toString()));
    } else {
      params.append("estatus", filtros.estatus.toString());
    }
  }
  if (filtros.soloVencidos) {
    params.append("soloVencidos", "true");
  }
  if (filtros.matricula) {
    params.append("matricula", filtros.matricula);
  }
  if (filtros.folio) {
    params.append("folio", filtros.folio);
  }

  // Usar el endpoint de administración si hay filtros avanzados (matrícula, folio, etc.)
  const useAdminEndpoint = filtros.matricula || filtros.folio || filtros.soloVencidos;
  const endpoint = useAdminEndpoint ? "/recibos/admin" : "/recibos";

  const { data } = await apiClient.get(`${endpoint}?${params.toString()}`);

  // Manejar ambas estructuras de respuesta (array directo o objeto con recibos)
  if (Array.isArray(data)) {
    return data;
  } else if (data && data.recibos) {
    return data.recibos;
  }
  return [];
}

/**
 * Lista recibos con filtros avanzados (incluye estadísticas)
 * @param filtros Filtros de búsqueda
 * @returns Respuesta completa con recibos y estadísticas
 */
export async function listarRecibosAdmin(filtros: ReceiptFilters): Promise<RecibosAdminResponse> {
  const params = new URLSearchParams();

  if (filtros.idPeriodoAcademico) {
    params.append("idPeriodoAcademico", filtros.idPeriodoAcademico.toString());
  }
  if (filtros.idEstudiante) {
    params.append("idEstudiante", filtros.idEstudiante.toString());
  }
  if (filtros.estatus) {
    if (Array.isArray(filtros.estatus)) {
      filtros.estatus.forEach((e) => params.append("estatus", e.toString()));
    } else {
      params.append("estatus", filtros.estatus.toString());
    }
  }
  if (filtros.soloVencidos) {
    params.append("soloVencidos", "true");
  }
  if (filtros.matricula) {
    params.append("matricula", filtros.matricula);
  }
  if (filtros.folio) {
    params.append("folio", filtros.folio);
  }

  const { data } = await apiClient.get<RecibosAdminResponse>(`/recibos/admin?${params.toString()}`);
  return data;
}

/**
 * Lista los recibos de un periodo académico
 * Opcionalmente filtrados por estudiante
 * @param idPeriodoAcademico ID del periodo académico
 * @param idEstudiante Opcional - ID del estudiante para filtrar
 * @returns Lista de recibos
 */
export async function listReceiptsByPeriod(
  idPeriodoAcademico: number,
  idEstudiante?: number
): Promise<Receipt[]> {
  return listarRecibos({
    idPeriodoAcademico,
    idEstudiante: idEstudiante || undefined,
  });
}

/**
 * Obtiene recibos pendientes de un estudiante
 * @param idEstudiante ID del estudiante
 * @param idPeriodoAcademico Opcional - filtrar por periodo
 * @returns Lista de recibos pendientes
 */
export async function obtenerRecibosPendientes(
  idEstudiante: number,
  idPeriodoAcademico?: number
): Promise<Receipt[]> {
  return listarRecibos({
    idEstudiante,
    idPeriodoAcademico: idPeriodoAcademico || undefined,
    estatus: [ReceiptStatus.PENDIENTE, ReceiptStatus.PARCIAL, ReceiptStatus.VENCIDO],
  });
}

/**
 * Recalcula recibos pendientes de un estudiante aplicando becas actualizadas
 * @param payload Datos para recalcular
 * @returns Cantidad de recibos modificados
 */
export async function recalcularRecibos(
  payload: RecalcularRecibosRequest
): Promise<{ recibosModificados: number }> {
  const { data } = await apiClient.post<{ recibosModificados: number }>(
    "/recibos/recalcular",
    payload
  );
  return data;
}

/**
 * Aplica un ajuste manual a un recibo
 * @param payload Datos del ajuste
 * @returns Recibo actualizado
 */
export async function aplicarAjusteRecibo(payload: AjusteReciboRequest): Promise<Receipt> {
  const { data } = await apiClient.post<Receipt>("/recibos/ajuste", payload);
  return data;
}

/**
 * Cancela un recibo
 * @param idRecibo ID del recibo
 * @param motivo Motivo de la cancelación
 * @returns Recibo cancelado
 */
export async function cancelarRecibo(idRecibo: number, motivo: string): Promise<Receipt> {
  const { data } = await apiClient.post<Receipt>(`/recibos/${idRecibo}/cancelar`, {
    motivo,
  });
  return data;
}

/**
 * Descarga el PDF de un recibo
 * @param idRecibo ID del recibo
 * @returns Blob del PDF
 */
export async function descargarReciboPDF(idRecibo: number): Promise<Blob> {
  const response = await apiClient.get(`/recibos/${idRecibo}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

// ============================================================================
// REPORTES
// ============================================================================

/**
 * Obtiene el reporte de cartera vencida
 * @param idPeriodoAcademico Opcional - filtrar por periodo
 * @param diasVencidoMinimo Opcional - solo recibos con más de X días vencidos
 * @returns Reporte de cartera vencida
 */
export async function obtenerCarteraVencida(
  idPeriodoAcademico?: number,
  diasVencidoMinimo?: number
): Promise<CarteraVencidaReporte> {
  const params = new URLSearchParams();
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }
  if (diasVencidoMinimo) {
    params.append("diasVencidoMinimo", diasVencidoMinimo.toString());
  }

  const { data } = await apiClient.get<CarteraVencidaReporte>(
    `/recibos/reportes/cartera-vencida?${params.toString()}`
  );
  return data;
}

/**
 * Obtiene el reporte de ingresos por periodo
 * @param idPeriodoAcademico ID del periodo
 * @param fechaInicio Opcional - fecha inicio del reporte
 * @param fechaFin Opcional - fecha fin del reporte
 * @returns Reporte de ingresos
 */
export async function obtenerIngresosPorPeriodo(
  idPeriodoAcademico: number,
  fechaInicio?: string,
  fechaFin?: string
): Promise<IngresosPeriodoReporte> {
  const params = new URLSearchParams();
  params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  if (fechaInicio) {
    params.append("fechaInicio", fechaInicio);
  }
  if (fechaFin) {
    params.append("fechaFin", fechaFin);
  }

  const { data } = await apiClient.get<IngresosPeriodoReporte>(
    `/recibos/reportes/ingresos?${params.toString()}`
  );
  return data;
}

/**
 * Exporta cartera vencida a Excel
 * @param idPeriodoAcademico Opcional - filtrar por periodo
 * @returns Blob del archivo Excel
 */
export async function exportarCarteraVencida(
  idPeriodoAcademico?: number
): Promise<Blob> {
  const params = new URLSearchParams();
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const response = await apiClient.get(
    `/recibos/reportes/cartera-vencida/excel?${params.toString()}`,
    { responseType: "blob" }
  );
  return response.data;
}

/**
 * Exporta ingresos por periodo a Excel
 * @param idPeriodoAcademico ID del periodo
 * @returns Blob del archivo Excel
 */
export async function exportarIngresosPeriodo(idPeriodoAcademico: number): Promise<Blob> {
  const response = await apiClient.get(
    `/recibos/reportes/ingresos/${idPeriodoAcademico}/excel`,
    { responseType: "blob" }
  );
  return response.data;
}

// ============================================================================
// BÚSQUEDA AVANZADA Y ESTADÍSTICAS
// ============================================================================

/**
 * Filtros para buscar recibos
 */
export interface ReciboBusquedaFiltros {
  folio?: string;
  matricula?: string;
  idPeriodoAcademico?: number;
  estatus?: string;
  soloVencidos?: boolean;
  soloPagados?: boolean;
  soloPendientes?: boolean;
  fechaEmisionDesde?: string;
  fechaEmisionHasta?: string;
  fechaVencimientoDesde?: string;
  fechaVencimientoHasta?: string;
  pagina?: number;
  tamanioPagina?: number;
}

/**
 * Recibo con información extendida del estudiante/aspirante
 */
export interface ReciboExtendido {
  idRecibo: number;
  folio?: string;
  idAspirante?: number;
  idEstudiante?: number;
  idPeriodoAcademico?: number;
  nombrePeriodo?: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estatus: string;
  subtotal: number;
  descuento: number;
  recargos: number;
  total: number;
  saldo: number;
  notas?: string;
  diasVencido: number;
  estaVencido: boolean;
  // Datos del estudiante/aspirante
  matricula?: string;
  nombreCompleto?: string;
  carrera?: string;
  planEstudios?: string;
  grupo?: string;
  email?: string;
  telefono?: string;
  tipoPersona: string; // "Estudiante" o "Aspirante"
  detalles: { descripcion: string; cantidad: number; precioUnitario: number; importe: number }[];
}

/**
 * Resultado de búsqueda de recibos con paginación
 */
export interface ReciboBusquedaResultado {
  recibos: ReciboExtendido[];
  totalRegistros: number;
  paginaActual: number;
  totalPaginas: number;
  tamanioPagina: number;
  totalSaldoPendiente: number;
  totalRecargos: number;
  totalVencidos: number;
  totalPagados: number;
  totalPendientes: number;
}

/**
 * Estadísticas de recibos
 */
export interface ReciboEstadisticas {
  totalRecibos: number;
  saldoPendiente: number;
  recibosVencidos: number;
  recargosAcumulados: number;
  recibosPendientes: number;
  recibosPagados: number;
  recibosParciales: number;
  totalCobrado: number;
  porPeriodo: EstadisticasPorPeriodo[];
}

export interface EstadisticasPorPeriodo {
  idPeriodoAcademico: number;
  nombrePeriodo?: string;
  totalRecibos: number;
  saldoPendiente: number;
  recibosVencidos: number;
}

/**
 * Busca recibos con filtros avanzados
 * @param filtros Filtros de búsqueda
 * @returns Resultado paginado con estadísticas
 */
export async function buscarRecibosAvanzado(filtros: ReciboBusquedaFiltros): Promise<ReciboBusquedaResultado> {
  const params = new URLSearchParams();

  if (filtros.folio) params.append("folio", filtros.folio);
  if (filtros.matricula) params.append("matricula", filtros.matricula);
  if (filtros.idPeriodoAcademico) params.append("idPeriodoAcademico", filtros.idPeriodoAcademico.toString());
  if (filtros.estatus) params.append("estatus", filtros.estatus);
  if (filtros.soloVencidos) params.append("soloVencidos", "true");
  if (filtros.soloPagados) params.append("soloPagados", "true");
  if (filtros.soloPendientes) params.append("soloPendientes", "true");
  if (filtros.fechaEmisionDesde) params.append("fechaEmisionDesde", filtros.fechaEmisionDesde);
  if (filtros.fechaEmisionHasta) params.append("fechaEmisionHasta", filtros.fechaEmisionHasta);
  if (filtros.fechaVencimientoDesde) params.append("fechaVencimientoDesde", filtros.fechaVencimientoDesde);
  if (filtros.fechaVencimientoHasta) params.append("fechaVencimientoHasta", filtros.fechaVencimientoHasta);
  if (filtros.pagina) params.append("pagina", filtros.pagina.toString());
  if (filtros.tamanioPagina) params.append("tamanioPagina", filtros.tamanioPagina.toString());

  const { data } = await apiClient.get<ReciboBusquedaResultado>(`/recibos/buscar?${params.toString()}`);
  return data;
}

/**
 * Obtiene estadísticas de recibos
 * @param idPeriodoAcademico Opcional - filtrar por periodo
 * @returns Estadísticas de recibos
 */
export async function obtenerEstadisticasRecibos(idPeriodoAcademico?: number): Promise<ReciboEstadisticas> {
  const params = new URLSearchParams();
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const { data } = await apiClient.get<ReciboEstadisticas>(`/recibos/estadisticas?${params.toString()}`);
  return data;
}

/**
 * Exporta recibos a Excel con estadísticas y adeudos
 * Genera un archivo Excel con 3 hojas: Resumen, Detalle de Recibos, Adeudos
 * @param filtros Filtros aplicados
 * @returns Blob del archivo Excel
 */
export async function exportarRecibosExcel(filtros: ReciboBusquedaFiltros): Promise<Blob> {
  const params = new URLSearchParams();

  if (filtros.folio) params.append("folio", filtros.folio);
  if (filtros.matricula) params.append("matricula", filtros.matricula);
  if (filtros.idPeriodoAcademico) params.append("idPeriodoAcademico", filtros.idPeriodoAcademico.toString());
  if (filtros.estatus) params.append("estatus", filtros.estatus);
  if (filtros.soloVencidos) params.append("soloVencidos", "true");
  if (filtros.soloPagados) params.append("soloPagados", "true");
  if (filtros.soloPendientes) params.append("soloPendientes", "true");

  const response = await apiClient.get(`/recibos/exportar-excel?${params.toString()}`, {
    responseType: "blob",
  });
  return response.data;
}
