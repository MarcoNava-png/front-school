import { LoginResponse } from "@/types/auth";

import apiClient from "./api-client";

export async function login({ email, password }: { email: string; password: string }) {
  if (!email || !password) {
    return { success: false, error: "Invalid credentials" };
  }
  try {
    const { data }: { data: LoginResponse } = await apiClient.post("/auth/login", { email, password });
    if (data.isSuccess && data.data?.token) {
      localStorage.setItem("access_token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));
      document.cookie = `access_token=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
      return { success: true, token: data.data.token, user: data.data };
    }
    return { success: false, error: data.messageError ?? "Invalid credentials" };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export async function refreshToken(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data }: { data: LoginResponse } = await apiClient.post("/auth/refresh");
    if (data.isSuccess && data.data?.token) {
      localStorage.setItem("access_token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data));
      document.cookie = `access_token=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
      return { success: true };
    }
    return { success: false, error: "No se pudo renovar la sesión" };
  } catch {
    return { success: false, error: "Error al renovar la sesión" };
  }
}

export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (name && email && password) {
    return { success: true };
  }
  return { success: false, error: "Invalid registration data" };
}

export async function forgotPassword({ email }: { email: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email) {
    return { success: true };
  }
  return { success: false, error: "Email required" };
}
