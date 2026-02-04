"use client";

import { useEffect, useState } from "react";

import { Award, Edit, Plus, Power, RefreshCw, Search, User } from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activarBecaCatalogo,
  desactivarBecaCatalogo,
  obtenerCatalogoBecas,
} from "@/services/beca-catalogo-service";
import { desactivarBeca, listarBecasEstudiante, recalcularDescuentosBecas } from "@/services/becas-service";
import { getStudentByMatricula } from "@/services/students-service";
import { BecaCatalogo, BecaEstudiante } from "@/types/receipt";
import { Student } from "@/types/student";

import { AsignarBecaModal } from "./_components/asignar-beca-modal";
import { EditarBecaModal } from "./_components/editar-beca-modal";
import { CreateBecaCatalogoModal } from "./catalog/_components/create-beca-catalogo-modal";

export default function ScholarshipsPage() {
  const [activeTab, setActiveTab] = useState("catalogo");

  const [catalogoBecas, setCatalogoBecas] = useState<BecaCatalogo[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState("");
  const [tipoFiltroCatalogo, setTipoFiltroCatalogo] = useState<string>("TODOS");
  const [soloActivosCatalogo, setSoloActivosCatalogo] = useState(true);
  const [createCatalogoModalOpen, setCreateCatalogoModalOpen] = useState(false);
  const [editingBecaCatalogo, setEditingBecaCatalogo] = useState<BecaCatalogo | null>(null);

  const [matricula, setMatricula] = useState("");
  const [estudiante, setEstudiante] = useState<Student | null>(null);
  const [becasEstudiante, setBecasEstudiante] = useState<BecaEstudiante[]>([]);
  const [loadingEstudiante, setLoadingEstudiante] = useState(false);
  const [loadingBecas, setLoadingBecas] = useState(false);
  const [loadingRecalcular, setLoadingRecalcular] = useState(false);
  const [asignarBecaModalOpen, setAsignarBecaModalOpen] = useState(false);
  const [editarBecaModalOpen, setEditarBecaModalOpen] = useState(false);
  const [becaToEdit, setBecaToEdit] = useState<BecaEstudiante | null>(null);

  useEffect(() => {
    cargarCatalogo();
  }, [soloActivosCatalogo]);

  async function cargarCatalogo() {
    setLoadingCatalogo(true);
    try {
      const data = await obtenerCatalogoBecas(soloActivosCatalogo ? true : undefined);
      setCatalogoBecas(data);
    } catch (error) {
      toast.error("Error al cargar catálogo de becas");
      console.error(error);
    } finally {
      setLoadingCatalogo(false);
    }
  }

  async function handleCambiarEstadoCatalogo(id: number, activar: boolean) {
    try {
      if (activar) {
        await activarBecaCatalogo(id);
        toast.success("Beca activada");
      } else {
        await desactivarBecaCatalogo(id);
        toast.success("Beca desactivada");
      }
      cargarCatalogo();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al cambiar estado");
    }
  }

  function handleEditCatalogo(beca: BecaCatalogo) {
    setEditingBecaCatalogo(beca);
    setCreateCatalogoModalOpen(true);
  }

  function handleCloseCatalogoModal(shouldReload?: boolean) {
    setCreateCatalogoModalOpen(false);
    setEditingBecaCatalogo(null);
    if (shouldReload) {
      cargarCatalogo();
    }
  }

  const catalogoFiltrado = catalogoBecas.filter((b) => {
    const matchBusqueda =
      !busquedaCatalogo ||
      b.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
      b.clave.toLowerCase().includes(busquedaCatalogo.toLowerCase());
    const matchTipo = tipoFiltroCatalogo === "TODOS" || b.tipo === tipoFiltroCatalogo;
    return matchBusqueda && matchTipo;
  });

  async function buscarEstudiante() {
    if (!matricula.trim()) {
      toast.error("Ingresa una matrícula");
      return;
    }

    setLoadingEstudiante(true);
    setEstudiante(null);
    setBecasEstudiante([]);

    try {
      const data = await getStudentByMatricula(matricula.trim());
      setEstudiante(data);
      toast.success(`Estudiante encontrado: ${data.nombreCompleto}`);
      cargarBecasEstudiante(data.idEstudiante);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Estudiante no encontrado con esa matrícula");
      } else {
        toast.error("Error al buscar estudiante");
      }
      console.error(error);
    } finally {
      setLoadingEstudiante(false);
    }
  }

  async function cargarBecasEstudiante(idEstudiante: number) {
    setLoadingBecas(true);
    try {
      const data = await listarBecasEstudiante(idEstudiante);
      setBecasEstudiante(data);
    } catch (error) {
      console.error(error);
      setBecasEstudiante([]);
    } finally {
      setLoadingBecas(false);
    }
  }

  async function handleDesactivarBeca(idBecaAsignacion: number) {
    if (!confirm("¿Seguro que deseas desactivar esta beca?")) return;

    try {
      await desactivarBeca(idBecaAsignacion);
      toast.success("Beca desactivada exitosamente");
      if (estudiante) {
        cargarBecasEstudiante(estudiante.idEstudiante);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al desactivar beca");
    }
  }

  function limpiarBusqueda() {
    setMatricula("");
    setEstudiante(null);
    setBecasEstudiante([]);
  }

  function handleEditBeca(beca: BecaEstudiante) {
    setBecaToEdit(beca);
    setEditarBecaModalOpen(true);
  }

  function handleCloseEditarBecaModal(shouldReload?: boolean) {
    setEditarBecaModalOpen(false);
    setBecaToEdit(null);
    if (shouldReload && estudiante) {
      cargarBecasEstudiante(estudiante.idEstudiante);
    }
  }

  async function handleRecalcularDescuentos() {
    if (!estudiante) return;

    setLoadingRecalcular(true);
    try {
      const result = await recalcularDescuentosBecas(estudiante.idEstudiante);
      if (result.recibosActualizados > 0) {
        toast.success(`Se actualizaron ${result.recibosActualizados} recibo(s) con los descuentos de beca`);
      } else {
        toast.info("No hay recibos pendientes para actualizar");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al recalcular descuentos");
      console.error(error);
    } finally {
      setLoadingRecalcular(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8" />
          Gestión de Becas
        </h1>
        <p className="text-muted-foreground">
          Administra el catálogo de becas y asigna becas a estudiantes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="catalogo">Catálogo de Becas</TabsTrigger>
          <TabsTrigger value="asignar">Asignar Beca</TabsTrigger>
        </TabsList>
        <TabsContent value="catalogo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <Button onClick={() => setCreateCatalogoModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Beca
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Búsqueda</Label>
                  <Input
                    value={busquedaCatalogo}
                    onChange={(e) => setBusquedaCatalogo(e.target.value)}
                    placeholder="Nombre o clave..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={tipoFiltroCatalogo} onValueChange={setTipoFiltroCatalogo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                      <SelectItem value="MONTO">Monto Fijo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={soloActivosCatalogo ? "activos" : "todos"}
                    onValueChange={(v) => setSoloActivosCatalogo(v === "activos")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="activos">Solo activos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={cargarCatalogo} className="w-full">
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Becas Registradas ({catalogoFiltrado.length})</CardTitle>
              <CardDescription>
                Tipos de becas disponibles para asignar a estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCatalogo ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando catálogo...
                </div>
              ) : catalogoFiltrado.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay becas en el catálogo</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setCreateCatalogoModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primera beca
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clave</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalogoFiltrado.map((beca) => (
                      <TableRow key={beca.idBeca}>
                        <TableCell className="font-mono font-semibold">
                          {beca.clave}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{beca.nombre}</div>
                            {beca.descripcion && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {beca.descripcion}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={beca.tipo === "PORCENTAJE" ? "default" : "secondary"}>
                            {beca.tipo === "PORCENTAJE" ? "Porcentaje" : "Monto Fijo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {beca.tipo === "PORCENTAJE"
                            ? `${beca.valor}%`
                            : `$${beca.valor.toLocaleString("es-MX")}`}
                          {beca.topeMensual && (
                            <div className="text-xs text-muted-foreground">
                              Tope: ${beca.topeMensual.toLocaleString("es-MX")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {beca.conceptoPago?.nombre || "Todos los conceptos"}
                        </TableCell>
                        <TableCell>
                          {beca.activo ? (
                            <Badge variant="default">Activa</Badge>
                          ) : (
                            <Badge variant="secondary">Inactiva</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCatalogo(beca)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCambiarEstadoCatalogo(beca.idBeca, !beca.activo)}
                            >
                              <Power
                                className={`w-4 h-4 ${beca.activo ? "text-green-600" : "text-gray-400"}`}
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asignar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Estudiante
              </CardTitle>
              <CardDescription>
                Ingresa la matrícula del estudiante para ver sus becas y asignar nuevas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ej: L00579"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") buscarEstudiante();
                    }}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={buscarEstudiante} disabled={loadingEstudiante}>
                    {loadingEstudiante ? "Buscando..." : "Buscar"}
                  </Button>
                  {estudiante && (
                    <Button variant="outline" onClick={limpiarBusqueda}>
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {estudiante && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{estudiante.nombreCompleto}</CardTitle>
                      <CardDescription className="flex gap-4 mt-1">
                        <span>Matrícula: <strong>{estudiante.matricula}</strong></span>
                        <span>Plan: <strong>{estudiante.planEstudios}</strong></span>
                        {estudiante.email && <span>Email: {estudiante.email}</span>}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRecalcularDescuentos}
                      disabled={loadingRecalcular}
                      title="Aplicar becas a recibos pendientes"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingRecalcular ? "animate-spin" : ""}`} />
                      {loadingRecalcular ? "Aplicando..." : "Aplicar a Recibos"}
                    </Button>
                    <Button onClick={() => setAsignarBecaModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Asignar Beca
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
          {estudiante && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Becas Asignadas ({becasEstudiante.length})
                </CardTitle>
                <CardDescription>
                  {becasEstudiante.filter((b) => b.activo).length} activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBecas ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando becas...
                  </div>
                ) : becasEstudiante.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      Este estudiante no tiene becas asignadas
                    </p>
                    <Button variant="outline" onClick={() => setAsignarBecaModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Asignar Primera Beca
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Período / Vigencia</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Observaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {becasEstudiante.map((beca) => (
                        <TableRow key={beca.idBecaAsignacion}>
                          <TableCell>
                            <Badge variant={beca.tipo === "PORCENTAJE" ? "default" : "secondary"}>
                              {beca.tipo === "PORCENTAJE" ? "Porcentaje" : "Monto Fijo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {beca.tipo === "PORCENTAJE"
                              ? `${beca.valor}%`
                              : `$${beca.valor.toLocaleString("es-MX")}`}
                          </TableCell>
                          <TableCell>
                            {beca.nombreConcepto || "Todos los conceptos"}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {beca.periodoAcademico ? (
                                <>
                                  <div className="font-medium">
                                    {beca.periodoAcademico.nombre}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {new Date(beca.vigenciaDesde).toLocaleDateString("es-MX")} - {beca.vigenciaHasta ? new Date(beca.vigenciaHasta).toLocaleDateString("es-MX") : "Sin fin"}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    {new Date(beca.vigenciaDesde).toLocaleDateString("es-MX")}
                                  </div>
                                  {beca.vigenciaHasta && (
                                    <div className="text-muted-foreground">
                                      hasta {new Date(beca.vigenciaHasta).toLocaleDateString("es-MX")}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {beca.activo ? (
                              <Badge variant="default">Activa</Badge>
                            ) : (
                              <Badge variant="destructive">Inactiva</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {beca.observaciones || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBeca(beca)}
                                title="Editar vigencia"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {beca.activo && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDesactivarBeca(beca.idBecaAsignacion)}
                                  title="Desactivar beca"
                                >
                                  <Power className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
          {!estudiante && !loadingEstudiante && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Busca un estudiante por su matrícula para ver y gestionar sus becas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateBecaCatalogoModal
        open={createCatalogoModalOpen}
        onClose={handleCloseCatalogoModal}
        becaToEdit={editingBecaCatalogo}
      />

      {estudiante && (
        <AsignarBecaModal
          open={asignarBecaModalOpen}
          onClose={() => {
            setAsignarBecaModalOpen(false);
            cargarBecasEstudiante(estudiante.idEstudiante);
          }}
          idEstudiante={estudiante.idEstudiante}
        />
      )}

      <EditarBecaModal
        open={editarBecaModalOpen}
        onClose={handleCloseEditarBecaModal}
        beca={becaToEdit}
      />
    </div>
  );
}
