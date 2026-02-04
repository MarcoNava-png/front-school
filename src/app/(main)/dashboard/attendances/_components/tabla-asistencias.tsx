"use client";

import { useState, useEffect } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getAsistenciasPorFecha,
  getResumenAsistencias,
  registrarAsistencias,
  getDiasClaseMateria,
  validarFechaClase,
} from "@/services/asistencias-service";
import type { AsistenciaEstudiante, ResumenAsistencias } from "@/types/asistencia";

interface TablaAsistenciasProps {
  grupoMateriaId: number;
  nombreGrupo: string;
  nombreMateria: string;
  onClose: () => void;
}

export function TablaAsistencias({
  grupoMateriaId,
  nombreGrupo,
  nombreMateria,
  onClose,
}: TablaAsistenciasProps) {
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(format(new Date(), "yyyy-MM-dd"));
  const [asistencias, setAsistencias] = useState<AsistenciaEstudiante[]>([]);
  const [resumen, setResumen] = useState<ResumenAsistencias[]>([]);
  const [vistaActual, setVistaActual] = useState<"diaria" | "resumen">("diaria");
  const [estudianteJustificacion, setEstudianteJustificacion] = useState<{
    inscripcion: number;
    nombre: string;
  } | null>(null);
  const [motivoJustificacion, setMotivoJustificacion] = useState("");
  const [diasClase, setDiasClase] = useState<string[]>([]);
  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState("");

  useEffect(() => {
    loadDiasClase();
  }, [grupoMateriaId]);

  useEffect(() => {
    if (diasClase.length > 0) {
      const validacion = validarFechaClase(fechaSeleccionada, diasClase);
      setFechaInvalida(!validacion.esDiaDeClase);
      setMensajeValidacion(validacion.mensaje);
    }
  }, [fechaSeleccionada, diasClase]);

  useEffect(() => {
    if (vistaActual === "diaria") {
      loadAsistenciasDiarias();
    } else {
      loadResumen();
    }
  }, [vistaActual, fechaSeleccionada, grupoMateriaId]);

  const loadDiasClase = async () => {
    try {
      const data = await getDiasClaseMateria(grupoMateriaId);
      setDiasClase(data.diasSemana);
    } catch (error) {
      console.error("Error al cargar días de clase:", error);
      setDiasClase(["Lunes", "Miércoles", "Viernes"]);
    }
  };

  const loadAsistenciasDiarias = async () => {
    setLoading(true);
    try {
      const data = await getAsistenciasPorFecha(grupoMateriaId, fechaSeleccionada);
      setAsistencias(data);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    setLoading(true);
    try {
      const data = await getResumenAsistencias(grupoMateriaId);
      setResumen(data);
    } catch (error) {
      console.error("Error al cargar resumen:", error);
      setResumen([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsistencia = (idInscripcion: number) => {
    setAsistencias((prev) =>
      prev.map((est) => {
        if (est.idInscripcion === idInscripcion) {
          let nuevoEstado: boolean | null = null;
          if (est.presente === null) {
            nuevoEstado = true;
          } else if (est.presente === true) {
            nuevoEstado = false;
          } else {
            nuevoEstado = null;
          }
          return { ...est, presente: nuevoEstado };
        }
        return est;
      })
    );
  };

  const abrirJustificacion = (idInscripcion: number, nombre: string) => {
    setEstudianteJustificacion({ inscripcion: idInscripcion, nombre });
    setMotivoJustificacion("");
  };

  const guardarJustificacion = () => {
    if (!motivoJustificacion.trim()) {
      toast.error("Ingresa un motivo de justificación");
      return;
    }

    setAsistencias((prev) =>
      prev.map((est) => {
        if (est.idInscripcion === estudianteJustificacion?.inscripcion) {
          return {
            ...est,
            justificada: true,
            motivoJustificacion: motivoJustificacion,
          };
        }
        return est;
      })
    );

    toast.success("Justificación guardada");
    setEstudianteJustificacion(null);
    setMotivoJustificacion("");
  };

  const guardarAsistencias = async () => {
    if (fechaInvalida) {
      toast.error(mensajeValidacion);
      return;
    }

    const asistenciasRegistradas = asistencias.filter((a) => a.presente !== null);

    if (asistenciasRegistradas.length === 0) {
      toast.error("No hay asistencias registradas para guardar");
      return;
    }

    try {
      await registrarAsistencias({
        idGrupoMateria: grupoMateriaId,
        fecha: fechaSeleccionada,
        asistencias: asistenciasRegistradas.map((a) => ({
          idInscripcion: a.idInscripcion,
          presente: a.presente!,
          justificada: a.justificada,
          motivoJustificacion: a.motivoJustificacion,
        })),
      });

      toast.success(`Asistencias guardadas correctamente (${asistenciasRegistradas.length} estudiantes)`);

      await loadAsistenciasDiarias();
    } catch (error) {
      console.error("Error al guardar asistencias:", error);
      toast.error("Error al guardar las asistencias");
    }
  };

  const marcarTodosPresentes = () => {
    setAsistencias((prev) => prev.map((est) => ({ ...est, presente: true })));
    toast.success("Todos marcados como presentes");
  };

  const calcularEstadisticasDiarias = () => {
    const total = asistencias.length;
    const presentes = asistencias.filter((a) => a.presente === true).length;
    const ausentes = asistencias.filter((a) => a.presente === false).length;
    const noRegistrados = asistencias.filter((a) => a.presente === null).length;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

    return { total, presentes, ausentes, noRegistrados, porcentaje };
  };

  const stats = calcularEstadisticasDiarias();

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{nombreMateria}</h1>
            <p className="text-gray-600">Grupo: {nombreGrupo}</p>
          </div>
        </div>
        <Button onClick={() => toast.info("Exportación en desarrollo")} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as "diaria" | "resumen")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diaria">Asistencia Diaria</TabsTrigger>
          <TabsTrigger value="resumen">Resumen General</TabsTrigger>
        </TabsList>

        <TabsContent value="diaria" className="space-y-6">
          {diasClase.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Días de clase:{" "}
                    <span className="font-bold">{diasClase.join(", ")}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-gray-500 mt-1">Estudiantes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Presentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.presentes}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.porcentaje}% del total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Ausentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.ausentes}</div>
                <p className="text-xs text-gray-500 mt-1">Faltas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Sin Registrar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.noRegistrados}</div>
                <p className="text-xs text-gray-500 mt-1">Pendientes</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fechaSeleccionada}
                      onChange={(e) => setFechaSeleccionada(e.target.value)}
                      className={`w-48 ${fechaInvalida ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="pt-6 space-y-1">
                    <Badge variant="outline" className="text-sm">
                      {format(new Date(fechaSeleccionada), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                    </Badge>
                    {fechaInvalida && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{mensajeValidacion}</span>
                      </div>
                    )}
                    {!fechaInvalida && diasClase.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Día de clase válido</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={marcarTodosPresentes}
                    size="sm"
                    disabled={fechaInvalida}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar todos presentes
                  </Button>
                  <Button
                    onClick={guardarAsistencias}
                    size="sm"
                    className="gap-2"
                    disabled={fechaInvalida}
                  >
                    <Save className="w-4 h-4" />
                    Guardar asistencias
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Asistencia</CardTitle>
              <CardDescription>
                Haz clic en cada estudiante para marcar asistencia: ✓ Presente | ✗ Ausente | - Sin registrar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando asistencias...</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Matrícula</TableHead>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead className="text-center w-32">Estado</TableHead>
                        <TableHead className="text-center w-32">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asistencias.map((estudiante) => (
                        <TableRow key={estudiante.idInscripcion} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">{estudiante.matricula}</TableCell>
                          <TableCell className="font-medium">{estudiante.nombreCompleto}</TableCell>
                          <TableCell className="text-center">
                            <div
                              className="inline-flex items-center justify-center cursor-pointer"
                              onClick={() => toggleAsistencia(estudiante.idInscripcion)}
                            >
                              {estudiante.presente === true ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Presente
                                </Badge>
                              ) : estudiante.presente === false ? (
                                <Badge
                                  variant="destructive"
                                  className={`${estudiante.justificada ? "bg-orange-100 text-orange-800 border-orange-300" : ""} hover:bg-red-200 cursor-pointer`}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  {estudiante.justificada ? "Justificada" : "Ausente"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                                  -
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {estudiante.presente === false && !estudiante.justificada && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  abrirJustificacion(estudiante.idInscripcion, estudiante.nombreCompleto)
                                }
                              >
                                Justificar
                              </Button>
                            )}
                            {estudiante.justificada && estudiante.motivoJustificacion && (
                              <div className="text-xs text-gray-600 truncate max-w-[200px]" title={estudiante.motivoJustificacion}>
                                {estudiante.motivoJustificacion}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resumen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resumen de Asistencias
              </CardTitle>
              <CardDescription>Estadísticas acumuladas de todo el periodo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando resumen...</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Matrícula</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-center">Total Clases</TableHead>
                        <TableHead className="text-center">Asistencias</TableHead>
                        <TableHead className="text-center">Faltas</TableHead>
                        <TableHead className="text-center">Justificadas</TableHead>
                        <TableHead className="text-center">%</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumen.map((est) => (
                        <TableRow key={est.idEstudiante} className={est.alerta ? "bg-red-50" : ""}>
                          <TableCell className="font-mono text-sm">{est.matricula}</TableCell>
                          <TableCell className="font-medium">{est.nombreCompleto}</TableCell>
                          <TableCell className="text-center">{est.totalClases}</TableCell>
                          <TableCell className="text-center text-green-600 font-semibold">
                            {est.asistencias}
                          </TableCell>
                          <TableCell className="text-center text-red-600 font-semibold">
                            {est.faltas}
                          </TableCell>
                          <TableCell className="text-center text-orange-600">
                            {est.faltasJustificadas}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getColorByPercentage(est.porcentajeAsistencia)}`}>
                              {est.porcentajeAsistencia}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {est.alerta ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Alerta
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!estudianteJustificacion} onOpenChange={() => setEstudianteJustificacion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificar Falta</DialogTitle>
            <DialogDescription>
              Estudiante: {estudianteJustificacion?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la justificación</Label>
              <Textarea
                id="motivo"
                placeholder="Ej: Cita médica, trámite personal, etc."
                value={motivoJustificacion}
                onChange={(e) => setMotivoJustificacion(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEstudianteJustificacion(null)}>
              Cancelar
            </Button>
            <Button onClick={guardarJustificacion}>Guardar Justificación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
