export interface MatterPlan {
  idMateriaPlan: number;
  idPlanEstudios: number;
  nombrePlanEstudios: string;
  idMateria: number;
  materia: string;
  cuatrimestre: number;
  esOptativa: boolean;

  claveMateria?: string;
  nombreMateria?: string;
  creditos?: number;
}

export interface PayloadMatterPlan {
  idMateriaPlan: number;
  idPlanEstudios: number;
  idMateria: number;
  cuatrimestre: number;
  esOptativa: boolean;
  nombrePlanEstudios?: string;
  materia?: string;
}
