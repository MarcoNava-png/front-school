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
  } catch (error) {
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
  } catch (error) {
    return null;
  }
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

  const { data } = await apiClient.get<Receipt[]>(`/recibos?${params.toString()}`);
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
