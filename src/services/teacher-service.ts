import { PayloadCreateTeacher, PayloadUpdateTeacher, Teacher, TeachersResponse, TeacherScheduleConflict } from "@/types/teacher";

import apiClient from "./api-client";

/**
 * Obtiene lista paginada de profesores por campus
 */
export async function getTeachersList(
  campusId: string | number,
  page?: number,
  pageSize?: number,
): Promise<TeachersResponse> {
  const { data } = await apiClient.get<TeachersResponse>(
    `/Profesor/${campusId}?page=${page ?? 1}&pageSize=${pageSize ?? 20}`,
  );
  return data;
}

/**
 * Obtiene un profesor por ID
 */
export async function getTeacherById(idProfesor: number): Promise<Teacher> {
  const { data } = await apiClient.get<Teacher>(`/Profesor/${idProfesor}`);
  return data;
}

/**
 * Crea un nuevo profesor
 */
export async function createTeacher(payload: PayloadCreateTeacher): Promise<Teacher> {
  const { data } = await apiClient.post<Teacher>(`/Profesor`, payload);
  return data;
}

/**
 * Actualiza un profesor existente
 */
export async function updateTeacher(payload: PayloadUpdateTeacher): Promise<Teacher> {
  const { data } = await apiClient.put<Teacher>(`/Profesor`, payload);
  return data;
}

/**
 * Valida si un profesor tiene conflictos de horario al asignarlo a una materia
 */
export async function validateTeacherSchedule(
  idProfesor: number,
  horarioJson: import("@/types/group").HorarioMateria[],
  idGrupoMateriaActual?: number
): Promise<TeacherScheduleConflict> {
  const { data } = await apiClient.post<TeacherScheduleConflict>(
    `/Profesor/${idProfesor}/validar-horario`,
    { horarioJson, idGrupoMateriaActual }
  );
  return data;
}
