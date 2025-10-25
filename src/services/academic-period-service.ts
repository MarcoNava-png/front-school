import { AcademicPeriod, AcademicPeriodsResponse, PayloadCreateAcademicPeriod } from "@/types/academic-period";

import apiClient from "./api-client";

export async function getAcademicPeriodsList(): Promise<AcademicPeriodsResponse[]> {
  const { data } = await apiClient.get<AcademicPeriodsResponse[]>(`/PeriodoAcademico`);
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
