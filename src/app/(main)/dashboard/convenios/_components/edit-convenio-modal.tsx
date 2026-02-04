"use client";

import React, { useState, useEffect } from "react";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { actualizarConvenio } from "@/services/convenios-service";
import { Campus } from "@/types/campus";
import {
  ConvenioDto,
  ActualizarConvenioDto,
  CrearConvenioAlcanceDto,
  TipoBeneficio,
  AplicaA,
} from "@/types/convenio";
import { StudyPlan } from "@/types/study-plan";

interface EditConvenioModalProps {
  open: boolean;
  convenio: ConvenioDto;
  campusList: Campus[];
  planesEstudio: StudyPlan[];
  onClose: () => void;
  onUpdate: (data: ConvenioDto) => void;
}

export const EditConvenioModal: React.FC<EditConvenioModalProps> = ({
  open,
  convenio,
  campusList,
  planesEstudio,
  onClose,
  onUpdate,
}) => {
  const [claveConvenio, setClaveConvenio] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoBeneficio, setTipoBeneficio] = useState<TipoBeneficio>("PORCENTAJE");
  const [descuentoPct, setDescuentoPct] = useState("");
  const [monto, setMonto] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [aplicaA, setAplicaA] = useState<AplicaA>("TODOS");
  const [maxAplicaciones, setMaxAplicaciones] = useState("");
  const [activo, setActivo] = useState(true);
  const [alcances, setAlcances] = useState<CrearConvenioAlcanceDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (convenio) {
      setClaveConvenio(convenio.claveConvenio);
      setNombre(convenio.nombre);
      setTipoBeneficio(convenio.tipoBeneficio);
      setDescuentoPct(convenio.descuentoPct?.toString() || "");
      setMonto(convenio.monto?.toString() || "");
      setVigenteDesde(convenio.vigenteDesde || "");
      setVigenteHasta(convenio.vigenteHasta || "");
      setAplicaA(convenio.aplicaA || "TODOS");
      setMaxAplicaciones(convenio.maxAplicaciones?.toString() || "");
      setActivo(convenio.activo);
      setAlcances(
        convenio.alcances.map((a) => ({
          idCampus: a.idCampus,
          idPlanEstudios: a.idPlanEstudios,
          vigenteDesde: a.vigenteDesde,
          vigenteHasta: a.vigenteHasta,
        }))
      );
      setError(null);
    }
  }, [convenio]);

  const validate = () => {
    if (!claveConvenio.trim()) return "La clave es obligatoria";
    if (!nombre.trim()) return "El nombre es obligatorio";

    if (tipoBeneficio === "PORCENTAJE") {
      if (!descuentoPct) return "El porcentaje es obligatorio";
      const pct = parseFloat(descuentoPct);
      if (isNaN(pct) || pct < 0 || pct > 100)
        return "El porcentaje debe estar entre 0 y 100";
    }

    if (tipoBeneficio === "MONTO") {
      if (!monto) return "El monto es obligatorio";
      const m = parseFloat(monto);
      if (isNaN(m) || m < 0) return "El monto debe ser un numero positivo";
    }

    return null;
  };

  const handleUpdate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: ActualizarConvenioDto = {
        claveConvenio: claveConvenio.trim(),
        nombre: nombre.trim(),
        tipoBeneficio,
        descuentoPct:
          tipoBeneficio === "PORCENTAJE" ? parseFloat(descuentoPct) : null,
        monto: tipoBeneficio === "MONTO" ? parseFloat(monto) : null,
        vigenteDesde: vigenteDesde || null,
        vigenteHasta: vigenteHasta || null,
        aplicaA,
        maxAplicaciones: maxAplicaciones ? parseInt(maxAplicaciones) : null,
        activo,
        alcances,
      };

      const updated = await actualizarConvenio(convenio.idConvenio, payload);
      onUpdate(updated);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar convenio";
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
          return;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addAlcance = () => {
    setAlcances([...alcances, { idCampus: null, idPlanEstudios: null }]);
  };

  const removeAlcance = (index: number) => {
    setAlcances(alcances.filter((_, i) => i !== index));
  };

  const updateAlcance = (
    index: number,
    field: keyof CrearConvenioAlcanceDto,
    value: number | null
  ) => {
    setAlcances(
      alcances.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Convenio</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clave">Clave del Convenio *</Label>
              <Input
                id="clave"
                placeholder="Ej: CONV-2024-001"
                value={claveConvenio}
                onChange={(e) => setClaveConvenio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Beca Familiar"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Beneficio *</Label>
              <Select
                value={tipoBeneficio}
                onValueChange={(v) => setTipoBeneficio(v as TipoBeneficio)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
                  <SelectItem value="MONTO">Monto Fijo ($)</SelectItem>
                  <SelectItem value="EXENCION">Exencion Total (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoBeneficio === "PORCENTAJE" && (
              <div className="space-y-2">
                <Label htmlFor="pct">Porcentaje de Descuento *</Label>
                <div className="relative">
                  <Input
                    id="pct"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ej: 25"
                    value={descuentoPct}
                    onChange={(e) => setDescuentoPct(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            )}

            {tipoBeneficio === "MONTO" && (
              <div className="space-y-2">
                <Label htmlFor="monto">Monto de Descuento *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="monto"
                    type="number"
                    min="0"
                    placeholder="Ej: 500"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            )}

            {tipoBeneficio === "EXENCION" && (
              <div className="space-y-2">
                <Label>Descuento</Label>
                <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                  <span className="text-sm text-muted-foreground">
                    Exencion total del 100%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desde">Vigente Desde</Label>
              <Input
                id="desde"
                type="date"
                value={vigenteDesde}
                onChange={(e) => setVigenteDesde(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasta">Vigente Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={vigenteHasta}
                onChange={(e) => setVigenteHasta(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-blue-50/50">
            <div>
              <Label className="text-base font-semibold">
                Configuracion de Aplicacion
              </Label>
              <p className="text-sm text-muted-foreground">
                Define a que tipo de pagos aplica y cuantas veces puede usarse
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aplicaA">Aplica a</Label>
                <Select
                  value={aplicaA}
                  onValueChange={(v) => setAplicaA(v as AplicaA)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos los pagos</SelectItem>
                    <SelectItem value="INSCRIPCION">Solo Inscripcion</SelectItem>
                    <SelectItem value="COLEGIATURA">Solo Colegiaturas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAplicaciones">Maximo de aplicaciones</Label>
                <Input
                  id="maxAplicaciones"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  value={maxAplicaciones}
                  onChange={(e) => setMaxAplicaciones(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacio para ilimitado. Ej: 1 = solo una vez, 4 = hasta 4 pagos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={activo} onCheckedChange={setActivo} id="activo" />
            <Label htmlFor="activo">Convenio Activo</Label>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">
                  Alcance del Convenio
                </Label>
                <p className="text-sm text-muted-foreground">
                  Define donde aplica este convenio. Si no agregas alcances,
                  aplicara a todos.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAlcance}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>

            {alcances.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded">
                Sin restricciones - aplica a todos los campus y planes
              </div>
            ) : (
              <div className="space-y-3">
                {alcances.map((alcance, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Select
                        value={alcance.idCampus?.toString() || "all"}
                        onValueChange={(v) =>
                          updateAlcance(
                            index,
                            "idCampus",
                            v === "all" ? null : parseInt(v)
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Campus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los Campus</SelectItem>
                          {campusList.map((c) => (
                            <SelectItem key={c.idCampus} value={c.idCampus.toString()}>
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={alcance.idPlanEstudios?.toString() || "all"}
                        onValueChange={(v) =>
                          updateAlcance(
                            index,
                            "idPlanEstudios",
                            v === "all" ? null : parseInt(v)
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Plan de Estudios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los Planes</SelectItem>
                          {planesEstudio.map((p) => (
                            <SelectItem
                              key={p.idPlanEstudios}
                              value={p.idPlanEstudios.toString()}
                            >
                              {p.nombrePlanEstudios || p.clavePlanEstudios}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeAlcance(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
