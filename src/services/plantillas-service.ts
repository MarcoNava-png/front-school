import {
  PlantillaCobro,
  CreatePlantillaCobroDto,
  UpdatePlantillaCobroDto,
  ConceptoPago,
  GenerarRecibosMasivosRequest,
  GenerarRecibosMasivosResult,
} from "@/types/receipt";

import apiClient from "./api-client";

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

export async function obtenerPlantillas(activas?: boolean): Promise<PlantillaCobro[]> {
  return listarPlantillas({ soloActivas: activas });
}

export async function obtenerPlantillaPorId(id: number): Promise<PlantillaCobro> {
  const { data } = await apiClient.get<PlantillaCobro>(`/plantillas-cobro/${id}`);
  return data;
}

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

export async function crearPlantilla(
  payload: CreatePlantillaCobroDto
): Promise<PlantillaCobro> {
  const { data } = await apiClient.post<PlantillaCobro>("/plantillas-cobro", payload);
  return data;
}

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

export async function cambiarEstadoPlantilla(id: number, esActiva: boolean): Promise<void> {
  await apiClient.patch(`/plantillas-cobro/${id}/estado`, { esActiva });
}

export async function eliminarPlantilla(id: number): Promise<void> {
  await apiClient.delete(`/plantillas-cobro/${id}`);
}

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

export async function obtenerCuatrimestresPorPlan(idPlanEstudios: number): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(
    `/plantillas-cobro/cuatrimestres/${idPlanEstudios}`
  );
  return data;
}

export async function generarRecibosMasivo(
  request: GenerarRecibosMasivosRequest
): Promise<GenerarRecibosMasivosResult> {
  const { data } = await apiClient.post<GenerarRecibosMasivosResult>(
    "/plantillas-cobro/generar-recibos-masivo",
    request
  );
  return data;
}

export interface PreviewConcepto {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  aplicaEnRecibo: number | null;
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

export async function generarPreviewRecibos(
  request: PreviewRecibosRequest
): Promise<PreviewRecibosResponse> {
  const { data } = await apiClient.post<PreviewRecibosResponse>(
    "/plantillas-cobro/preview-recibos",
    request
  );
  return data;
}

export async function obtenerConceptosPago(soloActivos?: boolean): Promise<ConceptoPago[]> {
  const params = new URLSearchParams();
  if (soloActivos !== undefined) {
    params.append("soloActivos", soloActivos.toString());
  }
  const { data } = await apiClient.get<ConceptoPago[]>(`/Conceptos?${params.toString()}`);
  return data.map(concepto => ({
    ...concepto,
    nombre: concepto.descripcion ?? concepto.clave,
  }));
}

export async function obtenerConceptoPorId(id: number): Promise<ConceptoPago> {
  const { data } = await apiClient.get<ConceptoPago>(`/Conceptos/${id}`);
  return data;
}

export async function crearConceptoPago(
  payload: Omit<ConceptoPago, "idConceptoPago" | "status">
): Promise<ConceptoPago> {
  const { data } = await apiClient.post<ConceptoPago>("/Conceptos", payload);
  return data;
}
