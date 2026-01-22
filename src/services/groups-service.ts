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

// ============================================================================
// GRUPOS
// ============================================================================

/**
 * Obtiene lista paginada de grupos
 */
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

/**
 * Busca grupos por codigo (ej: "111", "122", "512")
 */
export async function getGroupByCode(codigoGrupo: string): Promise<Group> {
  const { data } = await apiClient.get<Group>(`/grupos/codigo/${codigoGrupo}`);
  return data;
}

/**
 * Busca grupos por criterios
 */
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

// ============================================================================
// INSCRIPCION A GRUPO
// ============================================================================

/**
 * Inscribe un estudiante a TODAS las materias de un grupo
 */
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

// ============================================================================
// ESTUDIANTES EN GRUPO
// ============================================================================

/**
 * Obtiene todos los estudiantes inscritos en un grupo
 */
export async function getStudentsInGroup(idGrupo: number): Promise<StudentsInGroup> {
  const { data } = await apiClient.get<StudentsInGroup>(`/grupos/${idGrupo}/estudiantes`);
  return data;
}

/**
 * Obtiene estudiantes inscritos en un grupo-materia especifico
 */
export async function getStudentsByGroupSubject(idGrupoMateria: number): Promise<StudentInGroup[]> {
  const { data } = await apiClient.get<StudentInGroup[]>(`/grupos/gruposmaterias/${idGrupoMateria}/estudiantes`);
  return data;
}

// ============================================================================
// GESTIÓN ACADÉMICA DE GRUPOS
// ============================================================================

/**
 * Obtiene la gestión académica de un plan de estudios
 * Muestra todos los grupos organizados por cuatrimestre
 */
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

/**
 * Crea un grupo con materias automáticas
 */
export async function createGroupWithSubjects(
  request: CreateGroupWithSubjectsRequest,
): Promise<CreateGroupWithSubjectsResponse> {
  const { data } = await apiClient.post<CreateGroupWithSubjectsResponse>("/grupos/con-materias", request);
  return data;
}

/**
 * Obtiene las materias de un grupo
 */
export async function getGroupSubjects(idGrupo: number): Promise<GrupoMateria[]> {
  const { data } = await apiClient.get<GrupoMateria[]>(`/grupos/${idGrupo}/materias`);
  return data;
}

/**
 * Agrega una materia a un grupo
 */
export async function addSubjectToGroup(idGrupo: number, request: AddSubjectToGroupRequest): Promise<GrupoMateria> {
  const { data } = await apiClient.post<GrupoMateria>(`/grupos/${idGrupo}/materias`, request);
  return data;
}

/**
 * Obtiene los detalles de una materia específica de un grupo (incluyendo horario)
 */
export async function getGrupoMateriaById(idGrupoMateria: number): Promise<GrupoMateria> {
  const { data } = await apiClient.get<GrupoMateria>(`/grupos/materias/${idGrupoMateria}`);
  return data;
}

/**
 * Elimina una materia de un grupo
 */
export async function removeSubjectFromGroup(idGrupoMateria: number): Promise<void> {
  await apiClient.delete(`/grupos/materias/${idGrupoMateria}`);
}

/**
 * Promueve estudiantes al siguiente cuatrimestre
 */
export async function promoteStudents(request: PromocionRequest): Promise<PromocionResponse> {
  const { data } = await apiClient.post<PromocionResponse>("/grupos/promocion", request);
  return data;
}

/**
 * Elimina un grupo
 */
export async function deleteGroup(idGrupo: number): Promise<void> {
  await apiClient.delete(`/grupos/${idGrupo}`);
}

/**
 * Actualiza los horarios de una materia en un grupo
 */
export async function updateSubjectSchedule(idGrupoMateria: number, horarioJson: import("@/types/group").HorarioMateria[]): Promise<void> {
  await apiClient.put(`/grupos/materias/${idGrupoMateria}/horarios`, { horarioJson });
}

/**
 * Asigna o actualiza el profesor de una materia en un grupo
 */
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

// ============================================================================
// INSCRIPCIÓN DIRECTA A GRUPOS (SIN MATERIAS)
// Para gestión administrativa/financiera
// ============================================================================

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

/**
 * Inscribe un estudiante directamente a un grupo (sin necesidad de materias)
 * Útil para gestión administrativa y financiera
 */
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

/**
 * Inscribe múltiples estudiantes a un grupo de forma masiva (sin necesidad de materias)
 */
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

/**
 * Obtiene los estudiantes inscritos directamente en un grupo (tabla EstudianteGrupo)
 */
export async function getEstudiantesDelGrupoDirecto(
  idGrupo: number
): Promise<EstudiantesDelGrupoResponse> {
  const { data } = await apiClient.get<EstudiantesDelGrupoResponse>(
    `/grupos/${idGrupo}/estudiantes-directo`
  );
  return data;
}

/**
 * Elimina la inscripción de un estudiante del grupo
 */
export async function eliminarEstudianteDeGrupo(
  idEstudianteGrupo: number
): Promise<void> {
  await apiClient.delete(`/grupos/estudiante-grupo/${idEstudianteGrupo}`);
}

// ============================================================================
// IMPORTACIÓN COMPLETA DE ESTUDIANTES (Persona + Estudiante + Inscripción)
// ============================================================================

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

/**
 * Importa estudiantes desde Excel creando Persona, Estudiante e inscribiéndolos al grupo.
 * Flujo completo: Persona → Estudiante (con matrícula autogenerada) → EstudianteGrupo
 */
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
