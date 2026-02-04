import {
  AddSubjectToGroupRequest,
  CreateGroupWithSubjectsRequest,
  CreateGroupWithSubjectsResponse,
  EnrollStudentInGroupRequest,
  GestionAcademicaResponse,
  Group,
  GroupEnrollmentResult,
  GrupoMateria,
  GroupsResponse,
  PromocionRequest,
  PromocionResponse,
  StudentInGroup,
  StudentsInGroup,
} from "@/types/group";

import apiClient from "./api-client";

export async function getGroups(
  page = 1,
  pageSize = 20,
  idPeriodoAcademico?: number,
): Promise<GroupsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const { data } = await apiClient.get<GroupsResponse>(`/grupos?${params.toString()}`);
  return data;
}

export async function getGroupByCode(codigoGrupo: string): Promise<Group> {
  const { data } = await apiClient.get<Group>(`/grupos/codigo/${codigoGrupo}`);
  return data;
}

export async function searchGroups(filters: {
  numeroCuatrimestre?: number;
  idTurno?: number;
  numeroGrupo?: number;
  idPlanEstudios?: number;
}): Promise<Group[]> {
  const params = new URLSearchParams();
  if (filters.numeroCuatrimestre) params.append("numeroCuatrimestre", filters.numeroCuatrimestre.toString());
  if (filters.idTurno) params.append("idTurno", filters.idTurno.toString());
  if (filters.numeroGrupo) params.append("numeroGrupo", filters.numeroGrupo.toString());
  if (filters.idPlanEstudios) params.append("idPlanEstudios", filters.idPlanEstudios.toString());

  const { data } = await apiClient.get<Group[]>(`/grupos/buscar?${params.toString()}`);
  return data;
}

export async function enrollStudentInGroup(
  idGrupo: number,
  request: EnrollStudentInGroupRequest,
): Promise<GroupEnrollmentResult> {
  const { data } = await apiClient.post<GroupEnrollmentResult>(
    `/grupos/${idGrupo}/inscribir-estudiante`,
    request,
  );
  return data;
}

export async function getStudentsInGroup(idGrupo: number): Promise<StudentsInGroup> {
  const { data } = await apiClient.get<StudentsInGroup>(`/grupos/${idGrupo}/estudiantes`);
  return data;
}

export async function getStudentsByGroupSubject(idGrupoMateria: number): Promise<StudentInGroup[]> {
  const { data } = await apiClient.get<StudentInGroup[]>(`/grupos/gruposmaterias/${idGrupoMateria}/estudiantes`);
  return data;
}

export async function getAcademicManagement(
  idPlanEstudios: number,
  idPeriodoAcademico?: number,
): Promise<GestionAcademicaResponse> {
  const params = new URLSearchParams();
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const { data } = await apiClient.get<GestionAcademicaResponse>(
    `/grupos/plan/${idPlanEstudios}?${params.toString()}`,
  );
  return data;
}

export async function createGroupWithSubjects(
  request: CreateGroupWithSubjectsRequest,
): Promise<CreateGroupWithSubjectsResponse> {
  const { data } = await apiClient.post<CreateGroupWithSubjectsResponse>("/grupos/con-materias", request);
  return data;
}

export async function getGroupSubjects(idGrupo: number): Promise<GrupoMateria[]> {
  const { data } = await apiClient.get<GrupoMateria[]>(`/grupos/${idGrupo}/materias`);
  return data;
}

export async function addSubjectToGroup(idGrupo: number, request: AddSubjectToGroupRequest): Promise<GrupoMateria> {
  const { data } = await apiClient.post<GrupoMateria>(`/grupos/${idGrupo}/materias`, request);
  return data;
}

export async function getGrupoMateriaById(idGrupoMateria: number): Promise<GrupoMateria> {
  const { data } = await apiClient.get<GrupoMateria>(`/grupos/materias/${idGrupoMateria}`);
  return data;
}

export async function removeSubjectFromGroup(idGrupoMateria: number): Promise<void> {
  await apiClient.delete(`/grupos/materias/${idGrupoMateria}`);
}

export async function promoteStudents(request: PromocionRequest): Promise<PromocionResponse> {
  const { data } = await apiClient.post<PromocionResponse>("/grupos/promocion", request);
  return data;
}

export interface PreviewPromocionRequest {
  idGrupoActual: number;
  idPeriodoAcademicoDestino: number;
}

export interface EstudiantePreview {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  esElegible: boolean;
  motivoNoElegible: string;
  tienePagosPendientes: boolean;
  saldoPendiente: number;
  recibosPendientes: number;
  seleccionado: boolean;
}

export interface PreviewPromocionResult {
  idGrupoOrigen: number;
  grupoOrigen: string;
  codigoGrupoOrigen: string;
  cuatrimestreOrigen: number;
  planEstudios: string;
  turno: string;
  idGrupoDestino?: number;
  grupoDestino?: string;
  codigoGrupoDestino?: string;
  cuatrimestreDestino: number;
  grupoDestinoExiste: boolean;
  periodoDestino: string;
  totalEstudiantes: number;
  estudiantesElegibles: number;
  estudiantesConPagosPendientes: number;
  totalSaldoPendiente: number;
  estudiantes: EstudiantePreview[];
}

export async function previewPromocion(request: PreviewPromocionRequest): Promise<PreviewPromocionResult> {
  const { data } = await apiClient.post<PreviewPromocionResult>("/grupos/promocion/preview", request);
  return data;
}

export interface ExecutePromocionRequest {
  idGrupoActual: number;
  idPeriodoAcademicoDestino: number;
  crearGrupoSiguienteAutomaticamente?: boolean;
  promedioMinimoPromocion?: number;
  promoverTodos?: boolean;
  validarPagos?: boolean;
  estudiantesExcluidos?: number[];
}

export interface PromocionResultado {
  idGrupoOrigen: number;
  grupoOrigen: string;
  cuatrimestreOrigen: number;
  idGrupoDestino: number;
  grupoDestino: string;
  cuatrimestreDestino: number;
  totalEstudiantesPromovidos: number;
  totalEstudiantesNoPromovidos: number;
  estudiantes: EstudiantePromocionResultado[];
  mensaje: string;
}

export interface EstudiantePromocionResultado {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  fuePromovido: boolean;
  motivo: string;
  promedioGeneral?: number;
  materiasReprobadas: number;
  tienePagosPendientes: boolean;
  saldoPendiente: number;
  recibosPendientes: number;
}

export async function executePromocion(request: ExecutePromocionRequest): Promise<PromocionResultado> {
  const { data } = await apiClient.post<PromocionResultado>("/grupos/promocion", request);
  return data;
}

export async function deleteGroup(idGrupo: number): Promise<void> {
  await apiClient.delete(`/grupos/${idGrupo}`);
}

export async function updateSubjectSchedule(idGrupoMateria: number, horarioJson: import("@/types/group").HorarioMateria[]): Promise<void> {
  await apiClient.put(`/grupos/materias/${idGrupoMateria}/horarios`, { horarioJson });
}

export async function assignTeacherToSubject(
  idGrupoMateria: number,
  idProfesor: number | null
): Promise<GrupoMateria> {
  const { data } = await apiClient.put<GrupoMateria>(
    `/grupos/materias/${idGrupoMateria}/profesor`,
    { idProfesor }
  );
  return data;
}

export interface EstudianteGrupoResult {
  idEstudianteGrupo: number;
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  idGrupo: number;
  nombreGrupo: string;
  fechaInscripcion: string;
  estado: string;
  exitoso: boolean;
  mensajeError?: string;
}

export interface InscribirEstudiantesGrupoResponse {
  idGrupo: number;
  nombreGrupo: string;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  resultados: EstudianteGrupoResult[];
}

export interface EstudianteEnGrupo {
  idEstudianteGrupo: number;
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  fechaInscripcion: string;
  estado: string;
  planEstudios?: string;
}

export interface EstudiantesDelGrupoResponse {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo?: string;
  planEstudios: string;
  periodoAcademico: string;
  numeroCuatrimestre: number;
  totalEstudiantes: number;
  capacidadMaxima: number;
  cupoDisponible: number;
  estudiantes: EstudianteEnGrupo[];
}

export async function inscribirEstudianteDirecto(
  idGrupo: number,
  idEstudiante: number,
  observaciones?: string
): Promise<EstudianteGrupoResult> {
  const { data } = await apiClient.post<EstudianteGrupoResult>(
    `/grupos/${idGrupo}/inscribir-directo`,
    { idEstudiante, observaciones }
  );
  return data;
}

export async function inscribirEstudiantesMasivo(
  idGrupo: number,
  idsEstudiantes: number[],
  observaciones?: string
): Promise<InscribirEstudiantesGrupoResponse> {
  const { data } = await apiClient.post<InscribirEstudiantesGrupoResponse>(
    `/grupos/${idGrupo}/inscribir-masivo`,
    { idsEstudiantes, observaciones }
  );
  return data;
}

export async function getEstudiantesDelGrupoDirecto(
  idGrupo: number
): Promise<EstudiantesDelGrupoResponse> {
  const { data } = await apiClient.get<EstudiantesDelGrupoResponse>(
    `/grupos/${idGrupo}/estudiantes-directo`
  );
  return data;
}

export async function eliminarEstudianteDeGrupo(
  idEstudianteGrupo: number
): Promise<void> {
  await apiClient.delete(`/grupos/estudiante-grupo/${idEstudianteGrupo}`);
}

export interface EstudianteImportar {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp?: string;
  correo?: string;
  telefono?: string;
  celular?: string;
  fechaNacimiento?: string;
  idGenero?: number;
  matricula?: string;
}

export interface EstudianteImportadoResult {
  fila: number;
  nombreCompleto: string;
  curp?: string;
  correo?: string;
  exitoso: boolean;
  mensajeError?: string;
  idPersona?: number;
  idEstudiante?: number;
  matriculaGenerada?: string;
  idEstudianteGrupo?: number;
}

export interface ImportarEstudiantesGrupoResponse {
  idGrupo: number;
  nombreGrupo: string;
  planEstudios: string;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  personasCreadas: number;
  estudiantesCreados: number;
  inscripcionesCreadas: number;
  resultados: EstudianteImportadoResult[];
}

export async function importarEstudiantesCompleto(
  idGrupo: number,
  estudiantes: EstudianteImportar[],
  observaciones?: string
): Promise<ImportarEstudiantesGrupoResponse> {
  const { data } = await apiClient.post<ImportarEstudiantesGrupoResponse>(
    `/grupos/${idGrupo}/importar-estudiantes`,
    { idGrupo, estudiantes, observaciones }
  );
  return data;
}
