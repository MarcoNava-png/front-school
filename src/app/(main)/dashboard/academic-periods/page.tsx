"use client";

import { useEffect, useState } from "react";

import { Calendar, CalendarCheck, CalendarClock, CalendarX, Search, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { AcademicPeriod } from "@/types/academic-period";

import { CreateAcademicPeriodDialog } from "./_components/create-academic-period-dialog";
import { SetCurrentPeriod } from "./_components/set-current-period";

export default function AcademicPeriodsPage() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const loadAcademicPeriods = async () => {
    setLoading(true);
    try {
      const res = await getAcademicPeriodsList();
      if (res && Array.isArray(res.items)) {
        setPeriods(res.items);
      } else {
        setPeriods([]);
      }
    } catch {
      setError("Error al cargar periodos académicos");
      toast.error("Error al cargar los periodos académicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicPeriods();
  }, []);

  const filteredPeriods = periods.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clave?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const periodosActivos = periods.length; // Todos los periodos se consideran activos
  const periodoActual = periods.find(p => p.esPeriodoActual);

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando periodos académicos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
            <Button onClick={loadAcademicPeriods} className="mt-4 w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
            Periodos Académicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los periodos académicos de la institución
          </p>
        </div>
        <CreateAcademicPeriodDialog open={open} setOpen={setOpen} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Total Periodos</CardDescription>
            <CardTitle className="text-4xl text-blue-700 dark:text-blue-300">
              {periods.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Activos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {periodosActivos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Periodo Actual
            </CardDescription>
            <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300 truncate">
              {periodoActual?.nombre ?? "No definido"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Inactivos</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {periods.length - periodosActivos}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Selector de periodo actual */}
      {periods.length > 0 && (
        <SetCurrentPeriod periods={periods} onUpdate={loadAcademicPeriods} />
      )}

      {/* Table Card */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Periodos</CardTitle>
              <CardDescription>
                {filteredPeriods.length} periodos encontrados
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead className="font-semibold text-primary">Clave</TableHead>
                <TableHead className="font-semibold text-primary">Nombre</TableHead>
                <TableHead className="font-semibold text-primary">Fecha Inicio</TableHead>
                <TableHead className="font-semibold text-primary">Fecha Fin</TableHead>
                <TableHead className="font-semibold text-primary text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeriods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                      <span>No se encontraron periodos académicos</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPeriods.map((period, index) => (
                  <TableRow
                    key={period.idPeriodoAcademico}
                    className={`${index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"} ${period.esPeriodoActual ? "ring-2 ring-yellow-400 ring-inset" : ""}`}
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                        {period.clave ?? `P${period.idPeriodoAcademico}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${period.esPeriodoActual ? "bg-yellow-100 dark:bg-yellow-900" : "bg-blue-100 dark:bg-blue-900"}`}>
                          {period.esPeriodoActual ? (
                            <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{period.nombre}</span>
                          {period.esPeriodoActual && (
                            <Badge className="ml-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">
                              Actual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarCheck className="h-4 w-4 text-green-500" />
                        <span>{formatDate(period.fechaInicio)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarX className="h-4 w-4 text-red-500" />
                        <span>{formatDate(period.fechaFin)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Activo
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
