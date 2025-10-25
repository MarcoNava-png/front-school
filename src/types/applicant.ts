import { PaginatedResponse } from "./paginated-response";

export interface Applicant {
  idAspirante: number;
  personaId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  aspiranteEstatus: string;
  fechaRegistro: string;
  planEstudios: string;
  idDireccion: number;
  codigoPostalId: number;
  municipioId: number;
  estadoId: number;
  usuarioAtiendeNombre: string;
  idAtendidoPorUsuario: string;
}

export interface PayloadCreateApplicant {
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
  campusId: number;
  planEstudiosId: number;
  aspiranteStatusId: number;
  medioContactoId: number;
  notas: string;
  atendidoPorUsuarioId: string;
  horarioId: number;
  stateId?: string;
  municipalityId?: string;
  townshipId?: number;
}

export interface PayloadUpdateApplicant {
  aspiranteId: number;
}

export interface TrackingLog {
  id: number;
  usuarioAtiendeId: string;
  usuarioAtiendeNombre: string;
  fecha: string;
  medioContacto: string;
  resumen: string;
  proximaAccion: string;
}

export interface PayloadTrackingLog {
  aspiranteId: number;
  usuarioAtiendeId: string;
  fecha: string;
  medioContacto: string;
  resumen: string;
  proximaAccion: string;
}

export type ApplicantsResponse = PaginatedResponse<Applicant>;
