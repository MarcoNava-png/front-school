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
  type ImportarCampusDto,
  type ImportarCampusResponse,
} from "@/services/importacion-service";

interface ImportCampusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

const COLUMN_MAPPING: Record<string, keyof ImportarCampusDto> = {
  clavecampus: "claveCampus",
  clave: "claveCampus",
  "clave campus": "claveCampus",
  nombre: "nombre",
  "nombre campus": "nombre",
  calle: "calle",
  direccion: "calle",
  dirección: "calle",
  numeroexterior: "numeroExterior",
  "numero exterior": "numeroExterior",
  "num ext": "numeroExterior",
  "no. ext": "numeroExterior",
  numerointerior: "numeroInterior",
  "numero interior": "numeroInterior",
  "num int": "numeroInterior",
  "no. int": "numeroInterior",
  codigopostal: "codigoPostal",
  "codigo postal": "codigoPostal",
  cp: "codigoPostal",
  colonia: "colonia",
  asentamiento: "colonia",
  telefono: "telefono",
  teléfono: "telefono",
  tel: "telefono",
  "tel.": "telefono",
  phone: "telefono",
};

type Step = "upload" | "preview" | "importing" | "results";

export function ImportCampusModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportCampusModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [campusList, setCampusList] = useState<ImportarCampusDto[]>([]);
  const [resultado, setResultado] = useState<ImportarCampusResponse | null>(null);
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

      const headers = (jsonData[0]).map((h) => String(h).toLowerCase().trim());
      const rows = jsonData.slice(1);

      const mapped: ImportarCampusDto[] = [];

      for (const row of rows) {
        if (!row || row.every((cell) => !cell)) continue;

        const campus: Partial<ImportarCampusDto> = {};

        headers.forEach((header, index) => {
          const mappedKey = COLUMN_MAPPING[header];
          if (mappedKey && row[index] !== undefined && row[index] !== null) {
            const value = String(row[index]).trim();
            (campus as Record<string, string>)[mappedKey] = value;
          }
        });

        if (campus.claveCampus && campus.nombre) {
          mapped.push(campus as ImportarCampusDto);
        }
      }

      if (mapped.length === 0) {
        toast.error("No se encontraron campus válidos en el archivo");
        return;
      }

      setCampusList(mapped);
      setStep("preview");
      toast.success(`Se cargaron ${mapped.length} campus`);
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
      const result = await importacionService.importarCampus({
        campus: campusList,
        actualizarExistentes,
      });

      setResultado(result);
      setStep("results");

      if (result.fallidos === 0) {
        toast.success(`Se importaron ${result.exitosos} campus exitosamente`);
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
      toast.error("Error al importar los campus");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setCampusList([]);
    setResultado(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = [
      ["ClaveCampus", "Nombre", "Calle", "NumeroExterior", "NumeroInterior", "Telefono", "CodigoPostal", "Colonia"],
      ["USAG-MTY", "Campus Monterrey", "Av. Universidad 123", "456", "A", "8181234567", "64000", "Centro"],
      ["USAG-GDL", "Campus Guadalajara", "Calle Reforma 789", "100", "", "3312345678", "44100", "Zona Centro"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campus");
    XLSX.writeFile(wb, "plantilla_importacion_campus.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Campus desde Archivo
          </DialogTitle>
          <DialogDescription>
            Carga masiva de campus desde archivo Excel
          </DialogDescription>
        </DialogHeader>
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
              onClick={() => document.getElementById("campus-file-input")?.click()}
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
                id="campus-file-input"
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
                El archivo debe contener las columnas: <strong>ClaveCampus</strong> y <strong>Nombre</strong>.
                Opcionalmente: Calle, NumeroExterior, NumeroInterior, CodigoPostal.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{campusList.length} campus a importar</Badge>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actualizar-campus"
                  checked={actualizarExistentes}
                  onCheckedChange={(checked) => setActualizarExistentes(checked === true)}
                />
                <Label htmlFor="actualizar-campus" className="cursor-pointer text-sm">
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
                    <TableHead>Dirección</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Colonia</TableHead>
                    <TableHead>CP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campusList.map((campus, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono">{campus.claveCampus}</TableCell>
                      <TableCell>{campus.nombre}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {[campus.calle, campus.numeroExterior].filter(Boolean).join(" ") || "-"}
                      </TableCell>
                      <TableCell>{campus.telefono ?? "-"}</TableCell>
                      <TableCell>{campus.colonia ?? "-"}</TableCell>
                      <TableCell>{campus.codigoPostal ?? "-"}</TableCell>
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
                Importar {campusList.length} Campus
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-medium">Importando campus...</p>
            <p className="text-sm text-muted-foreground">Por favor espera</p>
          </div>
        )}

        {step === "results" && resultado && (
          <div className="space-y-4">
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
                  Todos los campus fueron importados correctamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Importación con Errores</AlertTitle>
                <AlertDescription>
                  Algunos campus no pudieron ser importados.
                </AlertDescription>
              </Alert>
            )}

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
                      <TableCell className="font-mono">{res.claveCampus}</TableCell>
                      <TableCell>{res.nombre}</TableCell>
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
