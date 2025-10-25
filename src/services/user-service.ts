import { PayloadCreateUser, PayloadUpdateUser } from "@/types/user";

import apiClient from "./api-client";

export async function createUser(payload: PayloadCreateUser): Promise<any> {
  const { data } = await apiClient.post<any>(`/auth/create-user`, payload);
  return data;
}

export async function updateProfile(payload: PayloadUpdateUser): Promise<any> {
  const { data } = await apiClient.put<any>(`/auth/update-profile`, payload);
  return data;
}
