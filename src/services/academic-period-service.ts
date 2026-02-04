import { AcademicPeriod, AcademicPeriodsResponse, PayloadCreateAcademicPeriod } from "@/types/academic-period";

import apiClient from "./api-client";

export async function getAcademicPeriodsList(): Promise<AcademicPeriodsResponse> {
  const { data } = await apiClient.get<AcademicPeriodsResponse>(`/PeriodoAcademico`);
  return data;
}

export async function createAcademicPeriod(payload: PayloadCreateAcademicPeriod): Promise<AcademicPeriod> {
  const { data } = await apiClient.post<AcademicPeriod>(`/PeriodoAcademico`, payload);
  return data;
}

export async function updateAcademicPeriod(payload: AcademicPeriod): Promise<AcademicPeriod> {
  const { data } = await apiClient.put<AcademicPeriod>(`/PeriodoAcademico`, payload);
  return data;
}

export async function getCurrentAcademicPeriod(): Promise<AcademicPeriod | null> {
  try {
    const { data } = await apiClient.get<AcademicPeriod>(`/PeriodoAcademico/actual`);
    return data;
  } catch {
    return null;
  }
}

export async function setCurrentAcademicPeriod(idPeriodoAcademico: number): Promise<{ mensaje: string; periodo: AcademicPeriod }> {
  const { data } = await apiClient.post<{ mensaje: string; periodo: AcademicPeriod }>(
    `/PeriodoAcademico/${idPeriodoAcademico}/marcar-actual`
  );
  return data;
}

export async function getAcademicPeriodById(id: number): Promise<AcademicPeriod> {
  const { data } = await apiClient.get<AcademicPeriod>(`/PeriodoAcademico/${id}`);
  return data;
}

export async function deleteAcademicPeriod(id: number): Promise<{ mensaje: string }> {
  const { data } = await apiClient.delete<{ mensaje: string }>(`/PeriodoAcademico/${id}`);
  return data;
}
