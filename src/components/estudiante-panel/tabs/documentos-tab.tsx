"use client";

import { useState } from "react";
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

      // Si es documento que se puede generar directo (sin pago)
      if (!selectedTipo.requierePago) {
        // Descargar directamente según el tipo
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
          // Crear solicitud para otros documentos
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
        // Crear solicitud que requiere pago
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
    } catch (error) {
      toast.error("Error al generar el documento");
      console.error(error);
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
    const colors: Record<string, string> = {
      GENERADO: "bg-green-100 text-green-800",
      PENDIENTE_PAGO: "bg-yellow-100 text-yellow-800",
      PAGADO: "bg-blue-100 text-blue-800",
      VENCIDO: "bg-red-100 text-red-800",
      CANCELADO: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[solicitud.estatus] || "bg-gray-100 text-gray-800"}>
        {solicitud.estatus.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumen de documentos */}
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

      {/* Tipos de documentos disponibles */}
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

      {/* Historial de solicitudes */}
      {documentos.solicitudesRecientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead className="text-center">Fecha Solicitud</TableHead>
                  <TableHead className="text-center">Fecha Generación</TableHead>
                  <TableHead className="text-center">Vencimiento</TableHead>
                  <TableHead className="text-center">Estatus</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.solicitudesRecientes.map((solicitud) => (
                  <TableRow key={solicitud.idSolicitud}>
                    <TableCell className="font-mono text-sm">
                      {solicitud.folioSolicitud}
                    </TableCell>
                    <TableCell>{solicitud.tipoDocumento}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{solicitud.variante}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDate(solicitud.fechaSolicitud)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {solicitud.fechaGeneracion ? formatDate(solicitud.fechaGeneracion) : "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {solicitud.fechaVencimiento ? formatDate(solicitud.fechaVencimiento) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getEstatusBadge(solicitud)}
                    </TableCell>
                    <TableCell className="text-center">
                      {solicitud.puedeDescargar && (
                        <Button variant="ghost" size="icon" title="Descargar">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {solicitud.codigoVerificacion && (
                        <Button variant="ghost" size="icon" title="Ver código QR">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal para generar documento */}
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
