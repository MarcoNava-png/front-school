import { PayloadCreateStudyPlan, PayloadUpdateStudyPlan, StudyPlan, StudyPlansResponse } from "@/types/study-plan";

import apiClient from "./api-client";

export interface StudyPlanFilters {
  page?: number;
  pageSize?: number;
  idCampus?: number;
  incluirInactivos?: boolean;
}

export async function getStudyPlansList(filters?: StudyPlanFilters): Promise<StudyPlansResponse> {
  const params = new URLSearchParams();
  params.append("page", (filters?.page ?? 1).toString());
  params.append("pageSize", (filters?.pageSize ?? 1000).toString());
  if (filters?.idCampus) {
    params.append("idCampus", filters.idCampus.toString());
  }
  if (filters?.incluirInactivos) {
    params.append("incluirInactivos", "true");
  }
  const { data } = await apiClient.get<StudyPlansResponse>(`/PlanEstudios?${params.toString()}`);
  return data;
}

export async function createStudyPlan(payload: PayloadCreateStudyPlan): Promise<StudyPlan> {
  const { data } = await apiClient.post<StudyPlan>(`/PlanEstudios`, payload);
  return data;
}

export async function updateStudyPlan(payload: PayloadUpdateStudyPlan): Promise<StudyPlan> {
  const { data } = await apiClient.put<StudyPlan>(`/PlanEstudios`, payload);
  return data;
}

export async function deleteStudyPlan(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/PlanEstudios/${id}`);
  return data;
}

export async function getStudyPlanById(id: number): Promise<StudyPlan> {
  const { data } = await apiClient.get<StudyPlan>(`/PlanEstudios/${id}`);
  return data;
}

export async function toggleStudyPlanStatus(id: number): Promise<StudyPlan> {
  const { data } = await apiClient.put<StudyPlan>(`/PlanEstudios/${id}/toggle`);
  return data;
}
