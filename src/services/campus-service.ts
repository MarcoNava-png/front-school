import { Campus, CampusResponse, PayloadCreateCampus, PayloadUpdateCampus } from "@/types/campus";

import apiClient from "./api-client";

export async function getCampusList(): Promise<CampusResponse> {
  const { data } = await apiClient.get<CampusResponse>("/Campus");
  return data;
}

export async function createCampus(payload: PayloadCreateCampus): Promise<Campus> {
  const { data } = await apiClient.post<Campus>("/Campus", payload);
  return data;
}

export async function updateCampus(payload: PayloadUpdateCampus): Promise<Campus> {
  const { data } = await apiClient.put<Campus>("/Campus", payload);
  return data;
}

export async function deleteCampus(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/Campus/${id}`);
  return data;
}
