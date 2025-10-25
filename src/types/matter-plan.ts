export interface MatterPlan {
  idMateriaPlan: number;
  idPlanEstudios: number;
  nombrePlanEstudios: string;
  idMateria: number;
  materia: string;
  cuatrimestre: number;
  esOptativa: boolean;
}

export interface PayloadMatterPlan {
  idMateriaPlan: number;
  idPlanEstudios: number;
  nombrePlanEstudios: string;
  idMateria: number;
  materia: string;
  cuatrimestre: number;
  esOptativa: true;
}
