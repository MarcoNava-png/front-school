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

export async function generateReceipts(payload: GenerateReceiptsRequest): Promise<Receipt[]> {
  const { data } = await apiClient.post<Receipt[]>(`/recibos/generar`, payload);
  return data;
}

export async function getReceiptById(id: number): Promise<Receipt | null> {
  try {
    const { data } = await apiClient.get<Receipt>(`/recibos/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function buscarReciboPorFolio(folio: string): Promise<Receipt | null> {
  try {
    const { data } = await apiClient.get<Receipt>(`/recibos/folio/${folio}`);
    return data;
  } catch {
    return null;
  }
}

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

  const useAdminEndpoint = filtros.matricula || filtros.folio || filtros.soloVencidos;
  const endpoint = useAdminEndpoint ? "/recibos/admin" : "/recibos";

  const { data } = await apiClient.get(`${endpoint}?${params.toString()}`);

  if (Array.isArray(data)) {
    return data;
  } else if (data && data.recibos) {
    return data.recibos;
  }
  return [];
}

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

export async function listReceiptsByPeriod(
  idPeriodoAcademico: number,
  idEstudiante?: number
): Promise<Receipt[]> {
  return listarRecibos({
    idPeriodoAcademico,
    idEstudiante: idEstudiante || undefined,
  });
}

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

export async function recalcularRecibos(
  payload: RecalcularRecibosRequest
): Promise<{ recibosModificados: number }> {
  const { data } = await apiClient.post<{ recibosModificados: number }>(
    "/recibos/recalcular",
    payload
  );
  return data;
}

export async function aplicarAjusteRecibo(payload: AjusteReciboRequest): Promise<Receipt> {
  const { data } = await apiClient.post<Receipt>("/recibos/ajuste", payload);
  return data;
}

export async function cancelarRecibo(idRecibo: number, motivo: string): Promise<Receipt> {
  const { data } = await apiClient.put<Receipt>(`/recibos/${idRecibo}/cancelar`, {
    motivo,
  });
  return data;
}

export async function reversarRecibo(idRecibo: number, motivo: string): Promise<Receipt> {
  const { data } = await apiClient.put<Receipt>(`/recibos/${idRecibo}/reversar`, {
    motivo,
  });
  return data;
}

export async function descargarReciboPDF(idRecibo: number): Promise<Blob> {
  const response = await apiClient.get(`/recibos/${idRecibo}/pdf`, {
    responseType: "blob",
  });
  return response.data;
}

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

export async function exportarIngresosPeriodo(idPeriodoAcademico: number): Promise<Blob> {
  const response = await apiClient.get(
    `/recibos/reportes/ingresos/${idPeriodoAcademico}/excel`,
    { responseType: "blob" }
  );
  return response.data;
}

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
  matricula?: string;
  nombreCompleto?: string;
  carrera?: string;
  planEstudios?: string;
  grupo?: string;
  email?: string;
  telefono?: string;
  tipoPersona: string;
  detalles: { descripcion: string; cantidad: number; precioUnitario: number; importe: number }[];
}

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

export async function obtenerEstadisticasRecibos(idPeriodoAcademico?: number): Promise<ReciboEstadisticas> {
  const params = new URLSearchParams();
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const { data } = await apiClient.get<ReciboEstadisticas>(`/recibos/estadisticas?${params.toString()}`);
  return data;
}

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
