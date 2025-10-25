import { PaginatedResponse } from "./paginated-response";

export interface Student {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  telefono: string | null;
  planEstudios: string;
}

export interface StudentDetails extends Student {
  materias: string[];
}

export interface PayloadCreateStudent {
  matricula: string;
  idPersona: number;
  fechaIngreso: string;
  idPlanActual: number;
  activo: boolean;
}

export type StudentsResponse = PaginatedResponse<Student>;
