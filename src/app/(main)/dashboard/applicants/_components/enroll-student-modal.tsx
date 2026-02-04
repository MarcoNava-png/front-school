"use client";

import { useEffect, useState } from "react";

import { GraduationCap, AlertCircle, CheckCircle, FileText, DollarSign, Clock, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { enrollApplicantAsStudent, getApplicantAdmissionSheet, downloadApplicantEnrollmentSheet } from "@/services/applicants-service";
import { getAcademicPeriods } from "@/services/catalogs-service";
import {
  Applicant,
  FichaAdmisionDto,
  InscribirAspiranteRequest,
  InscripcionAspiranteResultDto,
  EstatusDocumentoEnum,
} from "@/types/applicant";
import { AcademicPeriod } from "@/types/catalog";

interface EnrollStudentModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onEnrollmentSuccess: () => void;
}

export function EnrollStudentModal({ open, applicant, onClose, onEnrollmentSuccess }: EnrollStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [fichaAdmision, setFichaAdmision] = useState<FichaAdmisionDto | null>(null);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);

  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("");
  const [forzarInscripcion, setForzarInscripcion] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  const [canEnroll, setCanEnroll] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open && applicant) {
      loadData();
    } else {
      resetForm();
    }
  }, [open, applicant]);

  const loadData = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      const [fichaData, periodsData] = await Promise.all([
        getApplicantAdmissionSheet(applicant.idAspirante),
        getAcademicPeriods(),
      ]);

      setFichaAdmision(fichaData);
      setAcademicPeriods(periodsData);

      validateRequirements(fichaData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos del aspirante");
    } finally {
      setLoading(false);
    }
  };

  const validateRequirements = (ficha: FichaAdmisionDto) => {
    const errors: string[] = [];

    const documentosObligatorios = ficha.documentos.filter((d) => d.esObligatorio);
    const documentosPendientes = documentosObligatorios.filter((d) => d.estatus !== EstatusDocumentoEnum.VALIDADO);

    if (documentosPendientes.length > 0) {
      errors.push(
        `Documentos pendientes de validar: ${documentosPendientes.map((d) => d.descripcion).join(", ")}`,
      );
    }

    const saldoPendiente = ficha.informacionPagos.saldoPendiente;
    if (saldoPendiente > 0) {
      errors.push(`Tiene un saldo pendiente de ${formatCurrency(saldoPendiente)}`);
    }

    const estatusValidos = ["PAGO COMPLETO", "INSCRITO", "PAGADO", "ACEPTADO"];
    const estatusActual = ficha.estatusActual.toUpperCase();
    if (!estatusValidos.some((e) => estatusActual.includes(e))) {
      errors.push(`El estatus actual "${ficha.estatusActual}" no es válido para inscripción`);
    }

    setValidationErrors(errors);
    setCanEnroll(errors.length === 0);
  };

  const resetForm = () => {
    setIdPeriodoAcademico("");
    setForzarInscripcion(false);
    setObservaciones("");
    setFichaAdmision(null);
    setValidationErrors([]);
    setCanEnroll(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicant) return;

    if (!canEnroll && !forzarInscripcion) {
      toast.error("No se cumplen los requisitos para inscribir. Active 'Forzar inscripción' si desea continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const request: InscribirAspiranteRequest = {
        idPeriodoAcademico: idPeriodoAcademico ? parseInt(idPeriodoAcademico) : null,
        forzarInscripcion,
        observaciones: observaciones || null,
      };

      console.log("📤 Inscribiendo aspirante:", request);

      const result: InscripcionAspiranteResultDto = await enrollApplicantAsStudent(
        applicant.idAspirante,
        request,
      );

      console.log("✅ Inscripción exitosa:", result);

      toast.success(
        <div className="space-y-2">
          <p className="font-bold">Inscripción exitosa</p>
          <p>Matrícula: {result.matricula}</p>
          <p>Usuario: {result.credenciales.usuario}</p>
          <p>Contraseña temporal: {result.credenciales.passwordTemporal}</p>
        </div>,
        { duration: 10000 },
      );

      onEnrollmentSuccess();
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error("Error al inscribir:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage = err?.response?.data?.mensaje ?? err?.message ?? "Error al inscribir el aspirante";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const handleDownloadPdf = async (openInNewTab: boolean = false) => {
    if (!applicant) return;

    setDownloadingPdf(true);
    try {
      await downloadApplicantEnrollmentSheet(applicant.idAspirante, openInNewTab);
      toast.success(openInNewTab ? "PDF abierto en nueva pestaña" : "PDF descargado correctamente");
    } catch (error: unknown) {
      console.error("Error al descargar PDF:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage = err?.response?.data?.mensaje ?? err?.message ?? "Error al generar el PDF";
      toast.error(errorMessage);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getDocumentStatusIcon = (estatus: EstatusDocumentoEnum) => {
    switch (estatus) {
      case EstatusDocumentoEnum.VALIDADO:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case EstatusDocumentoEnum.RECHAZADO:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case EstatusDocumentoEnum.SUBIDO:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Inscribir Aspirante como Estudiante
          </DialogTitle>
          <DialogDescription>
            Convierta al aspirante {applicant?.nombreCompleto} en estudiante activo del sistema
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Cargando información...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border rounded-lg p-4 ${
                canEnroll ? "bg-green-50 border-green-300" : "bg-orange-50 border-orange-300"
              }`}
            >
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                {canEnroll ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
                Estado de Requisitos
              </h3>

              {fichaAdmision && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Documentos ({fichaAdmision.documentos.length})</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {fichaAdmision.documentos
                        .filter((d) => d.esObligatorio)
                        .map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {getDocumentStatusIcon(doc.estatus)}
                            <span className={doc.estatus === EstatusDocumentoEnum.VALIDADO ? "text-green-700" : ""}>
                              {doc.descripcion}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Pagos</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <div className="flex justify-between">
                        <span>Total a pagar:</span>
                        <span className="font-semibold">
                          {formatCurrency(fichaAdmision.informacionPagos.totalAPagar)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total pagado:</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(fichaAdmision.informacionPagos.totalPagado)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saldo pendiente:</span>
                        <span
                          className={`font-semibold ${
                            fichaAdmision.informacionPagos.saldoPendiente > 0 ? "text-red-700" : "text-green-700"
                          }`}
                        >
                          {formatCurrency(fichaAdmision.informacionPagos.saldoPendiente)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="font-medium">Estatus actual:</span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {fichaAdmision.estatusActual}
                    </span>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="pt-2 border-t space-y-1">
                      <p className="font-medium text-orange-800">Advertencias:</p>
                      <ul className="list-disc list-inside space-y-1 text-orange-700">
                        {validationErrors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-sm">Parámetros de Inscripción</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idPeriodoAcademico" className="text-xs">
                    Periodo Académico (Opcional)
                  </Label>
                  <Select value={idPeriodoAcademico} onValueChange={setIdPeriodoAcademico}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Detectar automáticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicPeriods.map((period) => (
                        <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                          {period.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-gray-500">
                    Si no se especifica, el sistema usará el periodo académico vigente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-xs">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas adicionales sobre la inscripción..."
                    rows={3}
                    className="text-xs"
                  />
                </div>

                {!canEnroll && (
                  <div className="flex items-start gap-2 p-3 bg-orange-100 border border-orange-300 rounded">
                    <Checkbox
                      id="forzar"
                      checked={forzarInscripcion}
                      onCheckedChange={(checked) => setForzarInscripcion(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="forzar" className="text-xs font-semibold cursor-pointer">
                        Forzar inscripción (Omitir validaciones)
                      </Label>
                      <p className="text-[10px] text-orange-700">
                        Active esta opción solo si está seguro de inscribir al aspirante sin cumplir todos los
                        requisitos. Esta acción quedará registrada en el sistema.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">¿Qué sucederá al inscribir?</h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Se generará una matrícula automáticamente según el programa de estudios</li>
                <li>Se creará el registro del estudiante en el sistema</li>
                <li>Se crearán credenciales de acceso (usuario y contraseña temporal)</li>
                <li>El estatus del aspirante cambiará a &quot;INSCRITO&quot;</li>
                <li>Se registrará la acción en la bitácora de seguimiento</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadPdf(true)}
                disabled={downloadingPdf || loading}
                className="text-xs gap-2"
              >
                <Printer className="w-4 h-4" />
                {downloadingPdf ? "Generando..." : "Imprimir Hoja de Inscripción"}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || (!canEnroll && !forzarInscripcion)}
                  className="text-xs"
                >
                  {submitting ? "Procesando..." : "Inscribir como Estudiante"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
