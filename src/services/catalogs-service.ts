import {
  ApplicantStatus,
  CivilStatus,
  ContactMethod,
  EducationLevel,
  Genres,
  Periodicity,
  Schedule,
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
