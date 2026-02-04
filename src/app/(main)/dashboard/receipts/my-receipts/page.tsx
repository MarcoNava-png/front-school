"use client";

import { useEffect, useState } from "react";

import { Download, FileText, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { ReceiptDetailsModal } from "@/components/receipts/receipt-details-modal";
import { ReceiptStatusBadge } from "@/components/receipts/receipt-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatCurrency,
  calcularRecargo,
  calcularDiasVencido,
  descargarReciboPDF as descargarPDF,
} from "@/lib/payment-utils";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { listarRecibos, descargarReciboPDF } from "@/services/receipts-service";
import { AcademicPeriod } from "@/types/academic-period";
import { Receipt, ReceiptStatus } from "@/types/receipt";

const MOCK_STUDENT_ID = 1;

export default function MyReceiptsPage() {
  const [recibos, setRecibos] = useState<Receipt[]>([]);
  const [periodos, setPeriodos] = useState<AcademicPeriod[]>([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("TODOS");
  const [selectedEstatus, setSelectedEstatus] = useState<string>("TODOS");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    cargarPeriodos();
    cargarRecibos();
  }, [selectedPeriodo, selectedEstatus]);

  async function cargarPeriodos() {
    try {
      const data = await getAcademicPeriodsList();
      setPeriodos(data.items);
    } catch (error) {
      console.error("Error al cargar periodos:", error);
    }
  }

  async function cargarRecibos() {
    setLoading(true);
    try {
      const filtros: any = {
        idEstudiante: MOCK_STUDENT_ID,
      };

      if (selectedPeriodo !== "TODOS") {
        filtros.idPeriodoAcademico = parseInt(selectedPeriodo);
      }

      if (selectedEstatus !== "TODOS") {
        filtros.estatus = parseInt(selectedEstatus);
      }

      const data = await listarRecibos(filtros);
      setRecibos(data);
    } catch (error) {
      toast.error("Error al cargar recibos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDescargarPDF(recibo: Receipt) {
    try {
      const blob = await descargarReciboPDF(recibo.idRecibo);
      descargarPDF(blob, recibo.folio!);
      toast.success("Recibo descargado");
    } catch {
      toast.error("Error al descargar recibo");
    }
  }

  const totalPendiente = recibos
    .filter((r) =>
      [ReceiptStatus.PENDIENTE, ReceiptStatus.PARCIAL, ReceiptStatus.VENCIDO].includes(r.estatus as ReceiptStatus)
    )
    .reduce((sum, r) => sum + r.saldo, 0);

  const recibosVencidos = recibos.filter((r) => r.estatus === ReceiptStatus.VENCIDO);
  const totalRecargos = recibosVencidos.reduce(
    (sum, r) => sum + calcularRecargo(r.fechaVencimiento, r.saldo),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Mis Recibos
        </h1>
        <p className="text-muted-foreground">Consulta y descarga tus recibos de pago</p>
      </div>

      {recibosVencidos.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recibos Vencidos</AlertTitle>
          <AlertDescription>
            Tienes {recibosVencidos.length} recibo(s) vencido(s). Total de recargos:{" "}
            {formatCurrency(totalRecargos)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Recibos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recibos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPendiente)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recibos Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{recibosVencidos.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra tus recibos por periodo y estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periodo Académico</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los Periodos</SelectItem>
                  {periodos.map((periodo) => (
                    <SelectItem
                      key={periodo.idPeriodoAcademico}
                      value={periodo.idPeriodoAcademico.toString()}
                    >
                      {periodo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={selectedEstatus} onValueChange={setSelectedEstatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value={ReceiptStatus.PENDIENTE.toString()}>Pendientes</SelectItem>
                  <SelectItem value={ReceiptStatus.PARCIAL.toString()}>
                    Pago Parcial
                  </SelectItem>
                  <SelectItem value={ReceiptStatus.VENCIDO.toString()}>Vencidos</SelectItem>
                  <SelectItem value={ReceiptStatus.PAGADO.toString()}>Pagados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recibos ({recibos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando recibos...</div>
          ) : recibos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron recibos
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Recargo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.map((recibo) => {
                  const recargo = calcularRecargo(recibo.fechaVencimiento, recibo.saldo);
                  const diasVencido = calcularDiasVencido(recibo.fechaVencimiento);

                  return (
                    <TableRow key={recibo.idRecibo}>
                      <TableCell className="font-mono font-semibold">{recibo.folio}</TableCell>
                      <TableCell>{recibo.nombrePeriodo}</TableCell>
                      <TableCell>
                        {new Date(recibo.fechaEmision).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(recibo.fechaVencimiento).toLocaleDateString("es-MX")}
                          {diasVencido > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {diasVencido} día(s) vencido
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(recibo.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {recibo.saldo > 0 ? (
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(recibo.saldo)}
                          </span>
                        ) : (
                          <span className="text-green-600">Pagado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {recargo > 0 ? (
                          <span className="text-red-600 font-semibold">
                            +{formatCurrency(recargo)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <ReceiptStatusBadge status={recibo.estatus as ReceiptStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(recibo)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDescargarPDF(recibo)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReceiptDetailsModal
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
