import { ConceptoPago } from "@/types/receipt";

import apiClient from "./api-client";

// ============================================================================
// DTOs
// ============================================================================

export interface CreateConceptoPagoDto {
  clave: string;
  nombre: string;
  descripcion?: string;
  tipo: 'INSCRIPCION' | 'COLEGIATURA' | 'EXAMEN' | 'CONSTANCIA' | 'CREDENCIAL' | 'SEGURO' | 'OTRO';
  permiteBeca: boolean;
}

export interface UpdateConceptoPagoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: 'INSCRIPCION' | 'COLEGIATURA' | 'EXAMEN' | 'CONSTANCIA' | 'CREDENCIAL' | 'SEGURO' | 'OTRO';
  permiteBeca?: boolean;
}

export interface ConceptoPagoFilters {
  soloActivos?: boolean;
  tipo?: string;
  busqueda?: string;
}

// ============================================================================
// SERVICIOS
// ============================================================================

/**
 * Obtiene la lista de conceptos de pago
 * @param filters Filtros opcionales
 * @returns Lista de conceptos de pago
 */
export async function listarConceptosPago(
  filters?: ConceptoPagoFilters
): Promise<ConceptoPago[]> {
  const params = new URLSearchParams();

  if (filters?.soloActivos !== undefined) {
    params.append("soloActivos", filters.soloActivos.toString());
  }
  if (filters?.tipo) {
    params.append("tipo", filters.tipo);
  }
  if (filters?.busqueda) {
    params.append("busqueda", filters.busqueda);
  }

  const { data } = await apiClient.get<ConceptoPago[]>(
    `/Conceptos?${params.toString()}`
  );
  return data;
}

/**
 * Obtiene un concepto de pago por ID
 * @param id ID del concepto
 * @returns Concepto de pago
 */
export async function obtenerConceptoPago(id: number): Promise<ConceptoPago> {
  const { data } = await apiClient.get<ConceptoPago>(`/Conceptos/${id}`);
  return data;
}

/**
 * Crea un nuevo concepto de pago
 * @param payload Datos del concepto a crear
 * @returns ID del concepto creado
 */
export async function crearConceptoPago(
  payload: CreateConceptoPagoDto
): Promise<number> {
  const { data } = await apiClient.post<number>("/Conceptos", payload);
  return data;
}

/**
 * Actualiza un concepto de pago existente
 * @param id ID del concepto
 * @param payload Datos a actualizar
 */
export async function actualizarConceptoPago(
  id: number,
  payload: UpdateConceptoPagoDto
): Promise<void> {
  await apiClient.put(`/Conceptos/${id}`, payload);
}

/**
 * Cambia el estado de un concepto de pago
 * @param id ID del concepto
 * @param activo Nuevo estado (1 = activo, 0 = inactivo)
 */
export async function cambiarEstadoConceptoPago(
  id: number,
  activo: boolean
): Promise<void> {
  await apiClient.patch(`/Conceptos/${id}/estado`, { Activo: activo });
}

/**
 * Elimina un concepto de pago (solo si no está en uso)
 * @param id ID del concepto
 */
export async function eliminarConceptoPago(id: number): Promise<void> {
  await apiClient.delete(`/Conceptos/${id}`);
}
