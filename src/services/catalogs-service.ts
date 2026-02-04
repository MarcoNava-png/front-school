import {
  AcademicPeriod,
  ApplicantStatus,
  CivilStatus,
  ContactMethod,
  EducationLevel,
  Genres,
  Grupo,
  PaymentMethod,
  Periodicity,
  Schedule,
  StudyPlan,
  WeekDay,
} from "@/types/catalog";

import apiClient from "./api-client";

const baseUrlCatalogs: string = "/Catalogos";

export async function getGenresList(): Promise<Genres[]> {
  const { data } = await apiClient.get<Genres[]>(`${baseUrlCatalogs}/Generos`);
  return data;
}

export async function getSchedules(): Promise<Schedule[]> {
  const res = await apiClient.get<Schedule[]>(`${baseUrlCatalogs}/horarios`);
  return res.data;
}

export async function getTurnos(): Promise<Schedule[]> {
  const res = await apiClient.get<Schedule[]>(`${baseUrlCatalogs}/turnos`);
  return res.data;
}

export async function getWeekDays(): Promise<WeekDay[]> {
  const res = await apiClient.get<WeekDay[]>(`${baseUrlCatalogs}/dias-semana`);
  return res.data;
}

export async function getCivilStatus(): Promise<CivilStatus[]> {
  const res = await apiClient.get<CivilStatus[]>(`${baseUrlCatalogs}/estado-civil`);
  return res.data;
}

export async function getApplicantStatus(): Promise<ApplicantStatus[]> {
  const res = await apiClient.get<ApplicantStatus[]>(`${baseUrlCatalogs}/aspirante-status`);
  return res.data;
}

export async function getContactMethods(): Promise<ContactMethod[]> {
  const res = await apiClient.get<ContactMethod[]>(`${baseUrlCatalogs}/medios-contacto`);
  return res.data;
}

export async function getUserRoles(): Promise<string[]> {
  const res = await apiClient.get<string[]>(`${baseUrlCatalogs}/user-roles`);
  return res.data;
}

export async function getEducationLevels(): Promise<EducationLevel[]> {
  const res = await apiClient.get<EducationLevel[]>(`${baseUrlCatalogs}/niveles-educativos`);
  return res.data;
}

export async function getPeriodicity(): Promise<Periodicity[]> {
  const res = await apiClient.get<Periodicity[]>(`${baseUrlCatalogs}/periodicidad`);
  return res.data;
}

export async function getPeriodicityAdmin(): Promise<Periodicity[]> {
  const res = await apiClient.get<Periodicity[]>(`${baseUrlCatalogs}/periodicidad/admin`);
  return res.data;
}

export async function createPeriodicity(data: {
  descPeriodicidad: string;
  periodosPorAnio: number;
  mesesPorPeriodo: number;
}): Promise<Periodicity> {
  const res = await apiClient.post<Periodicity>(`${baseUrlCatalogs}/periodicidad`, data);
  return res.data;
}

export async function togglePeriodicity(id: number): Promise<Periodicity> {
  const res = await apiClient.put<Periodicity>(`${baseUrlCatalogs}/periodicidad/${id}/toggle`);
  return res.data;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await apiClient.get<PaymentMethod[]>(`${baseUrlCatalogs}/medios-pago`);
  return res.data;
}

export async function getAcademicPeriods(): Promise<AcademicPeriod[]> {
  const res = await apiClient.get<AcademicPeriod[]>(`${baseUrlCatalogs}/periodos-academicos`);
  return res.data;
}

export async function getStudyPlans(): Promise<StudyPlan[]> {
  const res = await apiClient.get<StudyPlan[]>(`${baseUrlCatalogs}/planes-estudio`);
  return res.data;
}

export async function getGrupos(idPeriodoAcademico?: number): Promise<Grupo[]> {
  const params = new URLSearchParams();
  params.append("page", "1");
  params.append("pageSize", "1000");
  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }
  const res = await apiClient.get<{ items: Grupo[] }>(`/grupos?${params.toString()}`);
  return res.data.items;
}
