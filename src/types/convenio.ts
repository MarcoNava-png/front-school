export type TipoBeneficio = "PORCENTAJE" | "MONTO" | "EXENCION";

export type AplicaA = "INSCRIPCION" | "COLEGIATURA" | "TODOS";

export type EstatusConvenioAspirante = "Pendiente" | "Aprobado" | "Rechazado";

export interface ConvenioDto {
  idConvenio: number;
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct: number | null;
  monto: number | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
  aplicaA: AplicaA;
  maxAplicaciones: number | null;
  activo: boolean;
  alcances: ConvenioAlcanceDto[];
  aspirantesAsignados: number;
}

export interface ConvenioAlcanceDto {
  idConvenioAlcance: number;
  idConvenio: number;
  idCampus: number | null;
  nombreCampus: string | null;
  idPlanEstudios: number | null;
  nombrePlanEstudios: string | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
}

export interface CrearConvenioDto {
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct?: number | null;
  monto?: number | null;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
  aplicaA?: AplicaA;
  maxAplicaciones?: number | null;
  activo?: boolean;
  alcances?: CrearConvenioAlcanceDto[];
}

export interface CrearConvenioAlcanceDto {
  idCampus?: number | null;
  idPlanEstudios?: number | null;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
}

export interface ActualizarConvenioDto {
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct?: number | null;
  monto?: number | null;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
  aplicaA?: AplicaA;
  maxAplicaciones?: number | null;
  activo: boolean;
  alcances?: CrearConvenioAlcanceDto[];
}

export interface AsignarConvenioAspiranteDto {
  idAspirante: number;
  idConvenio: number;
  evidencia?: string | null;
}

export interface AspiranteConvenioDto {
  idAspiranteConvenio: number;
  idAspirante: number;
  nombreAspirante: string | null;
  idConvenio: number;
  claveConvenio: string | null;
  nombreConvenio: string | null;
  tipoBeneficio: TipoBeneficio | null;
  descuentoPct: number | null;
  monto: number | null;
  fechaAsignacion: string;
  estatus: EstatusConvenioAspirante;
  evidencia: string | null;
  aplicaA: AplicaA | null;
  maxAplicaciones: number | null;
  vecesAplicado: number;
  puedeAplicarse: boolean;
}

export interface ConvenioDisponibleDto {
  idConvenio: number;
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct: number | null;
  monto: number | null;
  descripcionBeneficio: string;
  aplicaA: AplicaA;
  maxAplicaciones: number | null;
}

export interface CalculoDescuentoConvenioDto {
  idConvenio: number;
  nombreConvenio: string;
  tipoBeneficio: TipoBeneficio;
  montoOriginal: number;
  descuento: number;
  montoFinal: number;
}

export interface CalculoDescuentoTotalDto {
  montoOriginal: number;
  descuento: number;
  montoFinal: number;
}
