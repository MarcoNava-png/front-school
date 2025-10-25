import { Group, GroupsResponse, PayloadAddMatters, PayloadCreateGroup, PayloadUpdateGroup } from "@/types/group";

import apiClient from "./api-client";

export async function getGroupsList(page?: number, pageSize?: number): Promise<GroupsResponse> {
  const { data } = await apiClient.get<GroupsResponse>(`/grupos?page=${page ?? 1}&pageSize=${pageSize ?? 20}`);
  return data;
}

export async function getGroupById(groupId: number): Promise<Group> {
  const { data } = await apiClient.get<Group>(`/grupos/${groupId}`);
  return data;
}

export async function createGroup(payload: PayloadCreateGroup): Promise<Group> {
  const { data } = await apiClient.post<Group>(`/grupos`, payload);
  return data;
}

export async function updateGroup(payload: PayloadUpdateGroup): Promise<Group> {
  const { data } = await apiClient.put<Group>(`/grupos`, payload);
  return data;
}

export async function addMattersToGroup(payload: PayloadAddMatters) {
  const { data } = await apiClient.post(`/grupos/carga-materias`, payload);
  return data;
}
