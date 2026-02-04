"use client";

import { useState } from "react";

import { Award, Calendar, CheckCircle, XCircle, Plus, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BecaAsignadaDto } from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { formatCurrency, formatDate } from "@/types/estudiante-panel";

interface BecasTabProps {
  idEstudiante: number;
  becas: BecaAsignadaDto[];
  onUpdate: () => void;
}

export function BecasTab({ idEstudiante, becas, onUpdate }: BecasTabProps) {
  const [showAsignarModal, setShowAsignarModal] = useState(false);

  const becasActivas = becas.filter((b) => b.activo && b.estaVigente);
  const becasInactivas = becas.filter((b) => !b.activo || !b.estaVigente);

  const calcularDescuentoTotal = () => {
    return becasActivas.reduce((total, beca) => {
      if (beca.tipo === "PORCENTAJE") {
        return total + beca.valor;
      }
      return total;
    }, 0);
  };

  const calcularMontoTotal = () => {
    return becasActivas.reduce((total, beca) => {
      if (beca.tipo === "MONTO") {
        return total + beca.valor;
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 uppercase font-medium">Becas Activas</p>
                <p className="text-3xl font-bold text-purple-700">{becasActivas.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-200">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 uppercase font-medium">Descuento Total</p>
                <p className="text-3xl font-bold text-green-700">
                  {calcularDescuentoTotal() > 0 ? `${calcularDescuentoTotal()}%` : "-"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-200">
                <Percent className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 uppercase font-medium">Monto Fijo</p>
                <p className="text-3xl font-bold text-blue-700">
                  {calcularMontoTotal() > 0 ? formatCurrency(calcularMontoTotal()) : "-"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-200">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: "#14356F" }} />
            Becas Activas
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAsignarModal(true)}
            style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Asignar Beca
          </Button>
        </CardHeader>
        <CardContent>
          {becasActivas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {becasActivas.map((beca) => (
                <BecaCard key={beca.idBecaAsignacion} beca={beca} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>El estudiante no tiene becas activas</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowAsignarModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Asignar primera beca
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {becasInactivas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-600">Historial de Becas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {becasInactivas.map((beca) => (
                  <TableRow key={beca.idBecaAsignacion} className="text-gray-500">
                    <TableCell>
                      <div>
                        <p className="font-medium">{beca.nombreBeca || "Beca personalizada"}</p>
                        {beca.claveBeca && (
                          <p className="text-xs text-gray-400">{beca.claveBeca}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{beca.tipo}</TableCell>
                    <TableCell>{beca.descripcionDescuento}</TableCell>
                    <TableCell>
                      {formatDate(beca.vigenciaDesde)} - {beca.vigenciaHasta ? formatDate(beca.vigenciaHasta) : "Indefinida"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {beca.activo ? "Vencida" : "Cancelada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAsignarModal} onOpenChange={setShowAsignarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Beca</DialogTitle>
            <DialogDescription>
              Selecciona una beca del catálogo o crea una beca personalizada para este estudiante.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 text-center">
              Funcionalidad en desarrollo.
              <br />
              Por favor, usa el módulo de Becas para asignar una beca.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAsignarModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BecaCardProps {
  beca: BecaAsignadaDto;
}

function BecaCard({ beca }: BecaCardProps) {
  return (
    <Card className="border-purple-200 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {beca.nombreBeca || "Beca personalizada"}
              </p>
              {beca.claveBeca && (
                <p className="text-xs text-gray-500">{beca.claveBeca}</p>
              )}
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activa
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
            <span className="text-sm text-gray-600">Descuento:</span>
            <span className="text-lg font-bold text-purple-700">
              {beca.descripcionDescuento}
            </span>
          </div>

          {beca.conceptoPago && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Aplica a:</span>
              <span className="font-medium">{beca.conceptoPago}</span>
            </div>
          )}

          {beca.topeMensual && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tope mensual:</span>
              <span className="font-medium">{formatCurrency(beca.topeMensual)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Vigencia:</span>
            <span className="font-medium">
              {formatDate(beca.vigenciaDesde)}
              {beca.vigenciaHasta ? ` - ${formatDate(beca.vigenciaHasta)}` : " (Indefinida)"}
            </span>
          </div>

          {beca.observaciones && (
            <div className="pt-2 mt-2 border-t">
              <p className="text-xs text-gray-500 italic">{beca.observaciones}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
