import apiClient from "./api-client";
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

// ============================================================================
// PARCIALES (Periodos: P1, P2, P3...)
// ============================================================================

/**
 * Obtiene todos los parciales (P1, P2, P3, etc.)
 */
export async function getParciales(page = 1, pageSize = 100): Promise<PaginatedResponse<Parcial>> {
  const { data } = await apiClient.get<PaginatedResponse<Parcial>>(`/Parciales?page=${page}&pageSize=${pageSize}`);
  return data;
}

/**
 * Crea un nuevo parcial
 */
export async function createParcial(request: ParcialesRequest): Promise<Parcial> {
  const { data } = await apiClient.post<Parcial>("/Parciales", request);
  return data;
}

/**
 * Actualiza un parcial
 */
export async function updateParcial(parcial: Parcial): Promise<Parcial> {
  const { data } = await apiClient.put<Parcial>("/Parciales", parcial);
  return data;
}

// ============================================================================
// CALIFICACIONES PARCIALES (Actas por grupo-materia)
// ============================================================================

/**
 * Obtiene las calificaciones de un grupo-materia en un parcial específico
 */
export async function getCalificacionesPorGrupo(
  grupoMateriaId: number,
  parcialId: number
): Promise<CalificacionParcial[]> {
  const { data } = await apiClient.get<CalificacionParcial[]>(
    `/Calificaciones/${grupoMateriaId}/${parcialId}`
  );
  return data;
}

/**
 * Abre un nuevo parcial para captura de calificaciones
 */
export async function abrirParcial(request: CalificacionParcialCreateRequest): Promise<CalificacionParcial> {
  const { data } = await apiClient.post<CalificacionParcial>("/Calificaciones/parciales", request);
  return data;
}

/**
 * Obtiene un parcial por ID
 */
export async function getParcialById(id: number): Promise<CalificacionParcial> {
  const { data } = await apiClient.get<CalificacionParcial>(`/Calificaciones/parciales/${id}`);
  return data;
}

/**
 * Cambia el estado de un parcial (Abierto, Cerrado, Publicado)
 */
export async function cambiarEstadoParcial(
  id: number,
  request: CalificacionParcialEstadoRequest
): Promise<void> {
  await apiClient.patch(`/Calificaciones/parciales/${id}/estado`, request);
}

// ============================================================================
// DETALLE DE CALIFICACIONES (Evaluaciones individuales)
// ============================================================================

/**
 * Crea o actualiza una calificación individual (upsert)
 */
export async function upsertCalificacion(request: CalificacionDetalleUpsertRequest): Promise<CalificacionDetalle> {
  const { data } = await apiClient.post<CalificacionDetalle>("/Calificaciones/detalle", request);
  return data;
}

/**
 * Obtiene detalles de calificaciones con filtros
 */
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

// ============================================================================
// CONCENTRADOS Y VALIDACIONES
// ============================================================================

/**
 * Obtiene el concentrado de calificaciones de un alumno (todas sus evaluaciones)
 */
export async function getConcentradoAlumno(inscripcionId: number): Promise<ConcentradoAlumno> {
  const { data } = await apiClient.get<ConcentradoAlumno>(`/Calificaciones/concentrado/alumno/${inscripcionId}`);
  return data;
}

/**
 * Obtiene el concentrado de un grupo en un parcial específico
 */
export async function getConcentradoGrupoParcial(
  grupoMateriaId: number,
  parcialId: number
): Promise<ConcentradoGrupoParcial> {
  const { data } = await apiClient.get<ConcentradoGrupoParcial>(
    `/Calificaciones/concentrado/grupo/${grupoMateriaId}/parcial/${parcialId}`
  );
  return data;
}

/**
 * Valida que la suma de pesos de evaluación sea 100%
 */
export async function validarPesosEvaluacion(calificacionParcialId: number): Promise<ValidacionPesos> {
  const { data } = await apiClient.get<ValidacionPesos>(
    `/Calificaciones/parciales/${calificacionParcialId}/validar-pesos`
  );
  return data;
}
