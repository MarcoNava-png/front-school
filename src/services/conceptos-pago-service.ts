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
  try {
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
  } catch (error) {
    console.warn("⚠️ Endpoint /Conceptos no encontrado. Usando datos mock temporales.");

    // Datos mock temporales para desarrollo
    const mockConceptos: ConceptoPago[] = [
      {
        idConceptoPago: 1,
        clave: "INSC-2024",
        nombre: "Inscripción Cuatrimestral",
        descripcion: "Pago de inscripción al inicio del cuatrimestre",
        tipo: "INSCRIPCION",
        permiteBeca: true,
        status: 1,
      },
      {
        idConceptoPago: 2,
        clave: "COLE-2024",
        nombre: "Colegiatura Mensual",
        descripcion: "Pago mensual de colegiatura",
        tipo: "COLEGIATURA",
        permiteBeca: true,
        status: 1,
      },
      {
        idConceptoPago: 3,
        clave: "MAT-DID",
        nombre: "Material Didáctico",
        descripcion: "Pago por material didáctico del cuatrimestre",
        tipo: "OTRO",
        permiteBeca: true,
        status: 1,
      },
      {
        idConceptoPago: 4,
        clave: "SEG-ESC",
        nombre: "Seguro Escolar",
        descripcion: "Seguro de accidentes escolares",
        tipo: "SEGURO",
        permiteBeca: false,
        status: 1,
      },
      {
        idConceptoPago: 5,
        clave: "EXAM-EXT",
        nombre: "Examen Extraordinario",
        descripcion: "Pago por examen extraordinario",
        tipo: "EXAMEN",
        permiteBeca: false,
        status: 1,
      },
      {
        idConceptoPago: 6,
        clave: "CONST-EST",
        nombre: "Constancia de Estudios",
        descripcion: "Emisión de constancia de estudios",
        tipo: "CONSTANCIA",
        permiteBeca: false,
        status: 1,
      },
      {
        idConceptoPago: 7,
        clave: "CRED-2024",
        nombre: "Credencial Escolar",
        descripcion: "Emisión de credencial escolar",
        tipo: "CREDENCIAL",
        permiteBeca: false,
        status: 1,
      },
      {
        idConceptoPago: 8,
        clave: "REINSC-2024",
        nombre: "Reinscripción",
        descripcion: "Pago de reinscripción para cuatrimestres posteriores",
        tipo: "INSCRIPCION",
        permiteBeca: true,
        status: 1,
      },
    ];

    // Aplicar filtros a los datos mock
    let filteredData = mockConceptos;

    if (filters?.soloActivos) {
      filteredData = filteredData.filter((c) => c.status === 1);
    }

    if (filters?.tipo && filters.tipo !== "TODOS") {
      filteredData = filteredData.filter((c) => c.tipo === filters.tipo);
    }

    if (filters?.busqueda) {
      const busqueda = filters.busqueda.toLowerCase();
      filteredData = filteredData.filter(
        (c) =>
          c.nombre.toLowerCase().includes(busqueda) ||
          c.clave.toLowerCase().includes(busqueda) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(busqueda))
      );
    }

    return filteredData;
  }
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
