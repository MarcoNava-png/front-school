"use client";

import React, { useState } from "react";

import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, Eye, Receipt, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  generarDocumento,
  descargarYGuardarKardex,
  descargarYGuardarConstancia,
  descargarYGuardarBoleta,
} from "@/services/estudiante-panel-service";
import type {
  DocumentosDisponiblesDto,
  TipoDocumentoDisponibleDto,
  SolicitudDocumentoResumenDto,
} from "@/types/estudiante-panel";
// eslint-disable-next-line no-duplicate-imports
import { formatCurrency, formatDate } from "@/types/estudiante-panel";

interface DocumentosTabProps {
  idEstudiante: number;
  documentos: DocumentosDisponiblesDto;
  matricula: string;
}

export function DocumentosTab({ idEstudiante, documentos, matricula }: DocumentosTabProps) {
  const [showGenerarModal, setShowGenerarModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumentoDisponibleDto | null>(null);
  const [variante, setVariante] = useState("COMPLETO");
  const [notas, setNotas] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerarDocumento = async () => {
    if (!selectedTipo) return;

    try {
      setGenerando(true);

      if (!selectedTipo.requierePago) {
        if (selectedTipo.clave === "KARDEX" || selectedTipo.clave === "KARDEX_ACADEMICO") {
          await descargarYGuardarKardex(idEstudiante, matricula, variante === "PERIODO_ACTUAL");
          toast.success("Kardex descargado exitosamente");
        } else if (selectedTipo.clave === "CONSTANCIA_ESTUDIOS" || selectedTipo.clave === "CONSTANCIA") {
          await descargarYGuardarConstancia(idEstudiante, matricula);
          toast.success("Constancia descargada exitosamente");
        } else if (selectedTipo.clave === "BOLETA" || selectedTipo.clave === "BOLETA_CALIFICACIONES") {
          await descargarYGuardarBoleta(idEstudiante, matricula);
          toast.success("Boleta descargada exitosamente");
        } else {
          const result = await generarDocumento({
            idEstudiante,
            idTipoDocumento: selectedTipo.idTipoDocumento,
            variante,
            notas: notas || undefined,
          });

          if (result.exitoso) {
            toast.success(result.mensaje);
          } else {
            toast.error(result.mensaje);
          }
        }
      } else {
        const result = await generarDocumento({
          idEstudiante,
          idTipoDocumento: selectedTipo.idTipoDocumento,
          variante,
          notas: notas || undefined,
        });

        if (result.exitoso) {
          toast.success(result.mensaje);
        } else {
          toast.error(result.mensaje);
        }
      }

      setShowGenerarModal(false);
      setSelectedTipo(null);
      setVariante("COMPLETO");
      setNotas("");
    } catch (error: unknown) {
      console.error("Error al generar documento:", error);

      // Extract error message from backend response
      let errorMessage = "Error al generar el documento";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { mensaje?: string; error?: string; Error?: string } } };
        if (axiosError.response?.data) {
          errorMessage = axiosError.response.data.mensaje
            || axiosError.response.data.error
            || axiosError.response.data.Error
            || errorMessage;
        }
      }
      toast.error(errorMessage);
    } finally {
      setGenerando(false);
    }
  };

  const getEstatusIcon = (estatus: string) => {
    switch (estatus) {
      case "GENERADO":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PENDIENTE_PAGO":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "PAGADO":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "VENCIDO":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "CANCELADO":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstatusBadge = (solicitud: SolicitudDocumentoResumenDto) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      GENERADO: {
        color: "bg-green-100 text-green-800",
        label: "Generado",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      PENDIENTE_PAGO: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pendiente de Pago",
        icon: <Receipt className="w-3 h-3 mr-1" />,
      },
      PAGADO: {
        color: "bg-blue-100 text-blue-800",
        label: "Pagado - Listo",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      VENCIDO: {
        color: "bg-red-100 text-red-800",
        label: "Vencido",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
      CANCELADO: {
        color: "bg-gray-100 text-gray-800",
        label: "Cancelado",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
    };

    const statusConfig = config[solicitud.estatus] || {
      color: "bg-gray-100 text-gray-800",
      label: solicitud.estatus,
      icon: null,
    };

    return (
      <Badge className={`${statusConfig.color} flex items-center`}>
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>
    );
  };

  const getEstatusDescription = (solicitud: SolicitudDocumentoResumenDto) => {
    switch (solicitud.estatus) {
      case "PENDIENTE_PAGO":
        return (
          <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            Pagar en caja para continuar
          </span>
        );
      case "PAGADO":
        return (
          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Control Escolar generará el documento
          </span>
        );
      case "GENERADO":
        return solicitud.estaVigente ? (
          <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Documento vigente
          </span>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Documentos Vigentes</p>
                <p className="text-2xl font-bold text-green-600">{documentos.documentosVigentes}</p>
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
                <p className="text-xs text-gray-500 uppercase">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{documentos.solicitudesPendientes}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Generados</p>
                <p className="text-2xl font-bold" style={{ color: "#14356F" }}>
                  {documentos.solicitudesGeneradas}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "rgba(20, 53, 111, 0.1)" }}>
                <FileText className="w-6 h-6" style={{ color: "#14356F" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: "#14356F" }} />
            Documentos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.tiposDisponibles.map((tipo) => (
              <Card
                key={tipo.idTipoDocumento}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  tipo.tieneSolicitudPendiente ? "border-yellow-200" : ""
                } ${tipo.tieneDocumentoVigente ? "border-green-200" : ""}`}
                onClick={() => {
                  setSelectedTipo(tipo);
                  setShowGenerarModal(true);
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(20, 53, 111, 0.1)" }}>
                      <FileText className="w-5 h-5" style={{ color: "#14356F" }} />
                    </div>
                    {tipo.tieneDocumentoVigente && (
                      <Badge className="bg-green-100 text-green-800">Vigente</Badge>
                    )}
                    {tipo.tieneSolicitudPendiente && !tipo.tieneDocumentoVigente && (
                      <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{tipo.nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1">{tipo.descripcion}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm font-medium" style={{ color: "#14356F" }}>
                      {tipo.requierePago ? formatCurrency(tipo.precio) : "Gratis"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Vigencia: {tipo.diasVigencia} días
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {documentos.solicitudesRecientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: "#14356F" }} />
              Historial de Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow
                  className="hover:bg-transparent"
                  style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
                >
                  <TableHead className="text-white font-semibold">Folio</TableHead>
                  <TableHead className="text-white font-semibold">Documento</TableHead>
                  <TableHead className="text-white font-semibold">Variante</TableHead>
                  <TableHead className="text-white font-semibold text-center">Fecha Solicitud</TableHead>
                  <TableHead className="text-white font-semibold text-center">Estatus</TableHead>
                  <TableHead className="text-white font-semibold text-center">Info</TableHead>
                  <TableHead className="text-white font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.solicitudesRecientes.map((solicitud) => (
                  <TableRow
                    key={solicitud.idSolicitud}
                    className={
                      solicitud.estatus === "PENDIENTE_PAGO"
                        ? "bg-yellow-50/50"
                        : solicitud.estatus === "PAGADO"
                          ? "bg-blue-50/50"
                          : ""
                    }
                  >
                    <TableCell className="font-mono text-sm">
                      {solicitud.folioSolicitud}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{solicitud.tipoDocumento}</span>
                        {solicitud.estatus === "GENERADO" && solicitud.fechaVencimiento && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Vence: {formatDate(solicitud.fechaVencimiento)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{solicitud.variante}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDate(solicitud.fechaSolicitud)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getEstatusBadge(solicitud)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getEstatusDescription(solicitud)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {solicitud.puedeDescargar && solicitud.estatus === "GENERADO" && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Descargar documento"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                        {solicitud.estatus === "PENDIENTE_PAGO" && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Ver recibo"
                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                          >
                            <Receipt className="w-4 h-4 mr-1" />
                            Ver Recibo
                          </Button>
                        )}
                        {solicitud.estatus === "PAGADO" && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            En proceso
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showGenerarModal} onOpenChange={setShowGenerarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Documento</DialogTitle>
            <DialogDescription>
              {selectedTipo?.nombre}
            </DialogDescription>
          </DialogHeader>

          {selectedTipo && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="font-bold" style={{ color: "#14356F" }}>
                    {selectedTipo.requierePago ? formatCurrency(selectedTipo.precio) : "Gratis"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Vigencia:</span>
                  <span className="font-medium">{selectedTipo.diasVigencia} días</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Variante del documento</Label>
                <Select value={variante} onValueChange={setVariante}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar variante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETO">Completo</SelectItem>
                    <SelectItem value="PERIODO_ACTUAL">Solo período actual</SelectItem>
                    <SelectItem value="BASICO">Básico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas adicionales para el documento..."
                  rows={2}
                />
              </div>

              {selectedTipo.requierePago && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Este documento requiere pago. Se generará un recibo que deberá ser pagado
                    antes de poder descargar el documento.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerarModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerarDocumento}
              disabled={generando}
              style={{ background: "linear-gradient(to right, #14356F, #1e4a8f)" }}
            >
              <Download className="w-4 h-4 mr-2" />
              {generando ? "Generando..." : "Generar Documento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
