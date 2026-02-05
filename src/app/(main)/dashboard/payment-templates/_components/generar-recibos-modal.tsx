"use client";

import { useEffect, useState } from "react";

import { FileText, Loader2, Users, CheckCircle, AlertTriangle, Receipt } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { formatCurrency } from "@/lib/payment-utils";
import { getAcademicPeriodsList } from "@/services/academic-period-service";
import { generarRecibosMasivo } from "@/services/plantillas-service";
import { AcademicPeriod } from "@/types/academic-period";
import {
  PlantillaCobro,
  GenerarRecibosMasivosResult,
} from "@/types/receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  plantilla: PlantillaCobro;
  periodicidadLabel?: string;
}

type Step = "config" | "preview" | "result";

export function GenerarRecibosModal({ open, onClose, plantilla, periodicidadLabel = "Cuatrimestre" }: Props) {
  const [step, setStep] = useState<Step>("config");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [periodosAcademicos, setPeriodosAcademicos] = useState<AcademicPeriod[]>([]);

  const [idPeriodoAcademico, setIdPeriodoAcademico] = useState<string>("");

  const [previewResult, setPreviewResult] = useState<GenerarRecibosMasivosResult | null>(null);
  const [finalResult, setFinalResult] = useState<GenerarRecibosMasivosResult | null>(null);

  useEffect(() => {
    if (open) {
      cargarDatosIniciales();
      setStep("config");
      setPreviewResult(null);
      setFinalResult(null);
      if (plantilla.idPeriodoAcademico) {
        setIdPeriodoAcademico(plantilla.idPeriodoAcademico.toString());
      } else {
        setIdPeriodoAcademico("");
      }
    }
  }, [open, plantilla]);

  async function cargarDatosIniciales() {
    setLoadingData(true);
    try {
      const periodosData = await getAcademicPeriodsList();
      setPeriodosAcademicos(periodosData.items);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Error al cargar periodos académicos");
    } finally {
      setLoadingData(false);
    }
  }

  async function handlePreview() {
    if (!idPeriodoAcademico) {
      toast.error("Selecciona un periodo académico");
      return;
    }

    setLoading(true);
    try {
      const result = await generarRecibosMasivo({
        idPlantillaCobro: plantilla.idPlantillaCobro,
        idPeriodoAcademico: parseInt(idPeriodoAcademico),
        soloSimular: true,
      });

      setPreviewResult(result);
      setStep("preview");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Error al simular generación";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerar() {
    if (!idPeriodoAcademico) {
      toast.error("Selecciona un periodo académico");
      return;
    }

    setLoading(true);
    try {
      const result = await generarRecibosMasivo({
        idPlantillaCobro: plantilla.idPlantillaCobro,
        idPeriodoAcademico: parseInt(idPeriodoAcademico),
        soloSimular: false,
      });

      setFinalResult(result);
      setStep("result");

      if (result.exitoso) {
        toast.success(`Se generaron ${result.totalRecibosGenerados} recibos exitosamente`);
      } else {
        toast.error(result.mensaje ?? "Error al generar recibos");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Error al generar recibos";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep("config");
    setPreviewResult(null);
    setFinalResult(null);
    onClose();
  }

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Generar Recibos Masivamente</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Cargando datos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[800px] p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Receipt className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Generar Recibos Masivamente</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Genera recibos para todos los estudiantes que coincidan con la plantilla
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 overflow-y-auto max-h-[60vh]">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-2 border border-blue-100 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-semibold text-blue-900 text-sm sm:text-base truncate">
                {plantilla.nombrePlantilla}
              </span>
              <Badge
                className={`w-fit ${
                  plantilla.esActiva
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {plantilla.esActiva ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-blue-700">
              <div>
                <span className="font-medium">Plan:</span>{" "}
                <span className="text-blue-900">{plantilla.nombrePlanEstudios ?? `Plan #${plantilla.idPlanEstudios}`}</span>
              </div>
              <div>
                <span className="font-medium">{periodicidadLabel}:</span>{" "}
                <span className="text-blue-900">{plantilla.numeroCuatrimestre}°</span>
              </div>
              <div>
                <span className="font-medium">Recibos:</span>{" "}
                <span className="text-blue-900">{plantilla.numeroRecibos}</span>
              </div>
            </div>
          </div>
          {step === "config" && (
            <div className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="periodo" className="text-sm">
                  Periodo Académico <span className="text-red-500">*</span>
                </Label>
                <Select value={idPeriodoAcademico} onValueChange={setIdPeriodoAcademico}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecciona el periodo académico" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {periodosAcademicos.map((periodo) => (
                      <SelectItem
                        key={periodo.idPeriodoAcademico}
                        value={periodo.idPeriodoAcademico.toString()}
                      >
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Se generarán recibos para estudiantes inscritos en este periodo que estén en el{" "}
                  {plantilla.numeroCuatrimestre}° {periodicidadLabel.toLowerCase()} del plan de estudios.
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 text-sm">Vista previa disponible</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs sm:text-sm">
                  Antes de generar los recibos, puedes ver una simulación para confirmar qué
                  estudiantes serán afectados y el monto total.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {step === "preview" && previewResult && (
            <div className="space-y-4 pb-4">
              <Alert
                variant={previewResult.totalEstudiantes > 0 ? "default" : "destructive"}
                className={previewResult.totalEstudiantes > 0 ? "border-green-200 bg-green-50" : ""}
              >
                {previewResult.totalEstudiantes > 0 ? (
                  <Users className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertTitle className={previewResult.totalEstudiantes > 0 ? "text-green-900 text-sm" : "text-sm"}>
                  {previewResult.totalEstudiantes > 0
                    ? `${previewResult.totalEstudiantes} estudiantes encontrados`
                    : "Sin estudiantes"}
                </AlertTitle>
                <AlertDescription className={`text-xs sm:text-sm ${previewResult.totalEstudiantes > 0 ? "text-green-700" : ""}`}>
                  {previewResult.totalEstudiantes > 0
                    ? `Se generarán ${previewResult.totalRecibosGenerados} recibos por un total de ${formatCurrency(previewResult.montoTotal)}`
                    : previewResult.mensaje ?? "No se encontraron estudiantes que coincidan con los criterios"}
                </AlertDescription>
              </Alert>
              {previewResult.estudiantesOmitidos > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900 text-sm font-bold">
                    Ya existen recibos generados
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs sm:text-sm">
                    <strong>{previewResult.estudiantesOmitidos}</strong> estudiantes ya tienen recibos
                    para este periodo y serán omitidos automáticamente.
                    {previewResult.totalEstudiantes === 0 && (
                      <span className="block mt-2 text-red-600 font-semibold">
                        Todos los estudiantes ya tienen recibos. No se generarán nuevos recibos.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {previewResult.totalEstudiantes > 0 && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center border border-blue-100">
                      <div className="text-xl sm:text-2xl font-bold text-blue-700">
                        {previewResult.totalEstudiantes}
                      </div>
                      <div className="text-xs text-blue-600">Estudiantes</div>
                    </div>
                    <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center border border-green-100">
                      <div className="text-xl sm:text-2xl font-bold text-green-700">
                        {previewResult.totalRecibosGenerados}
                      </div>
                      <div className="text-xs text-green-600">Recibos</div>
                    </div>
                    <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center border border-purple-100">
                      <div className="text-sm sm:text-lg font-bold text-purple-700 truncate">
                        {formatCurrency(previewResult.montoTotal)}
                      </div>
                      <div className="text-xs text-purple-600">Monto Total</div>
                    </div>
                    <div className="bg-orange-50 p-2 sm:p-3 rounded-lg text-center border border-orange-100">
                      <div className="text-sm sm:text-lg font-bold text-orange-700 truncate">
                        {formatCurrency(previewResult.totalDescuentosBecas)}
                      </div>
                      <div className="text-xs text-orange-600">Desc. Becas</div>
                    </div>
                  </div>
                  {previewResult.detalleEstudiantes && previewResult.detalleEstudiantes.length > 0 && (
                    <div>
                      <Label className="mb-2 block text-sm">Detalle por estudiante</Label>

                      <div className="hidden sm:block border rounded-lg overflow-hidden">
                        <ScrollArea className="h-[200px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-600 hover:bg-blue-600">
                                <TableHead className="text-white font-semibold text-xs">Matrícula</TableHead>
                                <TableHead className="text-white font-semibold text-xs">Nombre</TableHead>
                                <TableHead className="text-white font-semibold text-xs text-center">Recibos</TableHead>
                                <TableHead className="text-white font-semibold text-xs text-right">Monto</TableHead>
                                <TableHead className="text-white font-semibold text-xs text-right">Descuento</TableHead>
                                <TableHead className="text-white font-semibold text-xs text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {previewResult.detalleEstudiantes.map((estudiante, index) => (
                                <TableRow
                                  key={estudiante.idEstudiante}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <TableCell className="font-mono text-xs">
                                    {estudiante.matricula}
                                  </TableCell>
                                  <TableCell className="text-xs truncate max-w-[150px]">
                                    {estudiante.nombreCompleto}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {estudiante.recibosGenerados}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-xs">
                                    {formatCurrency(estudiante.montoTotal)}
                                  </TableCell>
                                  <TableCell className="text-right text-xs text-orange-600">
                                    {estudiante.descuentoBecas > 0
                                      ? `-${formatCurrency(estudiante.descuentoBecas)}`
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="text-right text-xs font-semibold">
                                    {formatCurrency(estudiante.saldoFinal)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>

                      <div className="sm:hidden space-y-2 max-h-[250px] overflow-y-auto">
                        {previewResult.detalleEstudiantes.map((estudiante, index) => (
                          <div
                            key={estudiante.idEstudiante}
                            className={`p-3 rounded-lg border ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {estudiante.matricula}
                              </span>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {estudiante.recibosGenerados} recibos
                              </Badge>
                            </div>
                            <p className="font-medium text-sm truncate mb-2">{estudiante.nombreCompleto}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Monto</span>
                                <p className="font-medium">{formatCurrency(estudiante.montoTotal)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Descuento</span>
                                <p className="font-medium text-orange-600">
                                  {estudiante.descuentoBecas > 0
                                    ? `-${formatCurrency(estudiante.descuentoBecas)}`
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total</span>
                                <p className="font-bold text-green-700">{formatCurrency(estudiante.saldoFinal)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {previewResult.errores && previewResult.errores.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Advertencias</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {previewResult.errores.slice(0, 5).map((error, idx) => (
                        <li key={idx} className="text-xs">
                          {error}
                        </li>
                      ))}
                      {previewResult.errores.length > 5 && (
                        <li className="text-xs">
                          ...y {previewResult.errores.length - 5} más
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === "result" && finalResult && (
            <div className="space-y-4 pb-4">
              <Alert
                variant={finalResult.exitoso ? "default" : "destructive"}
                className={finalResult.exitoso ? "border-green-200 bg-green-50" : ""}
              >
                {finalResult.exitoso ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertTitle className={`text-sm ${finalResult.exitoso ? "text-green-900" : ""}`}>
                  {finalResult.exitoso ? "Recibos generados exitosamente" : "Error al generar"}
                </AlertTitle>
                <AlertDescription className={`text-xs sm:text-sm ${finalResult.exitoso ? "text-green-700" : ""}`}>
                  {finalResult.mensaje}
                </AlertDescription>
              </Alert>

              {finalResult.exitoso && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center border border-green-100">
                    <div className="text-2xl sm:text-3xl font-bold text-green-700">
                      {finalResult.totalEstudiantes}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600">Estudiantes</div>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center border border-blue-100">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                      {finalResult.totalRecibosGenerados}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600">Recibos</div>
                  </div>
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center border border-purple-100">
                    <div className="text-base sm:text-xl font-bold text-purple-700 truncate">
                      {formatCurrency(finalResult.montoTotal)}
                    </div>
                    <div className="text-xs sm:text-sm text-purple-600">Monto total</div>
                  </div>
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center border border-orange-100">
                    <div className="text-base sm:text-xl font-bold text-orange-700 truncate">
                      {formatCurrency(finalResult.totalDescuentosBecas)}
                    </div>
                    <div className="text-xs sm:text-sm text-orange-600">Desc. becas</div>
                  </div>
                </div>
              )}

              {finalResult.estudiantesOmitidos > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900 text-sm">Estudiantes omitidos</AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs sm:text-sm">
                    {finalResult.estudiantesOmitidos} estudiantes ya tenían recibos para este periodo
                    y fueron omitidos.
                  </AlertDescription>
                </Alert>
              )}

              {finalResult.errores && finalResult.errores.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Errores durante la generación</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {finalResult.errores.slice(0, 5).map((error, idx) => (
                        <li key={idx} className="text-xs">
                          {error}
                        </li>
                      ))}
                      {finalResult.errores.length > 5 && (
                        <li className="text-xs">...y {finalResult.errores.length - 5} más</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {step === "config" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePreview}
                  disabled={loading || !idPeriodoAcademico}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Vista Previa
                </Button>
              </>
            )}

            {step === "preview" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("config")}
                  className="w-full sm:w-auto"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleGenerar}
                  disabled={loading || !previewResult?.totalEstudiantes}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Generar {previewResult?.totalRecibosGenerados ?? 0} Recibos
                </Button>
              </>
            )}

            {step === "result" && (
              <Button
                onClick={handleClose}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
