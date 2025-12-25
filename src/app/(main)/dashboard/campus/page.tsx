"use client";
import { useEffect, useState } from "react";

import { Building2, Edit, MapPin, Plus, Search, Trash2 } from "lucide-react";
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
import { getCampusList } from "@/services/campus-service";
import { getStates } from "@/services/location-service";
import { Campus, CampusResponse } from "@/types/campus";
import { State } from "@/types/location";

import { CreateCampusModal } from "./_components/create-campus-modal";
import { EditCampusModal } from "./_components/edit-campus-modal";

export default function Page() {
  const [campus, setCampus] = useState<CampusResponse | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [campusToEdit, setCampusToEdit] = useState<Campus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campusRes, statesRes] = await Promise.all([
        getCampusList(),
        getStates(),
      ]);

      if (campusRes.items) {
        setCampus(campusRes);
      }
      if (statesRes) {
        setStates(statesRes);
      }
    } catch {
      setError("Error al cargar datos");
      toast.error("Error al cargar los campus");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampus = async (campusCreated: Campus) => {
    setCampus((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [...prev.items, campusCreated],
      };
    });
    toast.success("Campus creado exitosamente");
  };

  const filteredCampus = campus?.items.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.claveCampus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando campus...</span>
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
            <Button onClick={loadData} className="mt-4 w-full">
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
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            Campus
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los campus de la institución
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Campus
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400">Total Campus</CardDescription>
            <CardTitle className="text-4xl text-blue-700 dark:text-blue-300">
              {campus?.items.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">Activos</CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {campus?.items.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">Estados</CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {states.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Campus</CardTitle>
              <CardDescription>
                {filteredCampus.length} campus encontrados
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
                <TableHead className="font-semibold text-primary">Dirección</TableHead>
                <TableHead className="font-semibold text-primary">Estado</TableHead>
                <TableHead className="font-semibold text-primary text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8" />
                      <span>No se encontraron campus</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampus.map((c, index) => (
                  <TableRow
                    key={c.idCampus}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-muted/30"}
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                        {c.claveCampus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{c.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-xs">{c.direccion || "Sin dirección"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-100"
                      >
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => {
                            setCampusToEdit(c);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={() => {
                            toast.info("Función de eliminar próximamente");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateCampusModal
        open={modalOpen}
        states={states}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateCampus}
      />

      {campusToEdit && (
        <EditCampusModal
          open={editModalOpen}
          campus={campusToEdit}
          states={states}
          onClose={() => {
            setEditModalOpen(false);
            setCampusToEdit(null);
          }}
          onUpdate={(updated) => {
            setCampus((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                items: prev.items.map((item) => (item.idCampus === updated.idCampus ? updated : item)),
              };
            });
            setEditModalOpen(false);
            setCampusToEdit(null);
            toast.success("Campus actualizado exitosamente");
          }}
        />
      )}
    </div>
  );
}
