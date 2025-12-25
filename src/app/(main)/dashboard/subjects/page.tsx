"use client";

import { useEffect, useState } from "react";

import { BookOpen, GraduationCap, Hash, Plus, Search } from "lucide-react";
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
import { getMatterPlanList } from "@/services/matter-plan-service";
import { MatterPlan } from "@/types/matter-plan";

import { CreateSubjectDialog } from "./_components/create-subject-dialog";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<MatterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await getMatterPlanList();
      setSubjects(res ?? []);
    } catch {
      setError("Error al cargar materias");
      toast.error("Error al cargar las materias");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.nombreMateria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.materia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.claveMateria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalCreditos = subjects.reduce((sum, s) => sum + (s.creditos ?? 0), 0);
  const cuatrimestres = new Set(subjects.map(s => s.cuatrimestre).filter(Boolean));

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando materias...</span>
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
            <Button onClick={loadSubjects} className="mt-4 w-full">
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
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            Materias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de materias del plan de estudios
          </p>
        </div>
        <CreateSubjectDialog open={open} setOpen={setOpen} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Total Materias</CardDescription>
            <CardTitle className="text-4xl text-blue-700 dark:text-blue-300">
              {subjects.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Total Créditos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {totalCreditos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Cuatrimestres</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {cuatrimestres.size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 dark:text-orange-400">Promedio Créditos</CardDescription>
            <CardTitle className="text-4xl text-orange-700 dark:text-orange-300">
              {subjects.length > 0 ? Math.round(totalCreditos / subjects.length) : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Materias</CardTitle>
              <CardDescription>
                {filteredSubjects.length} materias encontradas
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
                <TableHead className="font-semibold text-primary text-center">Cuatrimestre</TableHead>
                <TableHead className="font-semibold text-primary text-center">Créditos</TableHead>
                <TableHead className="font-semibold text-primary">Plan de Estudios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                      <span>No se encontraron materias</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((s, index) => (
                  <TableRow
                    key={s.idMateriaPlan}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"}
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                        {s.claveMateria ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{s.nombreMateria ?? s.materia}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        {s.cuatrimestre}°
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{s.creditos ?? 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-xs">{s.nombrePlanEstudios ?? "—"}</span>
                      </div>
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
