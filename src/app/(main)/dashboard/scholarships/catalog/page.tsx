"use client";

import { useEffect, useState } from "react";

import { Award, Edit, Plus, Power } from "lucide-react";
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
import {
  activarBecaCatalogo,
  desactivarBecaCatalogo,
  obtenerCatalogoBecas,
} from "@/services/beca-catalogo-service";
import { BecaCatalogo } from "@/types/receipt";

import { CreateBecaCatalogoModal } from "./_components/create-beca-catalogo-modal";

export default function BecaCatalogoPage() {
  const [becas, setBecas] = useState<BecaCatalogo[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("TODOS");
  const [soloActivos, setSoloActivos] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBeca, setEditingBeca] = useState<BecaCatalogo | null>(null);

  useEffect(() => {
    cargarBecas();
  }, [soloActivos]);

  async function cargarBecas() {
    setLoading(true);
    try {
      const data = await obtenerCatalogoBecas(soloActivos ? true : undefined);
      setBecas(data);
    } catch (error) {
      toast.error("Error al cargar catálogo de becas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarEstado(id: number, activar: boolean) {
    try {
      if (activar) {
        await activarBecaCatalogo(id);
        toast.success("Beca activada");
      } else {
        await desactivarBecaCatalogo(id);
        toast.success("Beca desactivada");
      }
      cargarBecas();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al cambiar estado");
    }
  }

  function handleEdit(beca: BecaCatalogo) {
    setEditingBeca(beca);
    setCreateModalOpen(true);
  }

  function handleCloseModal(shouldReload?: boolean) {
    setCreateModalOpen(false);
    setEditingBeca(null);
    if (shouldReload) {
      cargarBecas();
    }
  }

  const becasFiltradas = becas.filter((b) => {
    const matchBusqueda =
      !busqueda ||
      b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.clave.toLowerCase().includes(busqueda.toLowerCase());

    const matchTipo = tipoFiltro === "TODOS" || b.tipo === tipoFiltro;

    return matchBusqueda && matchTipo;
  });

  if (loading && becas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando catálogo de becas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8" />
            Catálogo de Becas
          </h1>
          <p className="text-muted-foreground">
            Define los tipos de becas disponibles para asignar a estudiantes
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Beca
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Búsqueda</label>
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o clave..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
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
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={soloActivos ? "activos" : "todos"}
                onValueChange={(v) => setSoloActivos(v === "activos")}
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
              <Button onClick={cargarBecas} className="w-full">
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Becas Registradas ({becasFiltradas.length})</CardTitle>
          <CardDescription>
            Tipos de becas disponibles para asignar a estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {becasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay becas en el catálogo</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
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
                {becasFiltradas.map((beca) => (
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
                      <Badge
                        variant={beca.tipo === "PORCENTAJE" ? "default" : "secondary"}
                      >
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
                          onClick={() => handleEdit(beca)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCambiarEstado(beca.idBeca, !beca.activo)}
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
      <CreateBecaCatalogoModal
        open={createModalOpen}
        onClose={handleCloseModal}
        becaToEdit={editingBeca}
      />
    </div>
  );
}
