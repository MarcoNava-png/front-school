import { LoginResponse } from "@/types/auth";

import apiClient from "./api-client";

export async function login({ email, password }: { email: string; password: string }) {
  if (!email || !password) {
    return { success: false, error: "Invalid credentials" };
  }
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }
    const { data }: { data: LoginResponse } = await apiClient.post("/auth/login", { email, password });
    if (data.isSuccess && data.data?.token) {
      localStorage.setItem("access_token", data.data.token);
      document.cookie = `access_token=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
      return { success: true, token: data.data.token, user: data.data };
    }
    return { success: false, error: data.messageError ?? "Invalid credentials" };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export function logout() {
  // Limpiar localStorage
  localStorage.removeItem("access_token");

  // Limpiar cookie
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (name && email && password) {
    // Simula registro exitoso
    return { success: true };
  }
  return { success: false, error: "Invalid registration data" };
}

export async function forgotPassword({ email }: { email: string }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email) {
    // Simula envío de email de recuperación
    return { success: true };
  }
  return { success: false, error: "Email required" };
}
