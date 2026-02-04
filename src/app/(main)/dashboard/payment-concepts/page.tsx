"use client";

import { useEffect, useState } from "react";

import { Plus, DollarSign, Edit, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  listarConceptosPago,
  cambiarEstadoConceptoPago,
  eliminarConceptoPago,
} from "@/services/conceptos-pago-service";
import { ConceptoPago } from "@/types/receipt";

import { CreateConceptModal } from "./_components/create-concept-modal";

export default function PaymentConceptsPage() {
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("TODOS");
  const [soloActivos, setSoloActivos] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingConcepto, setEditingConcepto] = useState<ConceptoPago | null>(null);

  useEffect(() => {
    cargarConceptos();
  }, [tipoFiltro, soloActivos]);

  async function cargarConceptos() {
    setLoading(true);
    try {
      const data = await listarConceptosPago({
        soloActivos,
        tipo: tipoFiltro !== "TODOS" ? tipoFiltro : undefined,
        busqueda: busqueda || undefined,
      });
      setConceptos(data);
    } catch (error) {
      toast.error("Error al cargar conceptos de pago");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCambiarEstado(id: number, activo: boolean) {
    try {
      await cambiarEstadoConceptoPago(id, activo);
      toast.success(activo ? "Concepto activado" : "Concepto desactivado");
      cargarConceptos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar estado");
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este concepto? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await eliminarConceptoPago(id);
      toast.success("Concepto eliminado exitosamente");
      cargarConceptos();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "No se puede eliminar el concepto. Puede estar en uso en recibos o plantillas."
      );
    }
  }

  function handleEdit(concepto: ConceptoPago) {
    setEditingConcepto(concepto);
    setCreateModalOpen(true);
  }

  function handleCloseModal(shouldReload?: boolean) {
    setCreateModalOpen(false);
    setEditingConcepto(null);
    if (shouldReload) {
      cargarConceptos();
    }
  }

  const tiposConcepto = [
    "INSCRIPCION",
    "COLEGIATURA",
    "EXAMEN",
    "CONSTANCIA",
    "CREDENCIAL",
    "SEGURO",
    "OTRO",
  ];

  const getBadgeVariant = (tipo: string | undefined) => {
    if (!tipo) return "outline";

    switch (tipo) {
      case "INSCRIPCION":
        return "default";
      case "COLEGIATURA":
        return "default";
      case "EXAMEN":
        return "secondary";
      case "CONSTANCIA":
        return "outline";
      case "CREDENCIAL":
        return "outline";
      case "SEGURO":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading && conceptos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando conceptos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Conceptos de Pago
          </h1>
          <p className="text-muted-foreground">
            Administra los conceptos de cobro disponibles en el sistema
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Concepto
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") cargarConceptos();
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los tipos</SelectItem>
                  {tiposConcepto.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.replace("_", " ")}
                    </SelectItem>
                  ))}
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
              <Button onClick={cargarConceptos} className="w-full">
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Conceptos Registrados ({conceptos.length})</CardTitle>
          <CardDescription>
            Gestiona los conceptos de pago utilizados en recibos y plantillas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conceptos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay conceptos registrados</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer concepto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permite Beca</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conceptos.map((concepto) => (
                  <TableRow key={concepto.idConceptoPago}>
                    <TableCell className="font-mono font-semibold">
                      {concepto.clave}
                    </TableCell>
                    <TableCell className="font-medium">{concepto.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(concepto.tipo)}>
                        {concepto.tipo?.replace("_", " ") || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {concepto.descripcion || "-"}
                    </TableCell>
                    <TableCell>
                      {concepto.permiteBeca ? (
                        <Badge variant="default" className="bg-green-600">
                          Sí
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {concepto.status === 1 ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(concepto)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCambiarEstado(concepto.idConceptoPago, concepto.status !== 1)
                          }
                        >
                          <Power
                            className={`w-4 h-4 ${concepto.status === 1 ? "text-green-600" : "text-gray-400"}`}
                          />
                        </Button>
                        {concepto.status !== 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(concepto.idConceptoPago)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
      <CreateConceptModal
        open={createModalOpen}
        onClose={handleCloseModal}
        conceptoToEdit={editingConcepto}
      />
    </div>
  );
}
