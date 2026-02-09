
"use client";

import { useEffect, useState } from "react";

import { AlertCircle, CheckCircle, TrendingUp, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAcademicPeriods } from "@/services/catalogs-service";
import { promoteStudents } from "@/services/groups-service";
import { AcademicPeriod } from "@/types/catalog";
import { PromocionResponse } from "@/types/group";

interface PromoteStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idGrupo: number;
  nombreGrupo: string;
  onSuccess: () => void;
  periodicidadLabel?: string;
}

export function PromoteStudentsModal({
  open,
  onOpenChange,
  idGrupo,
  nombreGrupo,
  onSuccess,
  periodicidadLabel = "Cuatrimestre",
}: PromoteStudentsModalProps) {
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [promedioMinimo, setPromedioMinimo] = useState("70");
  const [crearGrupoAutomaticamente, setCrearGrupoAutomaticamente] = useState(true);
  const [promoverTodos, setPromoverTodos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromocionResponse | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      resetForm();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const periodsData = await getAcademicPeriods();
      setAcademicPeriods(periodsData);

      const futurePeriods = periodsData.filter((p) => new Date(p.fechaInicio) > new Date());
      if (futurePeriods.length > 0) {
        setSelectedPeriodId(futurePeriods[0].idPeriodoAcademico.toString());
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    }
  };

  const resetForm = () => {
    setSelectedPeriodId("");
    setPromedioMinimo("70");
    setCrearGrupoAutomaticamente(true);
    setPromoverTodos(false);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPeriodId) {
      toast.error("Selecciona un periodo académico de destino");
      return;
    }

    if (
      !confirm(
        `¿Confirmar promoción de estudiantes del grupo ${nombreGrupo}?\n\n` +
          `Periodo destino: ${academicPeriods.find((p) => p.idPeriodoAcademico.toString() === selectedPeriodId)?.nombre}\n` +
          `Promedio mínimo: ${promedioMinimo}\n` +
          `${crearGrupoAutomaticamente ? "Se creará el grupo siguiente automáticamente" : "Usar grupo existente"}`
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await promoteStudents({
        idGrupoActual: idGrupo,
        idPeriodoAcademicoDestino: parseInt(selectedPeriodId),
        crearGrupoSiguienteAutomaticamente: crearGrupoAutomaticamente,
        promedioMinimoPromocion: parseFloat(promedioMinimo),
        promoverTodos,
      });

      setResult(response);

      toast.success(
        <div className="space-y-1">
          <p className="font-bold">Promoción completada</p>
          <p className="text-xs">
            {response.totalEstudiantesPromovidos} promovidos / {response.totalEstudiantesNoPromovidos} no promovidos
          </p>
        </div>,
        { duration: 7000 },
      );

      onSuccess();
    } catch (error: unknown) {
      console.error("Error promoting students:", error);
      const err = error as { response?: { data?: { mensaje?: string } }; message?: string };
      const errorMessage = err?.response?.data?.mensaje ?? err?.message ?? "Error al promover estudiantes";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Promover Estudiantes del Grupo {nombreGrupo}
          </DialogTitle>
          <DialogDescription>
            Promueve automáticamente a los estudiantes al siguiente {periodicidadLabel.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm">
                Periodo Académico de Destino *
              </Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccione un periodo" />
                </SelectTrigger>
                <SelectContent>
                  {academicPeriods.map((period) => (
                    <SelectItem key={period.idPeriodoAcademico} value={period.idPeriodoAcademico.toString()}>
                      {period.nombre} ({period.clave})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promedio" className="text-sm">
                Promedio Mínimo para Promoción
              </Label>
              <Input
                id="promedio"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={promedioMinimo}
                onChange={(e) => setPromedioMinimo(e.target.value)}
                placeholder="70"
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Solo los estudiantes con promedio igual o superior serán promovidos
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Checkbox
                  id="crearGrupo"
                  checked={crearGrupoAutomaticamente}
                  onCheckedChange={(checked) => setCrearGrupoAutomaticamente(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="crearGrupo"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Crear grupo siguiente automáticamente
                  </label>
                  <p className="text-xs text-gray-600">
                    Si el grupo del siguiente {periodicidadLabel.toLowerCase()} no existe, se creará automáticamente
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Checkbox
                  id="promoverTodos"
                  checked={promoverTodos}
                  onCheckedChange={(checked) => setPromoverTodos(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="promoverTodos"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Promover a todos (ignorar promedio)
                  </label>
                  <p className="text-xs text-gray-600">
                    Promoverá a todos los estudiantes sin importar su promedio
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Advertencia</p>
                  <p className="text-yellow-700">
                    Esta acción promoverá a los estudiantes al siguiente {periodicidadLabel.toLowerCase()}. Verifica los datos antes de
                    continuar.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Procesando..." : "Promover Estudiantes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Promovidos</span>
                </div>
                <p className="text-3xl font-bold text-green-900">{result.totalEstudiantesPromovidos}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">No Promovidos</span>
                </div>
                <p className="text-3xl font-bold text-red-900">{result.totalEstudiantesNoPromovidos}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Grupo origen:</strong> {result.grupoOrigen}
              </p>
              <p className="text-sm text-blue-900">
                <strong>Grupo destino:</strong> {result.grupoDestino}
              </p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold text-sm">Detalle de Estudiantes</h3>
              {result.estudiantes.map((student) => (
                <div
                  key={student.idEstudiante}
                  className={`border rounded-lg p-3 ${
                    student.fuePromovido
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {student.fuePromovido ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium text-sm">
                          {student.matricula} - {student.nombreCompleto}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{student.motivo}</p>
                    </div>
                    <span className="text-sm font-semibold">
                      Promedio: {student.promedioGeneral.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
