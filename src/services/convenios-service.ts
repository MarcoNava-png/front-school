import {
  ConvenioDto,
  CrearConvenioDto,
  ActualizarConvenioDto,
  AsignarConvenioAspiranteDto,
  AspiranteConvenioDto,
  ConvenioDisponibleDto,
  CalculoDescuentoConvenioDto,
  CalculoDescuentoTotalDto,
  EstatusConvenioAspirante,
} from "@/types/convenio";

import apiClient from "./api-client";

// ============================================================================
// CRUD DE CONVENIOS
// ============================================================================

/**
 * Lista todos los convenios con filtros opcionales
 */
export async function listarConvenios(params?: {
  soloActivos?: boolean;
  idCampus?: number;
  idPlanEstudios?: number;
}): Promise<ConvenioDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.soloActivos !== undefined) {
    queryParams.append("soloActivos", String(params.soloActivos));
  }
  if (params?.idCampus) {
    queryParams.append("idCampus", String(params.idCampus));
  }
  if (params?.idPlanEstudios) {
    queryParams.append("idPlanEstudios", String(params.idPlanEstudios));
  }

  const { data } = await apiClient.get<ConvenioDto[]>(
    `/Convenio${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return data;
}

/**
 * Obtiene un convenio por su ID
 */
export async function obtenerConvenioPorId(id: number): Promise<ConvenioDto> {
  const { data } = await apiClient.get<ConvenioDto>(`/Convenio/${id}`);
  return data;
}

/**
 * Obtiene convenios activos (para dropdowns)
 */
export async function obtenerConveniosActivos(params?: {
  idCampus?: number;
  idPlanEstudios?: number;
}): Promise<ConvenioDto[]> {
  const queryParams = new URLSearchParams();
  if (params?.idCampus) {
    queryParams.append("idCampus", String(params.idCampus));
  }
  if (params?.idPlanEstudios) {
    queryParams.append("idPlanEstudios", String(params.idPlanEstudios));
  }

  const { data } = await apiClient.get<ConvenioDto[]>(
    `/Convenio/activos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return data;
}

/**
 * Crea un nuevo convenio
 */
export async function crearConvenio(payload: CrearConvenioDto): Promise<ConvenioDto> {
  const { data } = await apiClient.post<ConvenioDto>("/Convenio", payload);
  return data;
}

/**
 * Actualiza un convenio existente
 */
export async function actualizarConvenio(id: number, payload: ActualizarConvenioDto): Promise<ConvenioDto> {
  const { data } = await apiClient.put<ConvenioDto>(`/Convenio/${id}`, payload);
  return data;
}

/**
 * Elimina un convenio (soft delete)
 */
export async function eliminarConvenio(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/Convenio/${id}`);
  return data;
}

/**
 * Cambia el estado activo/inactivo de un convenio
 */
export async function cambiarEstadoConvenio(id: number, activo: boolean): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>(`/Convenio/${id}/estado`, { activo });
  return data;
}

// ============================================================================
// CONVENIOS PARA ASPIRANTES
// ============================================================================

/**
 * Obtiene los convenios disponibles para un aspirante segun su campus y plan
 */
export async function obtenerConveniosDisponiblesParaAspirante(idAspirante: number): Promise<ConvenioDisponibleDto[]> {
  const { data } = await apiClient.get<ConvenioDisponibleDto[]>(`/Convenio/aspirante/${idAspirante}/disponibles`);
  return data;
}

/**
 * Obtiene los convenios asignados a un aspirante
 */
export async function obtenerConveniosAspirante(idAspirante: number): Promise<AspiranteConvenioDto[]> {
  const { data } = await apiClient.get<AspiranteConvenioDto[]>(`/Convenio/aspirante/${idAspirante}`);
  return data;
}

/**
 * Asigna un convenio a un aspirante
 */
export async function asignarConvenioAspirante(payload: AsignarConvenioAspiranteDto): Promise<AspiranteConvenioDto> {
  const { data } = await apiClient.post<AspiranteConvenioDto>("/Convenio/aspirante/asignar", payload);
  return data;
}

/**
 * Cambia el estatus de un convenio asignado (Pendiente, Aprobado, Rechazado)
 */
export async function cambiarEstatusConvenioAspirante(
  idAspiranteConvenio: number,
  estatus: EstatusConvenioAspirante,
): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>(`/Convenio/aspirante/${idAspiranteConvenio}/estatus`, {
    estatus,
  });
  return data;
}

/**
 * Elimina la asignacion de convenio a un aspirante
 */
export async function eliminarConvenioAspirante(idAspiranteConvenio: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/Convenio/aspirante/${idAspiranteConvenio}`);
  return data;
}

// ============================================================================
// CALCULOS DE DESCUENTO
// ============================================================================

/**
 * Calcula el descuento que aplicaria un convenio sobre un monto
 */
export async function calcularDescuentoConvenio(id: number, monto: number): Promise<CalculoDescuentoConvenioDto> {
  const { data } = await apiClient.get<CalculoDescuentoConvenioDto>(
    `/Convenio/${id}/calcular-descuento?monto=${monto}`,
  );
  return data;
}

/**
 * Calcula el descuento total de los convenios aprobados de un aspirante
 */
export async function calcularDescuentoTotalAspirante(
  idAspirante: number,
  monto: number,
): Promise<CalculoDescuentoTotalDto> {
  const { data } = await apiClient.get<CalculoDescuentoTotalDto>(
    `/Convenio/aspirante/${idAspirante}/calcular-descuento-total?monto=${monto}`,
  );
  return data;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea la descripcion del beneficio de un convenio
 */
export function formatearBeneficio(convenio: {
  tipoBeneficio: string;
  descuentoPct?: number | null;
  monto?: number | null;
}): string {
  switch (convenio.tipoBeneficio.toUpperCase()) {
    case "PORCENTAJE":
      return `${convenio.descuentoPct ?? 0}% de descuento`;
    case "MONTO":
      return `$${(convenio.monto ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })} de descuento`;
    case "EXENCION":
      return "Exencion total (100%)";
    default:
      return convenio.tipoBeneficio;
  }
}

/**
 * Obtiene el color del badge segun el estatus del convenio asignado
 */
export function getColorEstatusConvenio(estatus: EstatusConvenioAspirante): "default" | "success" | "destructive" {
  switch (estatus) {
    case "Aprobado":
      return "success";
    case "Rechazado":
      return "destructive";
    default:
      return "default";
  }
}
