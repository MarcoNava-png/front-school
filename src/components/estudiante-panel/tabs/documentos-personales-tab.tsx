"use client";

import { useEffect, useRef, useState } from "react";

import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  FolderOpen,
  AlertCircle,
  Upload,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  obtenerDocumentosPersonales,
  subirDocumentoPersonal,
  validarDocumentoPersonal,
} from "@/services/estudiante-panel-service";
import { formatDate, type DocumentoPersonalDto, type DocumentosPersonalesEstudianteDto } from "@/types/estudiante-panel";

interface DocumentosPersonalesTabProps {
  idEstudiante: number;
}

const EXTENSIONES_PERMITIDAS = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_SIZE_MB = 10;

type ModalType = "subir" | "validar" | null;

export function DocumentosPersonalesTab({ idEstudiante }: DocumentosPersonalesTabProps) {
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<DocumentosPersonalesEstudianteDto | null>(null);

  // Estado del modal de subida
  const [modalType, setModalType] = useState<ModalType>(null);
  const [docSeleccionado, setDocSeleccionado] = useState<DocumentoPersonalDto | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [notas, setNotas] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del modal de validación
  const [accionValidar, setAccionValidar] = useState<boolean>(true);
  const [procesando, setProcesando] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  // --- Modal de subida ---
  function abrirModalSubida(doc: DocumentoPersonalDto) {
    setDocSeleccionado(doc);
    setArchivo(null);
    setNotas("");
    setModalType("subir");
  }

  // --- Modal de validación ---
  function abrirModalValidacion(doc: DocumentoPersonalDto, aprobar: boolean) {
    setDocSeleccionado(doc);
    setAccionValidar(aprobar);
    setNotas("");
    setModalType("validar");
  }

  function cerrarModal() {
    setModalType(null);
    setDocSeleccionado(null);
    setArchivo(null);
    setNotas("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`El archivo excede el tamaño máximo de ${MAX_SIZE_MB} MB`);
      e.target.value = "";
      return;
    }

    setArchivo(file);
  }

  async function handleSubir() {
    if (!archivo || !docSeleccionado) return;

    setSubiendo(true);
    try {
      const resultado = await subirDocumentoPersonal(
        idEstudiante,
        docSeleccionado.idDocumentoRequisito,
        archivo,
        notas || undefined
      );

      if (resultado.exitoso) {
        toast.success(resultado.mensaje || "Documento subido exitosamente");
        cerrarModal();
        await cargarDocumentos();
      } else {
        toast.error(resultado.mensaje || "Error al subir el documento");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al subir el documento";
      toast.error(msg);
    } finally {
      setSubiendo(false);
    }
  }

  async function handleValidar() {
    if (!docSeleccionado || docSeleccionado.idAspiranteDocumento === 0) return;

    setProcesando(true);
    try {
      const resultado = await validarDocumentoPersonal(
        idEstudiante,
        docSeleccionado.idAspiranteDocumento,
        accionValidar,
        notas || undefined
      );

      if (resultado.exitoso) {
        toast.success(resultado.mensaje);
        cerrarModal();
        await cargarDocumentos();
      } else {
        toast.error(resultado.mensaje || "Error al procesar el documento");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al procesar el documento";
      toast.error(msg);
    } finally {
      setProcesando(false);
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

  const puedeSubir = (estatus: string) => estatus === "PENDIENTE" || estatus === "RECHAZADO";
  const puedeValidar = (estatus: string) => estatus === "SUBIDO";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#14356F" }}></div>
      </div>
    );
  }

  if (!documentos) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin documentos personales</h3>
            <p className="text-gray-500">
              No se encontraron documentos personales para este estudiante.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                <TableHead>Validado por</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.documentos.map((doc) => (
                <TableRow key={`${doc.idDocumentoRequisito}-${doc.idAspiranteDocumento}`}>
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
                  <TableCell className="text-sm text-gray-600">
                    {doc.validadoPor ? (
                      <div>
                        <p className="font-medium">{doc.validadoPor}</p>
                        {doc.fechaValidacion && (
                          <p className="text-xs text-gray-400">{formatDate(doc.fechaValidacion)}</p>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-500">
                    {doc.notas || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
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
                      {puedeSubir(doc.estatus) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalSubida(doc)}
                          className="gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Subir
                        </Button>
                      )}
                      {puedeValidar(doc.estatus) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalValidacion(doc, true)}
                            className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                            title="Aprobar documento"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Validar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalValidacion(doc, false)}
                            className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                            title="Rechazar documento"
                          >
                            <ShieldX className="w-3.5 h-3.5" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de subida de documento */}
      <Dialog open={modalType === "subir"} onOpenChange={(open) => { if (!open) cerrarModal(); }}>
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
            <DialogDescription>
              {docSeleccionado?.nombreDocumento} ({docSeleccionado?.claveDocumento})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo</Label>
              <Input
                id="archivo"
                ref={fileInputRef}
                type="file"
                accept={EXTENSIONES_PERMITIDAS}
                onChange={handleFileChange}
                disabled={subiendo}
              />
              <p className="text-xs text-gray-500">
                Formatos: PDF, JPG, PNG, DOC, DOCX. Max {MAX_SIZE_MB} MB.
              </p>
            </div>

            {archivo && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                <FileText className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="text-sm text-blue-800 truncate flex-1 min-w-0">{archivo.name}</span>
                <span className="text-xs text-blue-600 shrink-0">
                  {(archivo.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notas-subir">Notas (opcional)</Label>
              <Textarea
                id="notas-subir"
                placeholder="Agregar notas o comentarios..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={subiendo}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={cerrarModal} disabled={subiendo}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubir}
              disabled={!archivo || subiendo}
              className="w-full sm:w-auto"
              style={{ backgroundColor: "#14356F" }}
            >
              {subiendo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de validación/rechazo */}
      <Dialog open={modalType === "validar"} onOpenChange={(open) => { if (!open) cerrarModal(); }}>
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {accionValidar ? (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              ) : (
                <ShieldX className="w-5 h-5 text-red-600" />
              )}
              {accionValidar ? "Validar Documento" : "Rechazar Documento"}
            </DialogTitle>
            <DialogDescription>
              {docSeleccionado?.nombreDocumento} ({docSeleccionado?.claveDocumento})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {docSeleccionado?.urlArchivo && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
                <FileText className="w-5 h-5 shrink-0 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Documento subido</p>
                  <p className="text-xs text-gray-500 truncate">{docSeleccionado.urlArchivo}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(docSeleccionado.urlArchivo!, "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Ver
                </Button>
              </div>
            )}

            {accionValidar ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  El documento sera marcado como <strong>VALIDADO</strong>. Esto confirma que cumple con los requisitos.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  El documento sera marcado como <strong>RECHAZADO</strong>. El estudiante podra volver a subir el documento.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notas-validar">
                {accionValidar ? "Notas (opcional)" : "Motivo del rechazo"}
              </Label>
              <Textarea
                id="notas-validar"
                placeholder={
                  accionValidar
                    ? "Agregar observaciones..."
                    : "Indique el motivo del rechazo para que el estudiante pueda corregirlo..."
                }
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={procesando}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={cerrarModal} disabled={procesando}>
              Cancelar
            </Button>
            {accionValidar ? (
              <Button
                onClick={handleValidar}
                disabled={procesando}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Confirmar Validacion
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleValidar}
                disabled={procesando || !notas.trim()}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  <>
                    <ShieldX className="w-4 h-4 mr-2" />
                    Confirmar Rechazo
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
