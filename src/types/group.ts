import { PaginatedResponse } from "@/types/paginated-response";

export interface Group {
  idGrupo: number;
  idPlanEstudios: number;
  planEstudios: string;
  periodoAcademico: string;
  consecutivoPeriodicidad: number;
  numeroGrupo: number;
  turno: string;
  capacidadMaxima: number;
  grupoMateria: Array<any>;
}

export interface PayloadCreateGroup {
  idPlanEstudios: number;
  idPeriodoAcademico: number;
  numeroCuatrimestre: number;
  numeroGrupo: number;
  idTurno: number;
  capacidadMaxima: number;
}

export interface PayloadUpdateGroup extends PayloadCreateGroup {
  idGrupo: number;
  status: number;
}

export interface PayloadAddMatters {
  idGrupo: number;
  grupoMaterias: Array<{
    idMateriaPlan: number;
    idProfesor: number;
    aula: string;
    cupo: number;
  }>;
}

export type GroupsResponse = PaginatedResponse<Group>;
