import { MatterPlan, PayloadMatterPlan } from "@/types/matter-plan";

import apiClient from "./api-client";

export async function getMatterPlanList(): Promise<MatterPlan[]> {
  const response = await apiClient.get<{ items: MatterPlan[] }>(`/MateriaPlan`);
  return response.data.items;
}

export async function getMatterPlanById(matterPlanId: number): Promise<MatterPlan> {
  const response = await apiClient.get<MatterPlan>(`/MateriaPlan/${matterPlanId}`);
  return response.data;
}

export async function createMatterPlan(payload: PayloadMatterPlan): Promise<MatterPlan> {
  const response = await apiClient.post<MatterPlan>(`/MateriaPlan`, payload);
  return response.data;
}

export async function updateMatterPlan(payload: PayloadMatterPlan): Promise<MatterPlan> {
  const response = await apiClient.put<MatterPlan>(`/MateriaPlan/${payload.idMateriaPlan}`, payload);
  return response.data;
}

export async function deleteMatterPlan(matterPlanId: number): Promise<void> {
  await apiClient.delete<void>(`/MateriaPlan/${matterPlanId}`);
}

export async function getMattersByStudyPlan(idPlanEstudios: number): Promise<MatterPlan[]> {
  const allMatters = await getMatterPlanList();
  return allMatters.filter(matter => matter.idPlanEstudios === idPlanEstudios);
}
