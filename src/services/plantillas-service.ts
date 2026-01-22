import {
  PlantillaCobro,
  CreatePlantillaCobroDto,
  UpdatePlantillaCobroDto,
  ConceptoPago,
  GenerarRecibosMasivosRequest,
  GenerarRecibosMasivosResult,
} from "@/types/receipt";

import apiClient from "./api-client";

// ============================================================================
// SERVICIOS DE PLANTILLAS DE COBRO
// ============================================================================

/**
 * Lista todas las plantillas de cobro con filtros opcionales
 * @param params Filtros opcionales
 * @returns Lista de plantillas
 */
export async function listarPlantillas(params?: {
  soloActivas?: boolean;
  idPeriodoAcademico?: number;
  idPlanEstudios?: number;
  numeroCuatrimestre?: number;
}): Promise<PlantillaCobro[]> {
  const queryParams = new URLSearchParams();

  if (params?.soloActivas !== undefined) {
    queryParams.append("soloActivas", params.soloActivas.toString());
  }
  if (params?.idPeriodoAcademico) {
    queryParams.append("idPeriodoAcademico", params.idPeriodoAcademico.toString());
  }
  if (params?.idPlanEstudios) {
    queryParams.append("idPlanEstudios", params.idPlanEstudios.toString());
  }
  if (params?.numeroCuatrimestre) {
    queryParams.append("numeroCuatrimestre", params.numeroCuatrimestre.toString());
  }

  const { data } = await apiClient.get<PlantillaCobro[]>(
    `/plantillas-cobro?${queryParams.toString()}`
  );
  return data;
}

/**
 * Alias de listarPlantillas para compatibilidad
 */
export async function obtenerPlantillas(activas?: boolean): Promise<PlantillaCobro[]> {
  return listarPlantillas({ soloActivas: activas });
}

/**
 * Obtiene una plantilla de cobro por ID con sus detalles
 * @param id ID de la plantilla
 * @returns Plantilla con detalles
 */
export async function obtenerPlantillaPorId(id: number): Promise<PlantillaCobro> {
  const { data } = await apiClient.get<PlantillaCobro>(`/plantillas-cobro/${id}`);
  return data;
}

/**
 * Busca plantilla activa que coincida con criterios
 * @param idPlanEstudios ID del plan de estudios
 * @param numeroCuatrimestre Número de cuatrimestre
 * @param idPeriodoAcademico ID del periodo (opcional)
 * @param idTurno ID del turno (opcional)
 * @param idModalidad ID de la modalidad (opcional)
 * @returns Plantilla encontrada o null
 */
export async function buscarPlantillaActiva(
  idPlanEstudios: number,
  numeroCuatrimestre: number,
  idPeriodoAcademico?: number,
  idTurno?: number,
  idModalidad?: number
): Promise<PlantillaCobro | null> {
  const params = new URLSearchParams();
  params.append("idPlanEstudios", idPlanEstudios.toString());
  params.append("numeroCuatrimestre", numeroCuatrimestre.toString());
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }
  if (idTurno) {
    params.append("idTurno", idTurno.toString());
  }
  if (idModalidad) {
    params.append("idModalidad", idModalidad.toString());
  }

  try {
    const { data } = await apiClient.get<PlantillaCobro>(
      `/plantillas-cobro/buscar-activa?${params.toString()}`
    );
    return data;
  } catch {
    return null;
  }
}

/**
 * Crea una nueva plantilla de cobro
 * @param payload Datos de la plantilla
 * @returns Plantilla creada
 */
export async function crearPlantilla(
  payload: CreatePlantillaCobroDto
): Promise<PlantillaCobro> {
  const { data } = await apiClient.post<PlantillaCobro>("/plantillas-cobro", payload);
  return data;
}

/**
 * Actualiza una plantilla de cobro existente
 * @param id ID de la plantilla
 * @param payload Datos a actualizar
 * @returns Plantilla actualizada
 */
export async function actualizarPlantilla(
  id: number,
  payload: UpdatePlantillaCobroDto
): Promise<PlantillaCobro> {
  const { data } = await apiClient.put<PlantillaCobro>(
    `/plantillas-cobro/${id}`,
    payload
  );
  return data;
}

/**
 * Cambia el estado de una plantilla de cobro
 * @param id ID de la plantilla
 * @param esActiva Nuevo estado
 */
export async function cambiarEstadoPlantilla(id: number, esActiva: boolean): Promise<void> {
  await apiClient.patch(`/plantillas-cobro/${id}/estado`, { esActiva });
}

/**
 * Elimina una plantilla de cobro
 * @param id ID de la plantilla
 */
export async function eliminarPlantilla(id: number): Promise<void> {
  await apiClient.delete(`/plantillas-cobro/${id}`);
}

/**
 * Duplica una plantilla de cobro para crear una nueva versión
 * @param id ID de la plantilla a duplicar
 * @param cambios Cambios a aplicar en la nueva versión (opcional)
 * @returns Nueva plantilla creada
 */
export async function duplicarPlantilla(
  id: number,
  cambios?: CreatePlantillaCobroDto
): Promise<PlantillaCobro> {
  const { data } = await apiClient.post<PlantillaCobro>(
    `/plantillas-cobro/${id}/duplicar`,
    cambios ?? null
  );
  return data;
}

/**
 * Obtiene los cuatrimestres disponibles para un plan de estudios
 * @param idPlanEstudios ID del plan de estudios
 * @returns Lista de números de cuatrimestre
 */
export async function obtenerCuatrimestresPorPlan(idPlanEstudios: number): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(
    `/plantillas-cobro/cuatrimestres/${idPlanEstudios}`
  );
  return data;
}

/**
 * Genera recibos masivamente para todos los estudiantes que cumplan
 * con los criterios de la plantilla y periodo especificados
 * @param request Datos de la solicitud
 * @returns Resultado de la generación masiva
 */
export async function generarRecibosMasivo(
  request: GenerarRecibosMasivosRequest
): Promise<GenerarRecibosMasivosResult> {
  const { data } = await apiClient.post<GenerarRecibosMasivosResult>(
    "/plantillas-cobro/generar-recibos-masivo",
    request
  );
  return data;
}

// ============================================================================
// PREVIEW DE RECIBOS
// ============================================================================

export interface PreviewConcepto {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  aplicaEnRecibo: number | null; // null = todos, 1 = primero, -1 = último
}

export interface PreviewRecibosRequest {
  numeroRecibos: number;
  diaVencimiento: number;
  fechaInicioPeriodo?: string;
  conceptos: PreviewConcepto[];
}

export interface ReciboPreview {
  numeroRecibo: number;
  fechaVencimiento: string;
  mesCorrespondiente: string;
  conceptos: {
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
  }[];
  subtotal: number;
}

export interface PreviewRecibosResponse {
  recibos: ReciboPreview[];
  totalPrimerRecibo: number;
  totalRecibosRegulares: number;
  totalGeneral: number;
}

/**
 * Genera una vista previa de cómo se distribuirán los recibos
 * @param request Datos para generar la preview
 * @returns Vista previa de los recibos
 */
export async function generarPreviewRecibos(
  request: PreviewRecibosRequest
): Promise<PreviewRecibosResponse> {
  const { data } = await apiClient.post<PreviewRecibosResponse>(
    "/plantillas-cobro/preview-recibos",
    request
  );
  return data;
}

// ============================================================================
// SERVICIOS DE CONCEPTOS DE PAGO
// ============================================================================

/**
 * Obtiene todos los conceptos de pago
 * @param soloActivos Filtrar solo conceptos activos
 * @returns Lista de conceptos
 */
export async function obtenerConceptosPago(soloActivos?: boolean): Promise<ConceptoPago[]> {
  const params = new URLSearchParams();
  if (soloActivos !== undefined) {
    params.append("soloActivos", soloActivos.toString());
  }
  const { data } = await apiClient.get<ConceptoPago[]>(`/Conceptos?${params.toString()}`);
  // Mapear descripcion a nombre para compatibilidad con el frontend
  return data.map(concepto => ({
    ...concepto,
    nombre: concepto.descripcion ?? concepto.clave, // Usar descripcion como nombre
  }));
}

/**
 * Obtiene un concepto de pago por ID
 * @param id ID del concepto
 * @returns Concepto de pago
 */
export async function obtenerConceptoPorId(id: number): Promise<ConceptoPago> {
  const { data } = await apiClient.get<ConceptoPago>(`/Conceptos/${id}`);
  return data;
}

/**
 * Crea un nuevo concepto de pago
 * @param payload Datos del concepto
 * @returns Concepto creado
 */
export async function crearConceptoPago(
  payload: Omit<ConceptoPago, "idConceptoPago" | "status">
): Promise<ConceptoPago> {
  const { data } = await apiClient.post<ConceptoPago>("/Conceptos", payload);
  return data;
}
