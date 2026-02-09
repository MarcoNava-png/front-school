import type { NotificacionesResponse } from "@/types/notificacion";

import apiClient from "./api-client";

export async function getNotificaciones(
  soloNoLeidas: boolean = false,
  page: number = 1,
  pageSize: number = 20,
): Promise<NotificacionesResponse> {
  const params = new URLSearchParams();
  params.append("soloNoLeidas", soloNoLeidas.toString());
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  const { data } = await apiClient.get<NotificacionesResponse>(`/NotificacionUsuario?${params.toString()}`);
  return data;
}

export async function getNotificacionesNoLeidas(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/NotificacionUsuario/no-leidas");
  return data.count;
}

export async function marcarLeida(idNotificacion: number): Promise<void> {
  await apiClient.put(`/NotificacionUsuario/${idNotificacion}/leer`);
}

export async function marcarTodasLeidas(): Promise<void> {
  await apiClient.put("/NotificacionUsuario/leer-todas");
}
