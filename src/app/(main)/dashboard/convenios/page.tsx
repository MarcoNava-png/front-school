"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  CalendarDays,
  Edit,
  HandCoins,
  Percent,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCampusList } from "@/services/campus-service";
import {
  listarConvenios,
  eliminarConvenio,
  cambiarEstadoConvenio,
  formatearBeneficio,
} from "@/services/convenios-service";
import { getStudyPlansList } from "@/services/study-plans-service";
import { Campus } from "@/types/campus";
import { ConvenioDto } from "@/types/convenio";
import { StudyPlan } from "@/types/study-plan";

import { CreateConvenioModal } from "./_components/create-convenio-modal";
import { EditConvenioModal } from "./_components/edit-convenio-modal";

export default function ConveniosPage() {
  const [convenios, setConvenios] = useState<ConvenioDto[]>([]);
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convenioToEdit, setConvenioToEdit] = useState<ConvenioDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convenioToDelete, setConvenioToDelete] = useState<ConvenioDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conveniosRes, campusRes, planesRes] = await Promise.all([
        listarConvenios(),
        getCampusList(),
        getStudyPlansList(),
      ]);

      setConvenios(conveniosRes);
      setCampusList(campusRes.items || []);
      setPlanesEstudio(planesRes.items || []);
    } catch {
      setError("Error al cargar datos");
      toast.error("Error al cargar los convenios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConvenio = async (convenioCreated: ConvenioDto) => {
    setConvenios((prev) => [...prev, convenioCreated]);
    toast.success("Convenio creado exitosamente");
  };

  const openDeleteDialog = (convenio: ConvenioDto) => {
    setConvenioToDelete(convenio);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConvenio = async () => {
    if (!convenioToDelete) return;

    setIsDeleting(true);
    try {
      await eliminarConvenio(convenioToDelete.idConvenio);
      setConvenios((prev) =>
        prev.filter((item) => item.idConvenio !== convenioToDelete.idConvenio)
      );
      toast.success("Convenio eliminado exitosamente");
      setDeleteDialogOpen(false);
      setConvenioToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar el convenio";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
          return;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleEstado = async (convenio: ConvenioDto) => {
    try {
      await cambiarEstadoConvenio(convenio.idConvenio, !convenio.activo);
      setConvenios((prev) =>
        prev.map((c) =>
          c.idConvenio === convenio.idConvenio ? { ...c, activo: !c.activo } : c
        )
      );
      toast.success(
        `Convenio ${!convenio.activo ? "activado" : "desactivado"} exitosamente`
      );
    } catch {
      toast.error("Error al cambiar el estado del convenio");
    }
  };

  const filteredConvenios =
    convenios.filter(
      (c) =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.claveConvenio.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

  const stats = {
    total: convenios.length,
    activos: convenios.filter((c) => c.activo).length,
    conAspirantes: convenios.filter((c) => c.aspirantesAsignados > 0).length,
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Cargando convenios...</span>
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))",
              }}
            >
              <HandCoins className="h-8 w-8" style={{ color: "#14356F" }} />
            </div>
            Convenios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los convenios y promociones de la institucion
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Convenio
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="border-2"
          style={{
            borderColor: "rgba(20, 53, 111, 0.2)",
            background:
              "linear-gradient(to bottom right, rgba(20, 53, 111, 0.05), rgba(30, 74, 143, 0.1))",
          }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: "#1e4a8f" }}>
              Total Convenios
            </CardDescription>
            <CardTitle className="text-4xl" style={{ color: "#14356F" }}>
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400">
              Activos
            </CardDescription>
            <CardTitle className="text-4xl text-green-700 dark:text-green-300">
              {stats.activos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Con Aspirantes
            </CardDescription>
            <CardTitle className="text-4xl text-purple-700 dark:text-purple-300">
              {stats.conAspirantes}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader className="border-b bg-muted/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listado de Convenios</CardTitle>
              <CardDescription>
                {filteredConvenios.length} convenios encontrados
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
              <TableRow
                className="hover:bg-transparent"
                style={{
                  background: "linear-gradient(to right, #14356F, #1e4a8f)",
                }}
              >
                <TableHead className="font-semibold text-white">Clave</TableHead>
                <TableHead className="font-semibold text-white">Nombre</TableHead>
                <TableHead className="font-semibold text-white">Beneficio</TableHead>
                <TableHead className="font-semibold text-white">Alcance</TableHead>
                <TableHead className="font-semibold text-white">Vigencia</TableHead>
                <TableHead className="font-semibold text-white text-center">
                  Aspirantes
                </TableHead>
                <TableHead className="font-semibold text-white text-center">
                  Activo
                </TableHead>
                <TableHead className="font-semibold text-white text-center">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConvenios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HandCoins className="h-8 w-8" />
                      <span>No se encontraron convenios</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConvenios.map((c, index) => (
                  <TableRow
                    key={c.idConvenio}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-950"
                        : "bg-muted/30"
                    }
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono"
                        style={{
                          background: "rgba(20, 53, 111, 0.05)",
                          color: "#14356F",
                          borderColor: "rgba(20, 53, 111, 0.2)",
                        }}
                      >
                        {c.claveConvenio}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded"
                          style={{ background: "rgba(20, 53, 111, 0.1)" }}
                        >
                          <HandCoins
                            className="h-4 w-4"
                            style={{ color: "#14356F" }}
                          />
                        </div>
                        <span className="font-medium">{c.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {c.tipoBeneficio === "PORCENTAJE" && (
                          <Percent className="h-4 w-4 text-blue-500" />
                        )}
                        {c.tipoBeneficio === "MONTO" && (
                          <span className="text-green-500 font-bold">$</span>
                        )}
                        {c.tipoBeneficio === "EXENCION" && (
                          <span className="text-amber-500 font-bold">100%</span>
                        )}
                        <span className="text-sm">{formatearBeneficio(c)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.alcances.length === 0 ? (
                        <span className="text-muted-foreground text-sm">
                          Todos
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {c.alcances.slice(0, 2).map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 text-xs"
                            >
                              {a.nombreCampus && (
                                <Badge variant="secondary" className="text-xs">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  {a.nombreCampus}
                                </Badge>
                              )}
                              {a.nombrePlanEstudios && (
                                <Badge variant="outline" className="text-xs">
                                  {a.nombrePlanEstudios}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {c.alcances.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{c.alcances.length - 2} mas...
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {c.vigenteDesde || c.vigenteHasta ? (
                          <span>
                            {c.vigenteDesde || "..."} - {c.vigenteHasta || "..."}
                          </span>
                        ) : (
                          <span>Sin limite</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {c.aspirantesAsignados}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={c.activo}
                        onCheckedChange={() => handleToggleEstado(c)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                          onClick={() => {
                            setConvenioToEdit(c);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={() => openDeleteDialog(c)}
                          disabled={c.aspirantesAsignados > 0}
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
      <CreateConvenioModal
        open={modalOpen}
        campusList={campusList}
        planesEstudio={planesEstudio}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateConvenio}
      />

      {convenioToEdit && (
        <EditConvenioModal
          open={editModalOpen}
          convenio={convenioToEdit}
          campusList={campusList}
          planesEstudio={planesEstudio}
          onClose={() => {
            setEditModalOpen(false);
            setConvenioToEdit(null);
          }}
          onUpdate={(updated) => {
            setConvenios((prev) =>
              prev.map((item) =>
                item.idConvenio === updated.idConvenio ? updated : item
              )
            );
            setEditModalOpen(false);
            setConvenioToEdit(null);
            toast.success("Convenio actualizado exitosamente");
          }}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Convenio"
        description="Esta accion no se puede deshacer. Se eliminara permanentemente el convenio:"
        itemName={convenioToDelete?.nombre}
        onConfirm={handleDeleteConvenio}
        isDeleting={isDeleting}
      />
    </div>
  );
}
