import {
  GrupoMateria,
  InscripcionGrupoMateriaRequest,
  InscripcionGrupoMateriaResponse,
  KardexData,
  MateriaKardex,
  PayloadCreateStudent,
  Student,
  StudentDetails,
  StudentsResponse,
} from "@/types/student";

import apiClient from "./api-client";

export async function getStudentsList(page?: number, pageSize?: number): Promise<StudentsResponse> {
  const { data } = await apiClient.get<StudentsResponse>(`/estudiantes?page=${page ?? 1}&pageSize=${pageSize ?? 20}`);
  return data;
}

export async function createStudent(payload: PayloadCreateStudent): Promise<Student> {
  const { data } = await apiClient.post<Student>(`/estudiantes`, payload);
  return data;
}

export async function getStudentById(studentId: number): Promise<StudentDetails> {
  const { data } = await apiClient.get<StudentDetails>(`/estudiantes/${studentId}`);
  return data;
}

export async function getStudent(studentId: number): Promise<Student> {
  const { data } = await apiClient.get<Student>(`/estudiantes/${studentId}`);
  return data;
}

export async function getStudentByMatricula(matricula: string): Promise<Student> {
  const { data } = await apiClient.get<Student>(`/estudiantes/matricula/${matricula}`);
  return data;
}

export async function enrollStudent(data: { idEstudiante: number; matricula: string }): Promise<unknown> {
  return await apiClient.put<unknown>(`/estudiantes/matricular`, data);
}

export async function getAvailableGruposMaterias(
  idEstudiante?: number,
  idPeriodoAcademico?: number,
): Promise<GrupoMateria[]> {
  const params = new URLSearchParams();

  if (idEstudiante) {
    params.append("idEstudiante", idEstudiante.toString());
  }

  if (idPeriodoAcademico) {
    params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  }

  const { data } = await apiClient.get<GrupoMateria[]>(`/grupos/gruposmaterias/disponibles?${params.toString()}`);
  return data;
}

export async function enrollStudentInGrupoMateria(
  request: InscripcionGrupoMateriaRequest,
): Promise<InscripcionGrupoMateriaResponse> {
  const { data } = await apiClient.post<InscripcionGrupoMateriaResponse>(`/inscripciones/grupomateria`, request);
  return data;
}

export async function getStudentInscripciones(idEstudiante: number): Promise<InscripcionGrupoMateriaResponse[]> {
  const { data } = await apiClient.get<InscripcionGrupoMateriaResponse[]>(
    `/inscripciones/estudiante/${idEstudiante}`,
  );
  return data;
}

export async function getStudentsByGrupoMateria(idGrupoMateria: number): Promise<Student[]> {
  const { data } = await apiClient.get<Student[]>(`/grupos/gruposmaterias/${idGrupoMateria}/estudiantes`);
  return data;
}

export async function getStudentsByGrupo(idGrupo: number): Promise<Student[]> {
  const { data } = await apiClient.get<{ estudiantes: Student[] }>(`/grupos/${idGrupo}/estudiantes`);
  return data.estudiantes;
}

export async function getKardexEstudiante(idEstudiante: number): Promise<KardexData> {
  // Get student basic info
  const estudiante = await getStudent(idEstudiante);

  // Get all inscriptions for the student
  const inscripciones = await getStudentInscripciones(idEstudiante);

  // TODO: For now, using mock data structure until backend provides complete kárdex endpoint
  // In the future, we should fetch calificaciones for each inscripcion and aggregate
  // const calificacionesPromises = inscripciones.map(i => getConcentradoAlumno(i.idInscripcion));
  // const calificaciones = await Promise.all(calificacionesPromises);

  // Mock data transformation for demonstration
  const materias: MateriaKardex[] = inscripciones.map((inscripcion) => ({
    idInscripcion: inscripcion.idInscripcion,
    nombreMateria: inscripcion.nombreMateria,
    claveMateria: inscripcion.nombreMateria.substring(0, 6).toUpperCase(), // Mock clave
    creditos: 6, // Mock credits
    grupo: inscripcion.grupo,
    periodoAcademico: "2024", // Mock period
    calificacionFinal: null, // Will be fetched from calificaciones API
    estatus: inscripcion.estado === "Inscrito" ? "Cursando" : "Aprobada",
    parciales: {},
  }));

  // Calculate statistics from mock data
  const materiasAprobadas = materias.filter((m) => m.estatus === "Aprobada").length;
  const materiasReprobadas = materias.filter((m) => m.estatus === "Reprobada").length;
  const materiasCursando = materias.filter((m) => m.estatus === "Cursando").length;

  return {
    estudiante,
    materiasTotal: materias.length,
    materiasAprobadas,
    materiasReprobadas,
    materiasCursando,
    creditosAcumulados: materiasAprobadas * 6, // Mock: 6 credits per subject
    creditosTotal: materias.length * 6, // Mock total
    promedioGeneral: 0, // Will be calculated from calificaciones
    materias,
    puedeReinscribirse: true, // Will be determined by validation rules
    motivosBloqueo: [],
  };
}
