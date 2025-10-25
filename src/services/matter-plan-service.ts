import { MatterPlan, PayloadMatterPlan } from "@/types/matter-plan";

import apiClient from "./api-client";

export async function getMatterPlanList(): Promise<MatterPlan[]> {
  const { data } = await apiClient.get<MatterPlan[]>(`/MateriaPlan`);
  return data;
}

export async function getMatterPlanById(matterPlanId: number): Promise<MatterPlan> {
  const { data } = await apiClient.get<MatterPlan>(`/MateriaPlan/${matterPlanId}`);
  return data;
}

export async function createMatterPlan(payload: PayloadMatterPlan): Promise<MatterPlan> {
  const { data } = await apiClient.post<MatterPlan>(`/MateriaPlan`, payload);
  return data;
}

export async function updateMatterPlan(payload: PayloadMatterPlan): Promise<MatterPlan> {
  const { data } = await apiClient.put<MatterPlan>(`/MateriaPlan`, payload);
  return data;
}

export async function deleteMatterPlan(matterPlanId: number): Promise<void> {
  await apiClient.delete<void>(`/MateriaPlan/${matterPlanId}`);
}
