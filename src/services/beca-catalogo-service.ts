import {
  ActualizarBecaCatalogoPayload,
  BecaCatalogo,
  CrearBecaCatalogoPayload,
} from "@/types/receipt";

import apiClient from "./api-client";

export async function obtenerCatalogoBecas(
  soloActivas?: boolean
): Promise<BecaCatalogo[]> {
  const params = new URLSearchParams();
  if (soloActivas !== undefined) {
    params.append("soloActivas", soloActivas.toString());
  }

  const { data } = await apiClient.get<BecaCatalogo[]>(
    `/becas/catalogo?${params.toString()}`
  );
  return data;
}

export async function obtenerBecaCatalogoPorId(
  idBeca: number
): Promise<BecaCatalogo> {
  const { data } = await apiClient.get<BecaCatalogo>(`/becas/catalogo/${idBeca}`);
  return data;
}

export async function crearBecaCatalogo(
  payload: CrearBecaCatalogoPayload
): Promise<BecaCatalogo> {
  const { data } = await apiClient.post<BecaCatalogo>("/becas/catalogo", payload);
  return data;
}

export async function actualizarBecaCatalogo(
  idBeca: number,
  payload: ActualizarBecaCatalogoPayload
): Promise<BecaCatalogo> {
  const { data } = await apiClient.put<BecaCatalogo>(
    `/becas/catalogo/${idBeca}`,
    payload
  );
  return data;
}

export async function desactivarBecaCatalogo(idBeca: number): Promise<void> {
  await apiClient.patch(`/becas/catalogo/${idBeca}/desactivar`);
}

export async function activarBecaCatalogo(idBeca: number): Promise<void> {
  await apiClient.patch(`/becas/catalogo/${idBeca}/activar`);
}
