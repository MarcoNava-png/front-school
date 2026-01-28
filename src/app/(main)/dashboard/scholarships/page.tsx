"use client";

import { useState } from "react";

import Link from "next/link";

import { Award, Plus, Power, Settings } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { desactivarBeca, listarBecasEstudiante } from "@/services/becas-service";
import { BecaEstudiante } from "@/types/receipt";

import { AsignarBecaModal } from "./_components/asignar-beca-modal";

export default function ScholarshipsPage() {
  const [becas, setBecas] = useState<BecaEstudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [matricula, setMatricula] = useState("");
  const [idEstudiante, setIdEstudiante] = useState<number | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  async function buscarBecas() {
    if (!idEstudiante) {
      toast.error("Primero busca un estudiante");
      return;
    }

    setLoading(true);
    try {
      const data = await listarBecasEstudiante(idEstudiante);
      setBecas(data);
    } catch (error) {
      toast.error("Error al cargar becas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDesactivar(idBecaAsignacion: number) {
    if (!confirm("¿Seguro que deseas desactivar esta beca?")) return;

    try {
      await desactivarBeca(idBecaAsignacion);
      toast.success("Beca desactivada exitosamente");
      buscarBecas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al desactivar beca");
    }
  }

  function handleBuscarEstudiante() {
    // TODO: Implementar búsqueda real de estudiante por matrícula
    // Por ahora usar un ID mock
    if (matricula) {
      setIdEstudiante(1); // Mock
      toast.info("Estudiante encontrado (mock)");
      setTimeout(() => buscarBecas(), 500);
    } else {
      toast.error("Ingresa una matrícula");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8" />
            Gestión de Becas
          </h1>
          <p className="text-muted-foreground">
            Administra becas y descuentos para estudiantes
          </p>
        </div>
        <Link href="/dashboard/scholarships/catalog">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Catálogo de Becas
          </Button>
        </Link>
      </div>

      {/* Búsqueda de Estudiante */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Estudiante</CardTitle>
          <CardDescription>Ingresa la matrícula del estudiante para gestionar sus becas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ej: 2024001"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBuscarEstudiante();
                }}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleBuscarEstudiante}>Buscar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Becas */}
      {idEstudiante && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Becas del Estudiante ({becas.length})</CardTitle>
                <CardDescription>
                  {becas.filter((b) => b.activo).length} activas
                </CardDescription>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Beca
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando becas...</div>
            ) : becas.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No hay becas registradas</p>
                <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Beca
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becas.map((beca) => (
                    <TableRow key={beca.idBecaAsignacion}>
                      <TableCell>
                        <Badge variant={beca.tipo === "PORCENTAJE" ? "default" : "secondary"}>
                          {beca.tipo === "PORCENTAJE" ? "Porcentaje" : "Monto Fijo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {beca.tipo === "PORCENTAJE" ? `${beca.valor}%` : `$${beca.valor.toLocaleString("es-MX")}`}
                      </TableCell>
                      <TableCell>
                        {beca.nombreConcepto || "Todos los conceptos"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {new Date(beca.vigenciaDesde).toLocaleDateString("es-MX")}
                          </div>
                          {beca.vigenciaHasta && (
                            <div className="text-muted-foreground">
                              hasta {new Date(beca.vigenciaHasta).toLocaleDateString("es-MX")}
                            </div>
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
                        {beca.observaciones}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {beca.activo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesactivar(beca.idBecaAsignacion)}
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

      {/* Modal */}
      {idEstudiante && (
        <AsignarBecaModal
          open={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            buscarBecas();
          }}
          idEstudiante={idEstudiante}
        />
      )}
    </div>
  );
}
