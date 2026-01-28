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
 * Actualiza una beca existente
 * NOTA: Este endpoint NO existe en el backend actualmente.
 * Para modificar una beca, se debe eliminar y crear una nueva.
 */
export async function actualizarBeca(
  _id: number,
  _payload: Partial<PayloadCreateBeca>
): Promise<BecaEstudiante> {
  throw new Error("Endpoint no implementado en el backend. Elimina la beca y crea una nueva.");
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
  try {
    return await obtenerBecasEstudiante(idEstudiante);
  } catch {
    console.warn("⚠️ Endpoint de becas no encontrado. Usando datos mock temporales.");

    // Datos mock temporales para desarrollo
    const mockBecas: BecaEstudiante[] = [
      {
        idBecaAsignacion: 1,
        idEstudiante: 1,
        tipo: "PORCENTAJE",
        valor: 50,
        idConceptoPago: null,
        vigenciaDesde: "2024-09-01",
        vigenciaHasta: "2025-06-30",
        activo: true,
        observaciones: "Beca por excelencia académica",
        nombreConcepto: "Todos los conceptos",
        matriculaEstudiante: "2024001",
        nombreEstudiante: "Juan Pérez García",
      },
      {
        idBecaAsignacion: 2,
        idEstudiante: 1,
        tipo: "MONTO",
        valor: 1000,
        idConceptoPago: 2, // Colegiatura
        vigenciaDesde: "2024-09-01",
        vigenciaHasta: "2024-12-31",
        activo: false,
        observaciones: "Beca de apoyo económico (vencida)",
        nombreConcepto: "Colegiatura Mensual",
        matriculaEstudiante: "2024001",
        nombreEstudiante: "Juan Pérez García",
      },
    ];

    return mockBecas.filter((b) => b.idEstudiante === idEstudiante);
  }
}
