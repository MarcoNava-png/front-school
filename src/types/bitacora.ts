import { PaginatedResponse } from "./paginated-response";

export interface BitacoraAccion {
  idBitacora: number;
  usuarioId: string;
  nombreUsuario: string;
  accion: string;
  modulo: string;
  entidad: string;
  entidadId: string | null;
  descripcion: string | null;
  datosAnteriores: string | null;
  datosNuevos: string | null;
  ipAddress: string | null;
  fechaUtc: string;
}

export interface BitacoraFiltros {
  modulo?: string;
  usuario?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

export type BitacoraResponse = PaginatedResponse<BitacoraAccion>;

export const MODULOS_BITACORA = [
  { value: "", label: "Todos" },
  { value: "Admisiones", label: "Admisiones" },
  { value: "Documentos", label: "Documentos" },
  { value: "Estudiantes", label: "Estudiantes" },
  { value: "Academico", label: "Academico" },
  { value: "Pagos", label: "Pagos" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Inscripciones", label: "Inscripciones" },
  { value: "Calificaciones", label: "Calificaciones" },
  { value: "Catalogos", label: "Catalogos" },
  { value: "Configuracion", label: "Configuracion" },
  { value: "Autenticacion", label: "Autenticacion" },
] as const;

export const MODULO_COLORS: Record<string, string> = {
  Admisiones: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Documentos: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Estudiantes: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Academico: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Pagos: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Finanzas: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Inscripciones: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Calificaciones: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Catalogos: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  Configuracion: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  Autenticacion: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  General: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};
