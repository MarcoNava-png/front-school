import { PaginatedResponse } from "./paginated-response";

export interface Student {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  telefono: string | null;
  planEstudios: string;
}

export type StudentsResponse = PaginatedResponse<Student>;
