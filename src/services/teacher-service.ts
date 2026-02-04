import { PayloadCreateTeacher, PayloadUpdateTeacher, Teacher, TeachersResponse, TeacherScheduleConflict } from "@/types/teacher";

import apiClient from "./api-client";

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

export async function getTeacherById(idProfesor: number): Promise<Teacher> {
  const { data } = await apiClient.get<Teacher>(`/Profesor/${idProfesor}`);
  return data;
}

export async function createTeacher(payload: PayloadCreateTeacher): Promise<Teacher> {
  const { data } = await apiClient.post<Teacher>(`/Profesor`, payload);
  return data;
}

export async function updateTeacher(payload: PayloadUpdateTeacher): Promise<Teacher> {
  const { data } = await apiClient.put<Teacher>(`/Profesor`, payload);
  return data;
}

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
