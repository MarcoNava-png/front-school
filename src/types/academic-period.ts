import { PaginatedResponse } from "./paginated-response";

export interface AcademicPeriod {
  idPeriodoAcademico: number;
  clave: string;
  nombre: string;
  periodicidad: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface PayloadCreateAcademicPeriod {
  clave: string;
  nombre: string;
  idPeriodicidad: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface PayloadUpdateAcademicPeriod extends PayloadCreateAcademicPeriod {
  idPeriodoAcademico: number;
  status: number;
}

export type AcademicPeriodsResponse = PaginatedResponse<AcademicPeriod>;
