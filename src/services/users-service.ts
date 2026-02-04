import type { User, CreateUserRequest, UpdateUserRequest, UsersResponse, UserResponse } from "@/types/user";

import apiClient from "./api-client";

export async function getAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get<UsersResponse>("/auth/users");
  return data.data || [];
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await apiClient.get<UserResponse>(`/auth/users/${id}`);
  return data.data;
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const { data } = await apiClient.post<UserResponse>("/auth/create-user", userData);
  return data.data;
}

export async function updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
  const { data } = await apiClient.put<UserResponse>(`/auth/users/${id}`, userData);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/auth/users/${id}`);
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/admin-reset-password", {
    userId,
    newPassword,
  });
}

export async function getCurrentUserProfile(): Promise<User> {
  const { data } = await apiClient.get<UserResponse>("/auth/profile");
  return data.data;
}

export async function updateUserProfile(
  userData: UpdateUserRequest,
  photoFile?: File | null
): Promise<User> {
  const formData = new FormData();
  formData.append("Email", userData.email);
  formData.append("Nombres", userData.nombres);
  formData.append("Apellidos", userData.apellidos);
  if (userData.telefono) formData.append("Telefono", userData.telefono);
  if (userData.biografia) formData.append("Biografia", userData.biografia);
  if (photoFile) formData.append("photoFile", photoFile);

  const { data } = await apiClient.put<User>("/auth/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}
