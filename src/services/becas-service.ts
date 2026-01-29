import {
  BecaEstudiante,
  PayloadActualizarBeca,
  PayloadAsignarBecaCatalogo,
  PayloadCreateBeca,
} from "@/types/receipt";

import apiClient from "./api-client";

// ============================================================================
// SERVICIOS DE BECAS
// ============================================================================

/**
 * Obtiene todas las becas de un estudiante
 * @param idEstudiante ID del estudiante
 * @param soloActivas Filtrar solo becas activas
 * @returns Lista de becas
 */
export async function obtenerBecasEstudiante(
  idEstudiante: number,
  soloActivas?: boolean
): Promise<BecaEstudiante[]> {
  const params = new URLSearchParams();
  if (soloActivas !== undefined) {
    params.append("soloActivas", soloActivas.toString());
  }

  const { data } = await apiClient.get<BecaEstudiante[]>(
    `/becas/estudiante/${idEstudiante}?${params.toString()}`
  );
  return data;
}

/**
 * Obtiene todas las becas del sistema
 * @param filtros Filtros opcionales
 * @returns Lista de becas
 */
export async function obtenerTodasLasBecas(filtros?: {
  idPeriodoAcademico?: number;
  soloActivas?: boolean;
}): Promise<BecaEstudiante[]> {
  const params = new URLSearchParams();
  if (filtros?.idPeriodoAcademico) {
    params.append("idPeriodoAcademico", filtros.idPeriodoAcademico.toString());
  }
  if (filtros?.soloActivas !== undefined) {
    params.append("soloActivas", filtros.soloActivas.toString());
  }

  const { data } = await apiClient.get<BecaEstudiante[]>(`/becas?${params.toString()}`);
  return data;
}

/**
 * Obtiene una beca por ID
 * @param id ID de la beca
 * @returns Beca encontrada
 */
export async function obtenerBecaPorId(id: number): Promise<BecaEstudiante> {
  const { data } = await apiClient.get<BecaEstudiante>(`/becas/${id}`);
  return data;
}

/**
 * Crea una nueva beca para un estudiante
 * @param payload Datos de la beca
 * @returns Beca creada
 */
export async function crearBeca(payload: PayloadCreateBeca): Promise<BecaEstudiante> {
  // Mapear campos del frontend a los nombres que espera el backend
  const backendPayload = {
    IdEstudiante: payload.idEstudiante,
    IdConceptoPago: payload.idConceptoPago ?? null,
    Tipo: payload.tipoBeca,
    Valor: payload.valor,
    VigenciaDesde: payload.vigenciaDesde,
    VigenciaHasta: payload.vigenciaHasta ?? null,
    TopeMensual: payload.topeMensual ?? null,
    Observaciones: payload.observaciones ?? null,
  };
  const { data } = await apiClient.post<BecaEstudiante>("/becas/asignar", backendPayload);
  return data;
}

/**
 * Asigna una beca del catálogo a un estudiante
 * @param payload Datos de la asignación
 * @returns Beca asignada
 */
export async function asignarBecaDesdeCatalogo(
  payload: PayloadAsignarBecaCatalogo
): Promise<BecaEstudiante> {
  const { data } = await apiClient.post<BecaEstudiante>(
    "/becas/asignar-catalogo",
    payload
  );
  return data;
}

/**
 * Actualiza una beca existente
 * @param id ID de la beca asignación
 * @param payload Datos a actualizar (período, vigencias, observaciones, activo)
 * @returns Beca actualizada
 */
export async function actualizarBeca(
  id: number,
  payload: PayloadActualizarBeca
): Promise<BecaEstudiante> {
  const { data } = await apiClient.put<BecaEstudiante>(`/becas/${id}`, payload);
  return data;
}

/**
 * Desactiva/elimina una beca
 * @param id ID de la beca
 */
export async function desactivarBeca(id: number): Promise<void> {
  await apiClient.delete(`/becas/${id}`);
}

/**
 * Elimina una beca (alias de desactivarBeca)
 * @param id ID de la beca
 */
export async function eliminarBeca(id: number): Promise<void> {
  await apiClient.delete(`/becas/${id}`);
}

/**
 * Verifica becas activas de un estudiante
 * @param idEstudiante ID del estudiante
 * @returns Becas activas aplicables
 */
export async function verificarBecasActivas(
  idEstudiante: number
): Promise<BecaEstudiante[]> {
  const { data } = await apiClient.get<BecaEstudiante[]>(
    `/becas/estudiante/${idEstudiante}?soloActivas=true`
  );
  return data;
}

/**
 * Alias de obtenerBecasEstudiante para compatibilidad
 */
export async function listarBecasEstudiante(idEstudiante: number): Promise<BecaEstudiante[]> {
  return await obtenerBecasEstudiante(idEstudiante);
}

/**
 * Recalcula los descuentos de recibos pendientes aplicando las becas activas
 * @param idEstudiante ID del estudiante
 * @param idPeriodoAcademico ID del periodo académico (opcional)
 * @returns Cantidad de recibos actualizados
 */
export async function recalcularDescuentosBecas(
  idEstudiante: number,
  idPeriodoAcademico?: number
): Promise<{ mensaje: string; recibosActualizados: number }> {
  const { data } = await apiClient.post<{ mensaje: string; recibosActualizados: number }>(
    "/becas/recalcular-descuentos",
    {
      idEstudiante,
      idPeriodoAcademico: idPeriodoAcademico ?? null,
    }
  );
  return data;
}
