export interface MatterPlan {
  idMateriaPlan: number;
  idPlanEstudios: number;
  nombrePlanEstudios: string;
  idMateria: number;
  materia: string;
  cuatrimestre: number;
  esOptativa: boolean;

  // Campos adicionales que vienen del backend
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
  // Campos opcionales para crear (no requeridos para actualizar)
  nombrePlanEstudios?: string;
  materia?: string;
}
