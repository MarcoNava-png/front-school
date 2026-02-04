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
  createdBy: string;
  usuarioRegistroNombre: string;
  estatusPago?: string;
  estatusDocumentos?: string;
  cuatrimestreInteres?: number;
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
  cuatrimestreInteres?: number;
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

export enum EstatusDocumentoEnum {
  PENDIENTE = 0,
  SUBIDO = 1,
  VALIDADO = 2,
  RECHAZADO = 3,
}

export enum EstatusRecibo {
  PENDIENTE = 0,
  PARCIAL = 1,
  PAGADO = 2,
  VENCIDO = 3,
  CANCELADO = 4,
  BONIFICADO = 5,
}

export interface AspiranteDocumentoDto {
  idAspiranteDocumento: number;
  idDocumentoRequisito: number;
  clave: string;
  descripcion: string;
  estatus: EstatusDocumentoEnum;
  urlArchivo?: string | null;
  notas?: string | null;
}

export interface DocumentoRequisitoDto {
  idDocumentoRequisito: number;
  clave: string;
  descripcion: string;
  esObligatorio: boolean;
  orden: number;
  activo: boolean;
}

export interface ValidarDocumentoRequestDto {
  idAspiranteDocumento: number;
  validar: boolean;
  notas?: string | null;
}

export interface CambiarEstatusDocumentoDto {
  estatus: EstatusDocumentoEnum;
  notas?: string | null;
}

export interface CargarDocumentoFormData {
  idAspirante: number;
  idDocumentoRequisito: number;
  archivo: File;
  notas?: string;
}

export interface ReciboLineaDto {
  idReciboDetalle: number;
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  refTabla?: string | null;
  refId?: number | null;
}

export interface ReciboDto {
  idRecibo: number;
  folio?: string | null;
  idAspirante?: number | null;
  idEstudiante?: number | null;
  idPeriodoAcademico?: number | null;
  fechaEmision: string;
  fechaVencimiento: string;
  estatus: EstatusRecibo;
  subtotal: number;
  descuento: number;
  recargos: number;
  total: number;
  saldo: number;
  notas?: string | null;
  detalles: ReciboLineaDto[];
}

export interface EstadisticasAspirantesDto {
  totalAspirantes: number;
  aspirantesPorEstatus: Record<string, number>;
  aspirantesPorPrograma: Record<string, number>;
  aspirantesPorMedioContacto: Record<string, number>;
  aspirantesConDocumentosPendientes: number;
  aspirantesConPagosPendientes: number;
  aspirantesConDocumentosCompletos: number;
  aspirantesConPagosCompletos: number;
}

export interface DireccionDto {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string | null;
  colonia?: string | null;
  codigoPostal: string;
  municipio: string;
  estado: string;
  pais: string;
}

export interface DatosPersonalesDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  curp?: string | null;
  rfc?: string | null;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  estadoCivil?: string | null;
  nacionalidad?: string | null;
}

export interface DatosContactoDto {
  email: string;
  telefono?: string | null;
  celular?: string | null;
  direccion?: DireccionDto | null;
}

export interface InformacionAcademicaDto {
  clavePlan: string;
  nombrePlan: string;
  rvoe?: string | null;
  duracionAnios: number;
  duracionMeses: number;
  turno: string;
  campus: string;
  nivelEducativo: string;
}

export interface DocumentoDto {
  clave: string;
  descripcion: string;
  esObligatorio: boolean;
  estatus: EstatusDocumentoEnum;
  fechaSubida?: string | null;
  urlArchivo?: string | null;
  notas?: string | null;
}

export interface ConceptoReciboDto {
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ReciboResumenDto {
  idRecibo: number;
  folio: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estatus: EstatusRecibo;
  estatusTexto: string;
  subtotal: number;
  descuento: number;
  recargos: number;
  total: number;
  saldo: number;
  conceptos: ConceptoReciboDto[];
}

export interface InformacionPagosDto {
  totalAPagar: number;
  totalPagado: number;
  saldoPendiente: number;
  recibos: ReciboResumenDto[];
}

export interface AsesorDto {
  id: string;
  nombreCompleto: string;
  email?: string | null;
  telefono?: string | null;
}

export interface BitacoraSeguimientoDto {
  fecha: string;
  usuarioAtiende: string;
  medioContacto: string;
  resumen: string;
  proximaAccion?: string | null;
}

export interface SeguimientoDto {
  asesorAsignado?: AsesorDto | null;
  medioContacto?: string | null;
  bitacora: BitacoraSeguimientoDto[];
}

export interface MetadataGeneracionDto {
  fechaGeneracion: string;
  usuarioGenero?: string | null;
  nombreUsuarioGenero?: string | null;
}

export interface FichaAdmisionDto {
  idAspirante: number;
  folio: string;
  fechaRegistro: string;
  estatusActual: string;
  observaciones?: string | null;
  datosPersonales: DatosPersonalesDto;
  datosContacto: DatosContactoDto;
  informacionAcademica: InformacionAcademicaDto;
  documentos: DocumentoDto[];
  informacionPagos: InformacionPagosDto;
  seguimiento: SeguimientoDto;
  metadata: MetadataGeneracionDto;
}

export interface DocumentoValidacionDto {
  descripcion: string;
  esObligatorio: boolean;
  estatus: EstatusDocumentoEnum;
  cumple: boolean;
}

export interface ValidacionesInscripcionDto {
  documentosCompletos: boolean;
  pagoInscripcion: boolean;
  estatusValido: boolean;
  advertencias: string[];
  detalleDocumentos: DocumentoValidacionDto[];
}

export interface CredencialesAccesoDto {
  usuario: string;
  passwordTemporal: string;
  urlAcceso: string;
  mensaje: string;
}

export interface ReciboGeneradoDto {
  idRecibo: number;
  folio: string;
  concepto: string;
  total: number;
  fechaVencimiento: string;
}

export interface InscripcionAspiranteResultDto {
  idAspirante: number;
  nombreCompleto: string;
  nuevoEstatusAspirante: string;
  idEstudiante: number;
  matricula: string;
  email: string;
  fechaIngreso: string;
  planEstudios: string;
  credenciales: CredencialesAccesoDto;
  recibosGenerados: ReciboGeneradoDto[];
  validaciones: ValidacionesInscripcionDto;
  fechaProceso: string;
  usuarioQueProceso?: string | null;
  inscripcionForzada: boolean;
}

export interface InscribirAspiranteRequest {
  idPeriodoAcademico?: number | null;
  forzarInscripcion?: boolean;
  observaciones?: string | null;
}

export interface CancelarAspiranteRequest {
  motivo: string;
}

export interface RecalcularDescuentosResult {
  recibosActualizados: number;
  descuentoTotalAplicado: number;
  detalle: ReciboDescuentoResumen[];
}

export interface ReciboDescuentoResumen {
  idRecibo: number;
  folio: string | null;
  subtotalOriginal: number;
  descuentoAnterior: number;
  descuentoNuevo: number;
  saldoNuevo: number;
}

export interface PlantillaCobroAspirante {
  idPlantillaCobro: number;
  nombrePlantilla: string;
  idPlanEstudios: number;
  numeroCuatrimestre: number;
  idPeriodoAcademico?: number | null;
  idTurno?: number | null;
  idModalidad?: number | null;
  version: number;
  esActiva: boolean;
  fechaVigenciaInicio: string;
  fechaVigenciaFin?: string | null;
  estrategiaEmision: number;
  numeroRecibos: number;
  diaVencimiento: number;
  nombrePlanEstudios?: string | null;
  nombrePeriodo?: string | null;
  nombreTurno?: string | null;
  nombreModalidad?: string | null;
  totalConceptos?: number | null;
  detalles?: PlantillaCobroDetalleAspirante[];
}

export interface PlantillaCobroDetalleAspirante {
  idPlantillaDetalle: number;
  idPlantillaCobro: number;
  idConceptoPago: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  orden: number;
  aplicaEnRecibo?: number | null;
  nombreConcepto?: string | null;
  claveConcepto?: string | null;
  importe: number;
}
