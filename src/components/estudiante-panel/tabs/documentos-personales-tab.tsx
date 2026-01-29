"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, XCircle, ExternalLink, FolderOpen, AlertCircle } from "lucide-react";

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

import { obtenerDocumentosPersonales } from "@/services/estudiante-panel-service";
import type { DocumentosPersonalesEstudianteDto } from "@/types/estudiante-panel";
import { formatDate } from "@/types/estudiante-panel";

interface DocumentosPersonalesTabProps {
  idEstudiante: number;
}

export function DocumentosPersonalesTab({ idEstudiante }: DocumentosPersonalesTabProps) {
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<DocumentosPersonalesEstudianteDto | null>(null);

  useEffect(() => {
    cargarDocumentos();
  }, [idEstudiante]);

  async function cargarDocumentos() {
    setLoading(true);
    try {
      const data = await obtenerDocumentosPersonales(idEstudiante);
      setDocumentos(data);
    } catch (error) {
      console.error("Error al cargar documentos personales:", error);
      // No mostrar error si simplemente no hay documentos
    } finally {
      setLoading(false);
    }
  }

  const getEstatusIcon = (estatus: string) => {
    switch (estatus) {
      case "VALIDADO":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "SUBIDO":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "PENDIENTE":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "RECHAZADO":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstatusBadge = (estatus: string) => {
    const colors: Record<string, string> = {
      VALIDADO: "bg-green-100 text-green-800",
      SUBIDO: "bg-blue-100 text-blue-800",
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      RECHAZADO: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[estatus] || "bg-gray-100 text-gray-800"}>
        {estatus}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#14356F" }}></div>
      </div>
    );
  }

  if (!documentos || documentos.documentos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin documentos personales</h3>
            <p className="text-gray-500">
              No se encontraron documentos personales para este estudiante.
              <br />
              Los documentos se cargan durante el proceso de inscripción como aspirante.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Documentos</p>
                <p className="text-2xl font-bold" style={{ color: "#14356F" }}>
                  {documentos.totalDocumentos}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: "rgba(20, 53, 111, 0.1)" }}>
                <FileText className="w-6 h-6" style={{ color: "#14356F" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Validados</p>
                <p className="text-2xl font-bold text-green-600">{documentos.documentosValidados}</p>
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
                <p className="text-xs text-gray-500 uppercase">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{documentos.documentosPendientes}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5" style={{ color: "#14356F" }} />
            Expediente Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead className="text-center">Obligatorio</TableHead>
                <TableHead className="text-center">Fecha Subido</TableHead>
                <TableHead className="text-center">Estatus</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.documentos.map((doc) => (
                <TableRow key={doc.idAspiranteDocumento}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEstatusIcon(doc.estatus)}
                      <div>
                        <p className="font-medium">{doc.nombreDocumento}</p>
                        <p className="text-xs text-gray-500">{doc.claveDocumento}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.esObligatorio ? (
                      <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {doc.fechaSubido ? formatDate(doc.fechaSubido) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {getEstatusBadge(doc.estatus)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-500">
                    {doc.notas || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.urlArchivo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.urlArchivo!, "_blank")}
                        title="Ver documento"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
