import { PaginatedResponse } from "./paginated-response";

export interface StudyPlan {
  idPlanEstudios: number;
  clavePlanEstudios: string;
  nombrePlanEstudios: string;
  rvoe: string;
  permiteAdelantar: boolean;
  version: string;
  duracionMeses: number;
  minimaAprobatoriaParcial: number;
  minimaAprobatoriaFinal: number;
  periodicidad: string;
  idPeriodicidad: number;
  idNivelEducativo: number;
  idCampus: number;
  nombreCampus?: string;
  activo: boolean;
}

export interface PayloadCreateStudyPlan {
  clavePlanEstudios: string;
  nombrePlanEstudios: string;
  rvoe: string;
  permiteAdelantar: boolean;
  version: string;
  duracionMeses: number;
  minimaAprobatoriaParcial: number;
  minimaAprobatoriaFinal: number;
  idPeriodicidad: number;
  idNivelEducativo: number;
  idCampus: number;
}

export interface PayloadUpdateStudyPlan extends PayloadCreateStudyPlan {
  idPlanEstudios: number;
  status: number;
}

export type StudyPlansResponse = PaginatedResponse<StudyPlan>;
