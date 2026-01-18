import { BecaEstudiante, PayloadCreateBeca } from "@/types/receipt";

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
    `/estudiantes/${idEstudiante}/becas?${params.toString()}`
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
  const { data } = await apiClient.post<BecaEstudiante>("/becas", payload);
  return data;
}

/**
 * Actualiza una beca existente
 * @param id ID de la beca
 * @param payload Datos a actualizar
 * @returns Beca actualizada
 */
export async function actualizarBeca(
  id: number,
  payload: Partial<PayloadCreateBeca>
): Promise<BecaEstudiante> {
  const { data } = await apiClient.put<BecaEstudiante>(`/becas/${id}`, payload);
  return data;
}

/**
 * Desactiva una beca
 * @param id ID de la beca
 * @param motivo Motivo de la desactivación (opcional)
 */
export async function desactivarBeca(id: number, motivo?: string): Promise<void> {
  await apiClient.patch(`/becas/${id}/desactivar`, { motivo });
}

/**
 * Activa una beca
 * @param id ID de la beca
 */
export async function activarBeca(id: number): Promise<void> {
  await apiClient.patch(`/becas/${id}/activar`);
}

/**
 * Elimina una beca
 * @param id ID de la beca
 */
export async function eliminarBeca(id: number): Promise<void> {
  await apiClient.delete(`/becas/${id}`);
}

/**
 * Verifica becas activas de un estudiante para un periodo
 * @param idEstudiante ID del estudiante
 * @param idPeriodoAcademico ID del periodo
 * @returns Becas activas aplicables
 */
export async function verificarBecasActivas(
  idEstudiante: number,
  idPeriodoAcademico: number
): Promise<BecaEstudiante[]> {
  const { data } = await apiClient.get<BecaEstudiante[]>(
    `/estudiantes/${idEstudiante}/becas/activas?idPeriodoAcademico=${idPeriodoAcademico}`
  );
  return data;
}

/**
 * Alias de obtenerBecasEstudiante para compatibilidad
 */
export async function listarBecasEstudiante(idEstudiante: number): Promise<BecaEstudiante[]> {
  try {
    return await obtenerBecasEstudiante(idEstudiante);
  } catch {
    console.warn("⚠️ Endpoint de becas no encontrado. Usando datos mock temporales.");

    // Datos mock temporales para desarrollo
    const mockBecas: BecaEstudiante[] = [
      {
        idBeca: 1,
        idEstudiante: 1,
        tipoBeca: "PORCENTAJE",
        valor: 50,
        idConceptoPago: null,
        idPeriodoAcademico: null,
        fechaInicio: "2024-09-01",
        fechaFin: "2025-06-30",
        activa: true,
        observaciones: "Beca por excelencia académica",
        nombreConcepto: "Todos los conceptos",
        nombrePeriodo: "Todos los periodos",
        matriculaEstudiante: "2024001",
        nombreEstudiante: "Juan Pérez García",
      },
      {
        idBeca: 2,
        idEstudiante: 1,
        tipoBeca: "MONTO_FIJO",
        valor: 1000,
        idConceptoPago: 2, // Colegiatura
        idPeriodoAcademico: 1,
        fechaInicio: "2024-09-01",
        fechaFin: "2024-12-31",
        activa: false,
        observaciones: "Beca de apoyo económico (vencida)",
        nombreConcepto: "Colegiatura Mensual",
        nombrePeriodo: "Septiembre 2024 - Diciembre 2024",
        matriculaEstudiante: "2024001",
        nombreEstudiante: "Juan Pérez García",
      },
    ];

    return mockBecas.filter((b) => b.idEstudiante === idEstudiante);
  }
}
