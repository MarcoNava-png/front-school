import { CampusData } from "@/types/campus";

import apiClient from "./api-client";

export async function getCampusList(): Promise<CampusData> {
  const { data } = await apiClient.get<CampusData>("/campus");
  return data;
}
