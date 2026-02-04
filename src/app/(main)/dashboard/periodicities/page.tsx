"use client";

import { useEffect, useState } from "react";

import { CalendarRange, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPeriodicityAdmin, togglePeriodicity } from "@/services/catalogs-service";
import { Periodicity } from "@/types/catalog";

import { CreatePeriodicityDialog } from "./_components/create-periodicity-dialog";

export default function PeriodicitiesPage() {
  const [periodicities, setPeriodicities] = useState<Periodicity[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    loadPeriodicities();
  }, []);

  const loadPeriodicities = async () => {
    try {
      const data = await getPeriodicityAdmin();
      setPeriodicities(data);
    } catch {
      toast.error("Error al cargar periodicidades");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (periodicity: Periodicity) => {
    try {
      const updated = await togglePeriodicity(periodicity.idPeriodicidad);
      setPeriodicities((prev) =>
        prev.map((p) => (p.idPeriodicidad === periodicity.idPeriodicidad ? updated : p))
      );
      toast.success(
        updated.activo
          ? `${updated.descPeriodicidad} activada`
          : `${updated.descPeriodicidad} desactivada`
      );
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const activas = periodicities.filter((p) => p.activo).length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando periodicidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: "linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))" }}
            >
              <CalendarRange className="h-8 w-8" style={{ color: "#14356F" }} />
            </div>
            Periodicidades
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra las periodicidades del sistema (Cuatrimestral, Semestral, etc.)
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Periodicidad
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="border-2"
          style={{ borderColor: "rgba(20, 53, 111, 0.2)", background: "linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))" }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: "#1e4a8f" }}>Total</CardDescription>
            <CardTitle className="text-4xl" style={{ color: "#14356F" }}>
              {periodicities.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600">Activas</CardDescription>
            <CardTitle className="text-4xl text-green-700">{activas}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600">Inactivas</CardDescription>
            <CardTitle className="text-4xl text-orange-700">
              {periodicities.length - activas}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Listado de Periodicidades</CardTitle>
          <CardDescription>
            Activa o desactiva las periodicidades que necesites para tus planes de estudio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow
                className="hover:bg-transparent"
                style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
              >
                <TableHead className="font-semibold text-white">ID</TableHead>
                <TableHead className="font-semibold text-white">Nombre</TableHead>
                <TableHead className="font-semibold text-white text-center">Periodos por Ano</TableHead>
                <TableHead className="font-semibold text-white text-center">Meses por Periodo</TableHead>
                <TableHead className="font-semibold text-white">Estado</TableHead>
                <TableHead className="font-semibold text-white text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodicities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CalendarRange className="h-8 w-8" />
                      <span>No hay periodicidades registradas</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                periodicities.map((periodicity, index) => (
                  <TableRow
                    key={periodicity.idPeriodicidad}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-muted/30"} ${!periodicity.activo ? "opacity-60" : ""}`}
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {periodicity.idPeriodicidad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{periodicity.descPeriodicidad}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{periodicity.periodosPorAnio}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{periodicity.mesesPorPeriodo}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={periodicity.activo ? "default" : "secondary"}
                        className={periodicity.activo
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
                      >
                        {periodicity.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 w-8 p-0 ${periodicity.activo
                                  ? "hover:bg-orange-100 hover:text-orange-600"
                                  : "hover:bg-green-100 hover:text-green-600"}`}
                                onClick={() => handleToggle(periodicity)}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {periodicity.activo ? "Desactivar" : "Activar"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreatePeriodicityDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSuccess={loadPeriodicities}
      />
    </div>
  );
}
