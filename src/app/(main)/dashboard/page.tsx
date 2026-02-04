"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useDashboard,
  isAdminDashboard,
  isDirectorDashboard,
  isFinanzasDashboard,
  isControlEscolarDashboard,
  isAdmisionesDashboard,
  isCoordinadorDashboard,
  isDocenteDashboard,
  isAlumnoDashboard,
} from "@/hooks/use-dashboard";

import { DashboardSkeleton } from "./_components/dashboard-skeleton";
import {
  AdminDashboard,
  DirectorDashboard,
  FinanzasDashboard,
  ControlEscolarDashboard,
  AdmisionesDashboard,
  CoordinadorDashboard,
  DocenteDashboard,
  AlumnoDashboard,
} from "./_components/dashboards";

export default function DashboardPage() {
  const { dashboard, rol, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el dashboard</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboard || !rol) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard no disponible</AlertTitle>
          <AlertDescription>
            No se pudo determinar tu rol en el sistema. Contacta al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isAdminDashboard(dashboard, rol)) {
    return <AdminDashboard data={dashboard} />;
  }

  if (isDirectorDashboard(dashboard, rol)) {
    return <DirectorDashboard data={dashboard} />;
  }

  if (isFinanzasDashboard(dashboard, rol)) {
    return <FinanzasDashboard data={dashboard} />;
  }

  if (isControlEscolarDashboard(dashboard, rol)) {
    return <ControlEscolarDashboard data={dashboard} />;
  }

  if (isAdmisionesDashboard(dashboard, rol)) {
    return <AdmisionesDashboard data={dashboard} />;
  }

  if (isCoordinadorDashboard(dashboard, rol)) {
    return <CoordinadorDashboard data={dashboard} />;
  }

  if (isDocenteDashboard(dashboard, rol)) {
    return <DocenteDashboard data={dashboard} />;
  }

  if (isAlumnoDashboard(dashboard, rol)) {
    return <AlumnoDashboard data={dashboard} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Rol no reconocido</AlertTitle>
        <AlertDescription>
          Tu rol ({rol}) no tiene un dashboard configurado. Contacta al administrador.
        </AlertDescription>
      </Alert>
    </div>
  );
}
