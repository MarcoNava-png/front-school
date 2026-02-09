import type { BitacoraFiltros, BitacoraResponse } from "@/types/bitacora";

import apiClient from "./api-client";

export async function getBitacora(filtros: BitacoraFiltros = {}): Promise<BitacoraResponse> {
  const params = new URLSearchParams();
  if (filtros.modulo) params.append("modulo", filtros.modulo);
  if (filtros.usuario) params.append("usuario", filtros.usuario);
  if (filtros.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
  if (filtros.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);
  if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
  params.append("page", (filtros.page ?? 1).toString());
  params.append("pageSize", (filtros.pageSize ?? 20).toString());

  const { data } = await apiClient.get<BitacoraResponse>(`/BitacoraAccion?${params.toString()}`);
  return data;
}
