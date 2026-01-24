/**
 * Tipos de beneficio disponibles para convenios
 */
export type TipoBeneficio = "PORCENTAJE" | "MONTO" | "EXENCION";

/**
 * A qué tipo de pago aplica el convenio
 */
export type AplicaA = "INSCRIPCION" | "COLEGIATURA" | "TODOS";

/**
 * Estatus de un convenio asignado a un aspirante
 */
export type EstatusConvenioAspirante = "Pendiente" | "Aprobado" | "Rechazado";

/**
 * Convenio completo con sus alcances
 */
export interface ConvenioDto {
  idConvenio: number;
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct: number | null;
  monto: number | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
  aplicaA: AplicaA; // "INSCRIPCION" | "COLEGIATURA" | "TODOS"
  maxAplicaciones: number | null; // null = ilimitado
  activo: boolean;
  alcances: ConvenioAlcanceDto[];
  aspirantesAsignados: number;
}

/**
 * Alcance de un convenio (campus/plan de estudios donde aplica)
 */
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

/**
 * Payload para crear un nuevo convenio
 */
export interface CrearConvenioDto {
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct?: number | null;
  monto?: number | null;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
  aplicaA?: AplicaA; // "INSCRIPCION" | "COLEGIATURA" | "TODOS" (default: TODOS)
  maxAplicaciones?: number | null; // null = ilimitado, 1 = una vez, n = n veces
  activo?: boolean;
  alcances?: CrearConvenioAlcanceDto[];
}

/**
 * Payload para crear alcance de convenio
 */
export interface CrearConvenioAlcanceDto {
  idCampus?: number | null;
  idPlanEstudios?: number | null;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
}

/**
 * Payload para actualizar un convenio
 */
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

/**
 * Payload para asignar convenio a un aspirante
 */
export interface AsignarConvenioAspiranteDto {
  idAspirante: number;
  idConvenio: number;
  evidencia?: string | null;
}

/**
 * Convenio asignado a un aspirante
 */
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
  aplicaA: AplicaA | null; // A qué tipo de pago aplica
  maxAplicaciones: number | null; // Límite de aplicaciones (null = ilimitado)
  vecesAplicado: number; // Cuántas veces se ha usado
  puedeAplicarse: boolean; // true si aún puede usarse
}

/**
 * Convenio disponible para asignar a un aspirante
 */
export interface ConvenioDisponibleDto {
  idConvenio: number;
  claveConvenio: string;
  nombre: string;
  tipoBeneficio: TipoBeneficio;
  descuentoPct: number | null;
  monto: number | null;
  descripcionBeneficio: string;
  aplicaA: AplicaA; // A qué tipo de pago aplica
  maxAplicaciones: number | null; // Límite de aplicaciones (null = ilimitado)
}

/**
 * Resultado del calculo de descuento de un convenio
 */
export interface CalculoDescuentoConvenioDto {
  idConvenio: number;
  nombreConvenio: string;
  tipoBeneficio: TipoBeneficio;
  montoOriginal: number;
  descuento: number;
  montoFinal: number;
}

/**
 * Calculo de descuento total de un aspirante
 */
export interface CalculoDescuentoTotalDto {
  montoOriginal: number;
  descuento: number;
  montoFinal: number;
}
