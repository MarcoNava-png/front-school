"use client";

import { useCallback, useState } from "react";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import importacionService, {
  type ImportarPlanEstudiosDto,
  type ImportarPlanesEstudiosResponse,
} from "@/services/importacion-service";

interface ImportStudyPlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

const COLUMN_MAPPING: Record<string, keyof ImportarPlanEstudiosDto> = {
  claveplanestudios: "clavePlanEstudios",
  clave: "clavePlanEstudios",
  "clave plan": "clavePlanEstudios",
  nombreplanestudios: "nombrePlanEstudios",
  nombre: "nombrePlanEstudios",
  "nombre plan": "nombrePlanEstudios",
  carrera: "nombrePlanEstudios",
  clavecampus: "claveCampus",
  "clave campus": "claveCampus",
  campus: "claveCampus",
  niveleducativo: "nivelEducativo",
  "nivel educativo": "nivelEducativo",
  nivel: "nivelEducativo",
  periodicidad: "periodicidad",
  duracionmeses: "duracionMeses",
  "duracion meses": "duracionMeses",
  duracion: "duracionMeses",
  rvoe: "rvoe",
  version: "version",
  versión: "version",
};

type Step = "upload" | "preview" | "importing" | "results";

export function ImportStudyPlansModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportStudyPlansModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [planesList, setPlanesList] = useState<ImportarPlanEstudiosDto[]>([]);
  const [resultado, setResultado] = useState<ImportarPlanesEstudiosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actualizarExistentes, setActualizarExistentes] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const processFile = async (selectedFile: File) => {
    setLoading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        toast.error("El archivo no contiene datos");
        return;
      }

      const headers = jsonData[0].map((h) => String(h).toLowerCase().trim());
      const rows = jsonData.slice(1);

      const mapped: ImportarPlanEstudiosDto[] = [];

      for (const row of rows) {
        if (!row || row.every((cell) => !cell)) continue;

        const plan: Partial<ImportarPlanEstudiosDto> = {};

        headers.forEach((header, index) => {
          const mappedKey = COLUMN_MAPPING[header];
          if (mappedKey && row[index] !== undefined && row[index] !== null) {
            const value = String(row[index]).trim();

            if (mappedKey === "duracionMeses") {
              const numValue = parseInt(value);
              if (!isNaN(numValue)) {
                (plan as Record<string, number>)[mappedKey] = numValue;
              }
            } else {
              (plan as Record<string, string>)[mappedKey] = value;
            }
          }
        });

        if (plan.clavePlanEstudios && plan.nombrePlanEstudios && plan.claveCampus) {
          mapped.push(plan as ImportarPlanEstudiosDto);
        }
      }

      if (mapped.length === 0) {
        toast.error("No se encontraron planes válidos en el archivo");
        return;
      }

      setPlanesList(mapped);
      setStep("preview");
      toast.success(`Se cargaron ${mapped.length} planes de estudio`);
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      toast.error("Error al procesar el archivo Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleImportar = async () => {
    setLoading(true);
    setStep("importing");

    try {
      const result = await importacionService.importarPlanesEstudios({
        planes: planesList,
        actualizarExistentes,
      });

      setResultado(result);
      setStep("results");

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.exitosos} planes de estudio exitosamente`);
        onImportSuccess();
      } else {
        toast.warning(
          `Importación completada: ${result.exitosos} exitosos, ${result.fallidos} fallidos`
        );
        if (result.exitosos > 0) {
          onImportSuccess();
        }
      }
    } catch (error) {
      console.error("Error al importar:", error);
      toast.error("Error al importar los planes de estudio");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setPlanesList([]);
    setResultado(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = [
      [
        "ClavePlanEstudios",
        "NombrePlanEstudios",
        "ClaveCampus",
        "NivelEducativo",
        "Periodicidad",
        "DuracionMeses",
        "RVOE",
        "Version",
      ],
      [
        "LIC-ADM-2025",
        "Licenciatura en Administración",
        "USAG-MTY",
        "Licenciatura",
        "Cuatrimestral",
        "36",
        "RVOE-123456",
        "1.0",
      ],
      [
        "LIC-DER-2025",
        "Licenciatura en Derecho",
        "USAG-MTY",
        "Licenciatura",
        "Cuatrimestral",
        "48",
        "RVOE-789012",
        "1.0",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planes");
    XLSX.writeFile(wb, "plantilla_importacion_planes_estudio.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Planes de Estudio desde Archivo
          </DialogTitle>
          <DialogDescription>
            Carga masiva de planes de estudio desde archivo Excel
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>

            <div
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 transition-colors hover:border-primary/50 hover:bg-muted/20"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("plans-file-input")?.click()}
            >
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <>
                  <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 font-medium">Arrastra tu archivo Excel aquí</p>
                  <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                </>
              )}
              <input
                id="plans-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Columnas requeridas</AlertTitle>
              <AlertDescription>
                El archivo debe contener: <strong>ClavePlanEstudios</strong>, <strong>NombrePlanEstudios</strong> y <strong>ClaveCampus</strong>.
                Opcionalmente: NivelEducativo, Periodicidad, DuracionMeses, RVOE, Version.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-600">Importante</AlertTitle>
              <AlertDescription>
                La <strong>ClaveCampus</strong> debe coincidir exactamente con la clave del campus ya registrado en el sistema.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{planesList.length} planes a importar</Badge>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actualizar-planes"
                  checked={actualizarExistentes}
                  onCheckedChange={(checked) => setActualizarExistentes(checked === true)}
                />
                <Label htmlFor="actualizar-planes" className="cursor-pointer text-sm">
                  Actualizar existentes
                </Label>
              </div>
            </div>

            <div className="max-h-[300px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planesList.map((plan, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{plan.clavePlanEstudios}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={plan.nombrePlanEstudios}>
                        {plan.nombrePlanEstudios}
                      </TableCell>
                      <TableCell className="font-mono">{plan.claveCampus}</TableCell>
                      <TableCell>{plan.nivelEducativo ?? "-"}</TableCell>
                      <TableCell>{plan.duracionMeses ? `${plan.duracionMeses} meses` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleImportar} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                Importar {planesList.length} Planes
              </Button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Importando planes de estudio...</p>
            <p className="text-sm text-muted-foreground">Por favor espera</p>
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && resultado && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-sm text-muted-foreground">Procesados</p>
                <p className="text-2xl font-bold">{resultado.totalProcesados}</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-950">
                <p className="text-sm text-green-600">Creados</p>
                <p className="text-2xl font-bold text-green-600">{resultado.exitosos}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm text-blue-600">Actualizados</p>
                <p className="text-2xl font-bold text-blue-600">{resultado.actualizados}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-950">
                <p className="text-sm text-red-600">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">{resultado.fallidos}</p>
              </div>
            </div>

            {resultado.fallidos === 0 ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Importación Exitosa</AlertTitle>
                <AlertDescription>
                  Todos los planes de estudio fueron importados correctamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Importación con Errores</AlertTitle>
                <AlertDescription>
                  Algunos planes no pudieron ser importados.
                </AlertDescription>
              </Alert>
            )}

            {/* Detalle */}
            <div className="max-h-[250px] overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Fila</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Mensaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.resultados.map((res) => (
                    <TableRow key={res.fila}>
                      <TableCell>{res.fila}</TableCell>
                      <TableCell className="font-mono">{res.clavePlanEstudios}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{res.nombrePlanEstudios}</TableCell>
                      <TableCell>
                        {res.exito ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="mr-1 h-3 w-3" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="mr-1 h-3 w-3" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={res.exito ? "text-green-600" : "text-red-600"}>
                        {res.mensaje}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                <Upload className="mr-2 h-4 w-4" />
                Nueva Importación
              </Button>
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
