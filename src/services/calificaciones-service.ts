import type {
  CalificacionParcial,
  CalificacionParcialCreateRequest,
  CalificacionParcialEstadoRequest,
  CalificacionDetalle,
  CalificacionDetalleUpsertRequest,
  ConcentradoAlumno,
  ConcentradoGrupoParcial,
  ValidacionPesos,
  Parcial,
  ParcialesRequest,
} from "@/types/calificaciones";
import type { PaginatedResponse } from "@/types/paginated-response";

import apiClient from "./api-client";

export async function getParciales(page = 1, pageSize = 100): Promise<PaginatedResponse<Parcial>> {
  const { data } = await apiClient.get<PaginatedResponse<Parcial>>(`/Parciales?page=${page}&pageSize=${pageSize}`);
  return data;
}

export async function createParcial(request: ParcialesRequest): Promise<Parcial> {
  const { data } = await apiClient.post<Parcial>("/Parciales", request);
  return data;
}

export async function updateParcial(parcial: Parcial): Promise<Parcial> {
  const { data } = await apiClient.put<Parcial>("/Parciales", parcial);
  return data;
}

export async function getCalificacionesPorGrupo(
  grupoMateriaId: number,
  parcialId: number
): Promise<CalificacionParcial[]> {
  const { data } = await apiClient.get<CalificacionParcial[]>(
    `/Calificaciones/${grupoMateriaId}/${parcialId}`
  );
  return data;
}

export async function abrirParcial(request: CalificacionParcialCreateRequest): Promise<CalificacionParcial> {
  const { data } = await apiClient.post<CalificacionParcial>("/Calificaciones/parciales", request);
  return data;
}

export async function getParcialById(id: number): Promise<CalificacionParcial> {
  const { data } = await apiClient.get<CalificacionParcial>(`/Calificaciones/parciales/${id}`);
  return data;
}

export async function cambiarEstadoParcial(
  id: number,
  request: CalificacionParcialEstadoRequest
): Promise<void> {
  await apiClient.patch(`/Calificaciones/parciales/${id}/estado`, request);
}

export async function upsertCalificacion(request: CalificacionDetalleUpsertRequest): Promise<CalificacionDetalle> {
  const { data } = await apiClient.post<CalificacionDetalle>("/Calificaciones/detalle", request);
  return data;
}

export async function getDetallesCalificaciones(filters: {
  grupoMateriaId?: number;
  parcialId?: number;
  inscripcionId?: number;
  tipoEvaluacionEnum?: number;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<CalificacionDetalle>> {
  const params = new URLSearchParams();
  if (filters.grupoMateriaId) params.append("grupoMateriaId", filters.grupoMateriaId.toString());
  if (filters.parcialId) params.append("parcialId", filters.parcialId.toString());
  if (filters.inscripcionId) params.append("inscripcionId", filters.inscripcionId.toString());
  if (filters.tipoEvaluacionEnum !== undefined) params.append("tipoEvaluacionEnum", filters.tipoEvaluacionEnum.toString());
  params.append("page", (filters.page || 1).toString());
  params.append("pageSize", (filters.pageSize || 20).toString());

  const { data } = await apiClient.get<PaginatedResponse<CalificacionDetalle>>(
    `/Calificaciones/detalles?${params.toString()}`
  );
  return data;
}

export async function getConcentradoAlumno(inscripcionId: number): Promise<ConcentradoAlumno> {
  const { data } = await apiClient.get<ConcentradoAlumno>(`/Calificaciones/concentrado/alumno/${inscripcionId}`);
  return data;
}

export async function getConcentradoGrupoParcial(
  grupoMateriaId: number,
  parcialId: number
): Promise<ConcentradoGrupoParcial> {
  const { data } = await apiClient.get<ConcentradoGrupoParcial>(
    `/Calificaciones/concentrado/grupo/${grupoMateriaId}/parcial/${parcialId}`
  );
  return data;
}

export async function validarPesosEvaluacion(calificacionParcialId: number): Promise<ValidacionPesos> {
  const { data } = await apiClient.get<ValidacionPesos>(
    `/Calificaciones/parciales/${calificacionParcialId}/validar-pesos`
  );
  return data;
}
