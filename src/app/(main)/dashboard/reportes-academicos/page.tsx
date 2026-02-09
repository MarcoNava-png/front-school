"use client";

import { useEffect, useState } from "react";

import {
  BookOpen,
  ClipboardList,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  descargarEstudiantesGrupoPdf,
  descargarEstudiantesGrupoExcel,
  descargarBoletaPdf,
  descargarActaPdf,
  descargarHorarioGrupoPdf,
  descargarHorarioGrupoExcel,
  descargarHorarioDocentePdf,
  descargarHorarioDocenteExcel,
  descargarListaAsistenciaPdf,
  descargarPlanesEstudioExcel,
  descargarBlob,
  getGrupos,
  getPeriodosAcademicos,
  getGrupoMaterias,
  getParciales,
  getProfesores,
  getEstudiantes,
} from "@/services/reportes-academicos-service";

interface PeriodoAcademico {
  idPeriodoAcademico: number;
  nombre: string;
  esPeriodoActual: boolean;
}

interface GrupoItem {
  idGrupo: number;
  nombreGrupo: string;
  planEstudios?: string;
}

interface GrupoMateriaItem {
  idGrupoMateria: number;
  materia?: string;
  nombre?: string;
}

interface ParcialItem {
  id: number;
  name: string;
}

interface ProfesorItem {
  idProfesor: number;
  nombre?: string;
  noEmpleado?: string;
  persona?: { nombre: string; apellidoPaterno: string };
}

interface EstudianteItem {
  idEstudiante: number;
  matricula: string;
  persona?: { nombre: string; apellidoPaterno: string; apellidoMaterno: string };
}

export default function ReportesAcademicosPage() {
  // ─── Catálogos ───
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [grupoMaterias, setGrupoMaterias] = useState<GrupoMateriaItem[]>([]);
  const [parciales, setParciales] = useState<ParcialItem[]>([]);
  const [profesores, setProfesores] = useState<ProfesorItem[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);

  // ─── Selecciones ───
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [selectedGrupoMateria, setSelectedGrupoMateria] = useState("");
  const [selectedParcial, setSelectedParcial] = useState("");
  const [selectedProfesor, setSelectedProfesor] = useState("");
  const [selectedEstudiante, setSelectedEstudiante] = useState("");

  // Sub-tabs for horarios
  const [horarioTab, setHorarioTab] = useState("grupo");

  // ─── Loading states ───
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // ─── Load catálogos on mount ───
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [periodosRes, parcialesRes, profesoresRes] = await Promise.all([
          getPeriodosAcademicos(),
          getParciales(),
          getProfesores(),
        ]);
        setPeriodos(Array.isArray(periodosRes) ? periodosRes : periodosRes?.items ?? periodosRes?.data ?? []);
        setParciales(Array.isArray(parcialesRes) ? parcialesRes : parcialesRes?.items ?? []);
        setProfesores(Array.isArray(profesoresRes) ? profesoresRes : profesoresRes?.items ?? profesoresRes?.data ?? []);
      } catch {
        toast.error("Error al cargar catálogos");
      } finally {
        setLoadingCatalogos(false);
      }
    };
    loadCatalogos();
  }, []);

  // ─── Load grupos when periodo changes ───
  useEffect(() => {
    if (!selectedPeriodo) return;
    const loadGrupos = async () => {
      try {
        const res = await getGrupos(Number(selectedPeriodo));
        setGrupos(Array.isArray(res) ? res : res?.items ?? res?.data ?? []);
      } catch {
        toast.error("Error al cargar grupos");
      }
    };
    loadGrupos();
  }, [selectedPeriodo]);

  // ─── Load grupo materias when grupo changes ───
  useEffect(() => {
    if (!selectedGrupo) return;
    const load = async () => {
      try {
        const res = await getGrupoMaterias(Number(selectedGrupo));
        setGrupoMaterias(Array.isArray(res) ? res : res?.items ?? []);
      } catch {
        toast.error("Error al cargar materias del grupo");
      }
    };
    load();
  }, [selectedGrupo]);

  // ─── Load estudiantes when periodo changes (for boleta) ───
  useEffect(() => {
    if (!selectedPeriodo) return;
    const load = async () => {
      try {
        const res = await getEstudiantes(1, 2000);
        setEstudiantes(Array.isArray(res) ? res : res?.items ?? res?.data ?? []);
      } catch {
        // ignore
      }
    };
    load();
  }, [selectedPeriodo]);

  // ─── Download handler ───
  const handleDownload = async (fn: () => Promise<Blob>, filename: string) => {
    setLoading(true);
    try {
      const blob = await fn();
      descargarBlob(blob, filename);
      toast.success("Archivo descargado exitosamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al generar el reporte";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fechaActual = new Date().toISOString().slice(0, 10);

  const getNombreProfesor = (prof: ProfesorItem) => {
    if (prof.persona) return `${prof.persona.nombre} ${prof.persona.apellidoPaterno}`;
    return prof.nombre ?? prof.noEmpleado ?? `Profesor ${prof.idProfesor}`;
  };

  const getNombreEstudiante = (est: EstudianteItem) => {
    if (est.persona) return `${est.matricula} - ${est.persona.nombre} ${est.persona.apellidoPaterno} ${est.persona.apellidoMaterno ?? ""}`.trim();
    return est.matricula;
  };

  if (loadingCatalogos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando catálogos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Reportes Académicos
        </h1>
        <p className="text-muted-foreground">
          Genera reportes de estudiantes, calificaciones, horarios y más.
        </p>
      </div>

      {/* Selector de periodo global */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-sm">
              <Label>Periodo Académico</Label>
              <Select value={selectedPeriodo} onValueChange={(v) => { setSelectedPeriodo(v); setSelectedGrupo(""); setSelectedGrupoMateria(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar periodo..." />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((p) => (
                    <SelectItem key={p.idPeriodoAcademico} value={p.idPeriodoAcademico.toString()}>
                      {p.nombre} {p.esPeriodoActual && "(Actual)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="estudiantes">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="estudiantes" className="flex items-center gap-1">
            <Users className="w-4 h-4" /> Estudiantes
          </TabsTrigger>
          <TabsTrigger value="boleta" className="flex items-center gap-1">
            <FileText className="w-4 h-4" /> Boleta
          </TabsTrigger>
          <TabsTrigger value="acta" className="flex items-center gap-1">
            <ClipboardList className="w-4 h-4" /> Acta
          </TabsTrigger>
          <TabsTrigger value="horarios" className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> Horarios
          </TabsTrigger>
          <TabsTrigger value="asistencia" className="flex items-center gap-1">
            <ClipboardList className="w-4 h-4" /> Asistencia
          </TabsTrigger>
          <TabsTrigger value="planes" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Planes
          </TabsTrigger>
        </TabsList>

        {/* ────── TAB 1: Estudiantes por Grupo ────── */}
        <TabsContent value="estudiantes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estudiantes por Grupo</CardTitle>
              <CardDescription>Lista de estudiantes inscritos en un grupo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <Label>Grupo</Label>
                <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={!selectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedPeriodo ? "Seleccionar grupo..." : "Primero selecciona un periodo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.idGrupo} value={g.idGrupo.toString()}>
                        {g.nombreGrupo} {g.planEstudios && `- ${g.planEstudios}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={!selectedGrupo || loading}
                  onClick={() => handleDownload(
                    () => descargarEstudiantesGrupoPdf(Number(selectedGrupo)),
                    `Estudiantes_Grupo_${fechaActual}.pdf`
                  )}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Descargar PDF
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedGrupo || loading}
                  onClick={() => handleDownload(
                    () => descargarEstudiantesGrupoExcel(Number(selectedGrupo)),
                    `Estudiantes_Grupo_${fechaActual}.xlsx`
                  )}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                  Descargar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── TAB 2: Boleta de Calificaciones ────── */}
        <TabsContent value="boleta">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Boleta de Calificaciones</CardTitle>
              <CardDescription>Calificaciones parciales y finales del estudiante en el periodo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <Label>Estudiante</Label>
                <Select value={selectedEstudiante} onValueChange={setSelectedEstudiante} disabled={!selectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedPeriodo ? "Seleccionar estudiante..." : "Primero selecciona un periodo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {estudiantes.map((e) => (
                      <SelectItem key={e.idEstudiante} value={e.idEstudiante.toString()}>
                        {getNombreEstudiante(e)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                disabled={!selectedEstudiante || !selectedPeriodo || loading}
                onClick={() => handleDownload(
                  () => descargarBoletaPdf(Number(selectedEstudiante), Number(selectedPeriodo)),
                  `Boleta_${fechaActual}.pdf`
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Generar Boleta PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── TAB 3: Acta de Calificación ────── */}
        <TabsContent value="acta">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acta de Calificación</CardTitle>
              <CardDescription>Acta oficial de calificaciones por materia y parcial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Grupo</Label>
                  <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={!selectedPeriodo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((g) => (
                        <SelectItem key={g.idGrupo} value={g.idGrupo.toString()}>
                          {g.nombreGrupo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Materia</Label>
                  <Select value={selectedGrupoMateria} onValueChange={setSelectedGrupoMateria} disabled={!selectedGrupo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Materia..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grupoMaterias.map((gm) => (
                        <SelectItem key={gm.idGrupoMateria} value={gm.idGrupoMateria.toString()}>
                          {gm.materia ?? gm.nombre ?? `Materia ${gm.idGrupoMateria}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Parcial (opcional)</Label>
                  <Select value={selectedParcial} onValueChange={setSelectedParcial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Final (todos)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Final (todos)</SelectItem>
                      {parciales.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                disabled={!selectedGrupoMateria || loading}
                onClick={() => handleDownload(
                  () => descargarActaPdf(
                    Number(selectedGrupoMateria),
                    selectedParcial && selectedParcial !== "0" ? Number(selectedParcial) : undefined
                  ),
                  `Acta_${fechaActual}.pdf`
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Generar Acta PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── TAB 4: Horarios ────── */}
        <TabsContent value="horarios">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horarios</CardTitle>
              <CardDescription>Horarios de grupo o docente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={horarioTab} onValueChange={setHorarioTab}>
                <TabsList>
                  <TabsTrigger value="grupo">Horario de Grupo</TabsTrigger>
                  <TabsTrigger value="docente">Horario de Docente</TabsTrigger>
                </TabsList>

                <TabsContent value="grupo" className="space-y-4 pt-4">
                  <div className="max-w-sm">
                    <Label>Grupo</Label>
                    <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={!selectedPeriodo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((g) => (
                          <SelectItem key={g.idGrupo} value={g.idGrupo.toString()}>
                            {g.nombreGrupo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      disabled={!selectedGrupo || loading}
                      onClick={() => handleDownload(
                        () => descargarHorarioGrupoPdf(Number(selectedGrupo)),
                        `Horario_Grupo_${fechaActual}.pdf`
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!selectedGrupo || loading}
                      onClick={() => handleDownload(
                        () => descargarHorarioGrupoExcel(Number(selectedGrupo)),
                        `Horario_Grupo_${fechaActual}.xlsx`
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                      Excel
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="docente" className="space-y-4 pt-4">
                  <div className="max-w-sm">
                    <Label>Docente</Label>
                    <Select value={selectedProfesor} onValueChange={setSelectedProfesor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar docente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profesores.map((p) => (
                          <SelectItem key={p.idProfesor} value={p.idProfesor.toString()}>
                            {getNombreProfesor(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      disabled={!selectedProfesor || !selectedPeriodo || loading}
                      onClick={() => handleDownload(
                        () => descargarHorarioDocentePdf(Number(selectedProfesor), Number(selectedPeriodo)),
                        `Horario_Docente_${fechaActual}.pdf`
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!selectedProfesor || !selectedPeriodo || loading}
                      onClick={() => handleDownload(
                        () => descargarHorarioDocenteExcel(Number(selectedProfesor), Number(selectedPeriodo)),
                        `Horario_Docente_${fechaActual}.xlsx`
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                      Excel
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── TAB 5: Lista de Asistencia ────── */}
        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Asistencia</CardTitle>
              <CardDescription>Lista imprimible para pase de asistencia en aula</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Grupo</Label>
                  <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={!selectedPeriodo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((g) => (
                        <SelectItem key={g.idGrupo} value={g.idGrupo.toString()}>
                          {g.nombreGrupo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Materia</Label>
                  <Select value={selectedGrupoMateria} onValueChange={setSelectedGrupoMateria} disabled={!selectedGrupo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Materia..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grupoMaterias.map((gm) => (
                        <SelectItem key={gm.idGrupoMateria} value={gm.idGrupoMateria.toString()}>
                          {gm.materia ?? gm.nombre ?? `Materia ${gm.idGrupoMateria}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                disabled={!selectedGrupoMateria || loading}
                onClick={() => handleDownload(
                  () => descargarListaAsistenciaPdf(Number(selectedGrupoMateria)),
                  `ListaAsistencia_${fechaActual}.pdf`
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Generar Lista PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── TAB 6: Planes de Estudio ────── */}
        <TabsContent value="planes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Planes de Estudio</CardTitle>
              <CardDescription>Exportar malla curricular de todos los planes activos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={loading}
                variant="outline"
                onClick={() => handleDownload(
                  () => descargarPlanesEstudioExcel(),
                  `PlanesEstudio_${fechaActual}.xlsx`
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                Exportar Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los reportes se generan en tiempo real basados en la información de la base de datos.
          Asegúrate de seleccionar el periodo académico correcto para obtener los datos deseados.
        </p>
      </div>
    </div>
  );
}
