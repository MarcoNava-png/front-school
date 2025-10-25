import {
  Applicant,
  ApplicantsResponse,
  PayloadCreateApplicant,
  PayloadTrackingLog,
  PayloadUpdateApplicant,
  TrackingLog,
} from "@/types/applicant";

import apiClient from "./api-client";

export async function getApplicantsList(
  page?: number,
  pageSize?: number,
  filter?: string,
): Promise<ApplicantsResponse> {
  const { data } = await apiClient.get<ApplicantsResponse>(
    `/Aspirante?page=${page ?? 1}&pageSize=${pageSize ?? 20}&filter=${filter ?? ""}`,
  );
  return data;
}

export async function getApplicantById(applicantId: number | string): Promise<Applicant> {
  const { data } = await apiClient.get<Applicant>(`/Aspirante/${applicantId}`);
  return data;
}

export async function createApplicant(payload: PayloadCreateApplicant): Promise<Applicant> {
  const { data } = await apiClient.post<Applicant>(`/Aspirante`, payload);
  return data;
}

export async function updateApplicant(payload: PayloadUpdateApplicant): Promise<Applicant> {
  const { data } = await apiClient.put<Applicant>(`/Aspirante`, payload);
  return data;
}

export async function getApplicantTrackingLogs(applicantId: number | string): Promise<TrackingLog[]> {
  const { data } = await apiClient.get<TrackingLog[]>(`/Aspirante/bitacora-seguimiento?idAspirante=${applicantId}`);
  return data;
}

export async function addApplicantTrackingLog(payload: PayloadTrackingLog): Promise<TrackingLog> {
  const { data } = await apiClient.post<TrackingLog>(`/Aspirante/bitacora-seguimiento`, payload);
  return data;
}
