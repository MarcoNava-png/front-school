import { Municipality, State, Township } from "@/types/location";

import apiClient from "./api-client";

const baseUrlLocations: string = "/Ubicacion";

export async function getStates(): Promise<State[]> {
  const { data } = await apiClient.get<State[]>(`${baseUrlLocations}/estados`);
  return data;
}

export async function getMunicipalities(stateId: number | string): Promise<Municipality[]> {
  const { data } = await apiClient.get<Municipality[]>(`${baseUrlLocations}/municipios/${stateId}`);
  return data;
}

export async function getTownships(municipalityId: number | string): Promise<Township[]> {
  const { data } = await apiClient.get<Township[]>(`${baseUrlLocations}/asentamientos/${municipalityId}`);
  return data;
}
