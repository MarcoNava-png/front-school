"use client";

import { useState, useEffect } from "react";

import { DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerRecibosEstudiante } from "@/services/estudiante-panel-service";
import type { ResumenRecibosDto, ReciboPanelResumenDto } from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { formatCurrency, formatDate, ESTATUS_RECIBO_COLORS } from "@/types/estudiante-panel";

interface RecibosTabProps {
  idEstudiante: number;
  resumenRecibos: ResumenRecibosDto;
}

export function RecibosTab({ idEstudiante, resumenRecibos }: RecibosTabProps) {
  const [recibos, setRecibos] = useState<ReciboPanelResumenDto[]>(resumenRecibos.ultimosRecibos);
  const [loading, setLoading] = useState(false);
  const [filtroEstatus, setFiltroEstatus] = useState<string>("todos");

  const cargarRecibos = async (estatus?: string) => {
    try {
      setLoading(true);
      const data = await obtenerRecibosEstudiante(
        idEstudiante,
        estatus === "todos" ? undefined : estatus
      );
      setRecibos(data);
    } catch (error) {
      toast.error("Error al cargar los recibos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filtroEstatus !== "todos") {
      cargarRecibos(filtroEstatus);
    } else {
      setRecibos(resumenRecibos.ultimosRecibos);
    }
  }, [filtroEstatus]);

  const getEstatusIcon = (estatus: string, estaVencido: boolean) => {
    if (estaVencido) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    switch (estatus) {
      case "PAGADO":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PENDIENTE":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "VENCIDO":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstatusBadge = (recibo: ReciboPanelResumenDto) => {
    const estatus = recibo.estaVencido ? "VENCIDO" : recibo.estatus;
    const colors = ESTATUS_RECIBO_COLORS[estatus] || ESTATUS_RECIBO_COLORS["PENDIENTE"];

    return (
      <Badge className={`${colors.bg} ${colors.text}`}>
        {estatus}
        {recibo.diasVencido && recibo.diasVencido > 0 && ` (${recibo.diasVencido}d)`}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={resumenRecibos.totalAdeudo > 0 ? "border-red-200" : "border-green-200"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Adeudo Total</p>
                <p className={`text-2xl font-bold ${resumenRecibos.totalAdeudo > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(resumenRecibos.totalAdeudo)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${resumenRecibos.totalAdeudo > 0 ? "bg-red-50" : "bg-green-50"}`}>
                <DollarSign className={`w-6 h-6 ${resumenRecibos.totalAdeudo > 0 ? "text-red-500" : "text-green-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumenRecibos.totalPagado)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Descuentos Aplicados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(resumenRecibos.totalDescuentosAplicados)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={resumenRecibos.recibosVencidos > 0 ? "border-red-200" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Recibos</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {resumenRecibos.recibosPendientes} pend.
                  </Badge>
                  {resumenRecibos.recibosVencidos > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {resumenRecibos.recibosVencidos} venc.
                    </Badge>
                  )}
                  <Badge className="bg-green-100 text-green-800">
                    {resumenRecibos.recibosPagados} pag.
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {resumenRecibos.proximoVencimiento && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Próximo Vencimiento</p>
                  <p className="text-lg font-bold text-yellow-900">
                    {resumenRecibos.proximoVencimiento.concepto}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Vence: {formatDate(resumenRecibos.proximoVencimiento.fechaVencimiento)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(resumenRecibos.proximoVencimiento.saldo)}
                </p>
                <p className="text-sm text-yellow-700">
                  Folio: {resumenRecibos.proximoVencimiento.folio}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: "#14356F" }} />
            Historial de Recibos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filtroEstatus} onValueChange={setFiltroEstatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                <SelectItem value="VENCIDO">Vencidos</SelectItem>
                <SelectItem value="PAGADO">Pagados</SelectItem>
                <SelectItem value="PARCIAL">Parciales</SelectItem>
                <SelectItem value="CANCELADO">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => cargarRecibos(filtroEstatus === "todos" ? undefined : filtroEstatus)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-center">Emisión</TableHead>
                  <TableHead className="text-center">Vencimiento</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.length > 0 ? (
                  recibos.map((recibo) => (
                    <TableRow key={recibo.idRecibo}>
                      <TableCell className="font-mono text-sm">
                        {recibo.folio}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={recibo.concepto || undefined}>
                          {recibo.concepto}
                        </div>
                        {recibo.nombrePeriodo && (
                          <p className="text-xs text-gray-500">{recibo.nombrePeriodo}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDate(recibo.fechaEmision)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDate(recibo.fechaVencimiento)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(recibo.subtotal)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {recibo.descuento > 0 ? `-${formatCurrency(recibo.descuento)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(recibo.total)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${recibo.saldo > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(recibo.saldo)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getEstatusBadge(recibo)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No hay recibos que mostrar
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
