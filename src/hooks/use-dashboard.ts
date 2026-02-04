import { useCallback, useEffect, useState } from "react";

import { getDashboard } from "@/services/dashboard-service";
import { DashboardData, DashboardResponse, RoleDashboard } from "@/types/dashboard";

interface UseDashboardReturn {
  dashboard: DashboardData | null;
  rol: RoleDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [rol, setRol] = useState<RoleDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: DashboardResponse = await getDashboard();

      setRol(response.rol as RoleDashboard);
      setDashboard(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el dashboard";
      setError(errorMessage);
      console.error("Error fetching dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    rol,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}

export function isAdminDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").AdminDashboard {
  return rol === "admin";
}

export function isDirectorDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").DirectorDashboard {
  return rol === "director";
}

export function isFinanzasDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").FinanzasDashboard {
  return rol === "finanzas";
}

export function isControlEscolarDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").ControlEscolarDashboard {
  return rol === "controlescolar";
}

export function isAdmisionesDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").AdmisionesDashboard {
  return rol === "admisiones";
}

export function isCoordinadorDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").CoordinadorDashboard {
  return rol === "coordinador";
}

export function isDocenteDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").DocenteDashboard {
  return rol === "docente";
}

export function isAlumnoDashboard(dashboard: DashboardData, rol: RoleDashboard | null): dashboard is import("@/types/dashboard").AlumnoDashboard {
  return rol === "alumno";
}
