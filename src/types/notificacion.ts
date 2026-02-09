import { PaginatedResponse } from "./paginated-response";

export interface NotificacionUsuario {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: "info" | "warning" | "success" | "error";
  modulo: string | null;
  urlAccion: string | null;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura: string | null;
}

export type NotificacionesResponse = PaginatedResponse<NotificacionUsuario>;

export const TIPO_NOTIFICACION_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};
