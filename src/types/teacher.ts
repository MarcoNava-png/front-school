import { PaginatedResponse } from "./paginated-response";

export interface Teacher {
  idProfesor: number;
  noEmpleado: string;
  nombreCompleto: string;
  emailInstitucional: string;
}

export interface PayloadCreateTeacher {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  generoId: number;
  correo: string;
  telefono: string;
  curp: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  codigoPostalId: number;
  idEstadoCivil: number;
  noEmpleado: string;
  rfc: string;
  emailInstitucional: string;
  campusId: number;
}

export interface PayloadUpdateTeacher extends PayloadCreateTeacher {
  idProfesor: number;
  status: number;
}

export type TeachersResponse = PaginatedResponse<Teacher>;
