"use client";

import { useEffect, useState } from "react";

import { HandCoins, Plus, Trash2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { recalcularDescuentosConvenio } from "@/services/applicants-service";
import {
  obtenerConveniosDisponiblesParaAspirante,
  obtenerConveniosAspirante,
  asignarConvenioAspirante,
  cambiarEstatusConvenioAspirante,
  eliminarConvenioAspirante,
  formatearBeneficio,
  getColorEstatusConvenio,
} from "@/services/convenios-service";
import { Applicant } from "@/types/applicant";
import {
  AspiranteConvenioDto,
  ConvenioDisponibleDto,
  EstatusConvenioAspirante,
} from "@/types/convenio";

interface ConveniosAspiranteModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onConvenioChanged?: () => void;
}

export function ConveniosAspiranteModal({
  open,
  applicant,
  onClose,
  onConvenioChanged,
}: ConveniosAspiranteModalProps) {
  const [conveniosAsignados, setConveniosAsignados] = useState<AspiranteConvenioDto[]>([]);
  const [conveniosDisponibles, setConveniosDisponibles] = useState<ConvenioDisponibleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConvenio, setSelectedConvenio] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open && applicant) {
      loadData();
    }
  }, [open, applicant]);

  const loadData = async () => {
    if (!applicant) return;

    setLoading(true);
    try {
      const [asignados, disponibles] = await Promise.all([
        obtenerConveniosAspirante(applicant.idAspirante),
        obtenerConveniosDisponiblesParaAspirante(applicant.idAspirante),
      ]);
      setConveniosAsignados(asignados);
      setConveniosDisponibles(disponibles);
    } catch {
      toast.error("Error al cargar convenios");
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarConvenio = async () => {
    if (!applicant || !selectedConvenio) return;

    setAssigning(true);
    try {
      await asignarConvenioAspirante({
        idAspirante: applicant.idAspirante,
        idConvenio: parseInt(selectedConvenio),
      });
      toast.success("Convenio asignado exitosamente");
      setSelectedConvenio("");
      loadData();
      onConvenioChanged?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Error al asignar convenio");
    } finally {
      setAssigning(false);
    }
  };

  const handleCambiarEstatus = async (
    idAspiranteConvenio: number,
    estatus: EstatusConvenioAspirante
  ) => {
    try {
      await cambiarEstatusConvenioAspirante(idAspiranteConvenio, estatus);
      toast.success(`Convenio ${estatus.toLowerCase()}`);

      if (estatus === "Aprobado" && applicant) {
        try {
          const resultado = await recalcularDescuentosConvenio(applicant.idAspirante);
          if (resultado.recibosActualizados > 0) {
            toast.success(
              `Se actualizaron ${resultado.recibosActualizados} recibo(s). Descuento total: $${resultado.descuentoTotalAplicado.toFixed(2)}`
            );
          }
        } catch {
          // No bloquear si falla el recálculo
        }
      }

      loadData();
      onConvenioChanged?.();
    } catch {
      toast.error("Error al cambiar estatus");
    }
  };

  const handleEliminar = async (idAspiranteConvenio: number) => {
    if (!confirm("¿Eliminar este convenio del aspirante?")) return;

    try {
      await eliminarConvenioAspirante(idAspiranteConvenio);
      toast.success("Convenio eliminado");
      loadData();
      onConvenioChanged?.();
    } catch {
      toast.error("Error al eliminar convenio");
    }
  };

  const getBadgeVariant = (estatus: EstatusConvenioAspirante) => {
    const color = getColorEstatusConvenio(estatus);
    if (color === "success") return "default";
    if (color === "destructive") return "destructive";
    return "secondary";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Convenios - {applicant?.nombreCompleto}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Asignar Convenio</h3>

              {conveniosDisponibles.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    No hay convenios disponibles para este aspirante (ya tiene
                    todos asignados o no hay convenios activos para su plan/campus)
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={selectedConvenio}
                    onValueChange={setSelectedConvenio}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecciona un convenio" />
                    </SelectTrigger>
                    <SelectContent>
                      {conveniosDisponibles.map((c) => (
                        <SelectItem
                          key={c.idConvenio}
                          value={c.idConvenio.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{c.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                              {c.descripcionBeneficio}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAsignarConvenio}
                    disabled={!selectedConvenio || assigning}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    {assigning ? "Asignando..." : "Asignar"}
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                Convenios Asignados ({conveniosAsignados.length})
              </h3>

              {conveniosAsignados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                  <HandCoins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Este aspirante no tiene convenios asignados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conveniosAsignados.map((convenio) => (
                    <div
                      key={convenio.idAspiranteConvenio}
                      className="border rounded-lg p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {convenio.nombreConvenio}
                          </span>
                          <Badge
                            variant={getBadgeVariant(convenio.estatus)}
                            className={
                              convenio.estatus === "Aprobado"
                                ? "bg-green-100 text-green-700"
                                : ""
                            }
                          >
                            {convenio.estatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="font-mono">{convenio.claveConvenio}</span>
                          <span>
                            {convenio.tipoBeneficio &&
                              formatearBeneficio({
                                tipoBeneficio: convenio.tipoBeneficio,
                                descuentoPct: convenio.descuentoPct,
                                monto: convenio.monto,
                              })}
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {convenio.aplicaA === "INSCRIPCION"
                              ? "Solo Inscripcion"
                              : convenio.aplicaA === "COLEGIATURA"
                              ? "Solo Colegiatura"
                              : "Todos los pagos"}
                          </span>
                          {convenio.maxAplicaciones && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${
                                convenio.puedeAplicarse
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {convenio.vecesAplicado}/{convenio.maxAplicaciones} usos
                            </span>
                          )}
                          {!convenio.maxAplicaciones && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              Ilimitado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Asignado:{" "}
                          {new Date(convenio.fechaAsignacion).toLocaleDateString(
                            "es-MX"
                          )}
                          {convenio.estatus === "Aprobado" && !convenio.puedeAplicarse && (
                            <span className="ml-2 text-orange-600 font-medium">
                              (Limite de aplicaciones alcanzado)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {convenio.estatus === "Pendiente" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={() =>
                                handleCambiarEstatus(
                                  convenio.idAspiranteConvenio,
                                  "Aprobado"
                                )
                              }
                              title="Aprobar"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                              onClick={() =>
                                handleCambiarEstatus(
                                  convenio.idAspiranteConvenio,
                                  "Rechazado"
                                )
                              }
                              title="Rechazar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleEliminar(convenio.idAspiranteConvenio)
                          }
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {conveniosAsignados.filter((c) => c.estatus === "Aprobado").length >
              0 && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 mb-2">
                  Beneficios Aprobados
                </h4>
                <div className="space-y-2">
                  {conveniosAsignados
                    .filter((c) => c.estatus === "Aprobado")
                    .map((c) => (
                      <div
                        key={c.idAspiranteConvenio}
                        className={`text-sm ${
                          c.puedeAplicarse
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        <span className={!c.puedeAplicarse ? "line-through" : ""}>
                          {c.nombreConvenio}:{" "}
                          {c.tipoBeneficio &&
                            formatearBeneficio({
                              tipoBeneficio: c.tipoBeneficio,
                              descuentoPct: c.descuentoPct,
                              monto: c.monto,
                            })}
                        </span>
                        {!c.puedeAplicarse && (
                          <span className="ml-2 text-xs text-orange-600">
                            (Agotado)
                          </span>
                        )}
                        {c.puedeAplicarse && c.maxAplicaciones && (
                          <span className="ml-2 text-xs opacity-70">
                            ({c.maxAplicaciones - c.vecesAplicado} restantes)
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
