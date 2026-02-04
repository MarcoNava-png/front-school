import {
  AdminDashboard,
  AlumnoDashboard,
  AdmisionesDashboard,
  ControlEscolarDashboard,
  CoordinadorDashboard,
  DashboardResponse,
  DirectorDashboard,
  DocenteDashboard,
  FinanzasDashboard,
} from "@/types/dashboard";

import apiClient from "./api-client";

interface ApiResponse<T> {
  data: T;
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<ApiResponse<DashboardResponse>>("/dashboard");
  return response.data.data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>("/dashboard/admin");
  return response.data.data;
}

export async function getDirectorDashboard(): Promise<DirectorDashboard> {
  const response = await apiClient.get<ApiResponse<DirectorDashboard>>("/dashboard/director");
  return response.data.data;
}

export async function getFinanzasDashboard(): Promise<FinanzasDashboard> {
  const response = await apiClient.get<ApiResponse<FinanzasDashboard>>("/dashboard/finanzas");
  return response.data.data;
}

export async function getControlEscolarDashboard(): Promise<ControlEscolarDashboard> {
  const response = await apiClient.get<ApiResponse<ControlEscolarDashboard>>("/dashboard/control-escolar");
  return response.data.data;
}

export async function getAdmisionesDashboard(): Promise<AdmisionesDashboard> {
  const response = await apiClient.get<ApiResponse<AdmisionesDashboard>>("/dashboard/admisiones");
  return response.data.data;
}

export async function getCoordinadorDashboard(): Promise<CoordinadorDashboard> {
  const response = await apiClient.get<ApiResponse<CoordinadorDashboard>>("/dashboard/coordinador");
  return response.data.data;
}

export async function getDocenteDashboard(): Promise<DocenteDashboard> {
  const response = await apiClient.get<ApiResponse<DocenteDashboard>>("/dashboard/docente");
  return response.data.data;
}

export async function getAlumnoDashboard(): Promise<AlumnoDashboard> {
  const response = await apiClient.get<ApiResponse<AlumnoDashboard>>("/dashboard/alumno");
  return response.data.data;
}
