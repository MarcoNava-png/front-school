import {
  BecaEstudiante,
  PayloadActualizarBeca,
  PayloadAsignarBecaCatalogo,
  PayloadCreateBeca,
} from "@/types/receipt";

import apiClient from "./api-client";

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

export async function obtenerBecaPorId(id: number): Promise<BecaEstudiante> {
  const { data } = await apiClient.get<BecaEstudiante>(`/becas/${id}`);
  return data;
}

export async function crearBeca(payload: PayloadCreateBeca): Promise<BecaEstudiante> {
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

export async function asignarBecaDesdeCatalogo(
  payload: PayloadAsignarBecaCatalogo
): Promise<BecaEstudiante> {
  const { data } = await apiClient.post<BecaEstudiante>(
    "/becas/asignar-catalogo",
    payload
  );
  return data;
}

export async function actualizarBeca(
  id: number,
  payload: PayloadActualizarBeca
): Promise<BecaEstudiante> {
  const { data } = await apiClient.put<BecaEstudiante>(`/becas/${id}`, payload);
  return data;
}

export async function desactivarBeca(id: number): Promise<void> {
  await apiClient.delete(`/becas/${id}`);
}

export async function eliminarBeca(id: number): Promise<void> {
  await apiClient.delete(`/becas/${id}`);
}

export async function verificarBecasActivas(
  idEstudiante: number
): Promise<BecaEstudiante[]> {
  const { data } = await apiClient.get<BecaEstudiante[]>(
    `/becas/estudiante/${idEstudiante}?soloActivas=true`
  );
  return data;
}

export async function listarBecasEstudiante(idEstudiante: number): Promise<BecaEstudiante[]> {
  return await obtenerBecasEstudiante(idEstudiante);
}

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
