import { PayloadCreateStudyPlan, PayloadUpdateStudyPlan, StudyPlan, StudyPlansResponse } from "@/types/study-plan";

import apiClient from "./api-client";

export async function getStudyPlansList(page?: number, pageSize?: number): Promise<StudyPlansResponse> {
  const { data } = await apiClient.get<StudyPlansResponse>(
    `/PlanEstudios?page=${page ?? 1}&pageSize=${pageSize ?? 20}`,
  );
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
