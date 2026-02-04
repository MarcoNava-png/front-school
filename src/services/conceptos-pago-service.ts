import { ConceptoPago } from "@/types/receipt";

import apiClient from "./api-client";

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

export async function obtenerConceptoPago(id: number): Promise<ConceptoPago> {
  const { data } = await apiClient.get<ConceptoPago>(`/Conceptos/${id}`);
  return data;
}

export async function crearConceptoPago(
  payload: CreateConceptoPagoDto
): Promise<number> {
  const { data } = await apiClient.post<number>("/Conceptos", payload);
  return data;
}

export async function actualizarConceptoPago(
  id: number,
  payload: UpdateConceptoPagoDto
): Promise<void> {
  await apiClient.put(`/Conceptos/${id}`, payload);
}

export async function cambiarEstadoConceptoPago(
  id: number,
  activo: boolean
): Promise<void> {
  await apiClient.patch(`/Conceptos/${id}/estado`, { Activo: activo });
}

export async function eliminarConceptoPago(id: number): Promise<void> {
  await apiClient.delete(`/Conceptos/${id}`);
}
