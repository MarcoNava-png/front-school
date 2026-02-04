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

export async function getStudentsWithoutGroup(
  idPlanEstudios: number,
  idPeriodoAcademico: number,
  page?: number,
  pageSize?: number
): Promise<StudentsResponse> {
  const params = new URLSearchParams();
  params.append("idPlanEstudios", idPlanEstudios.toString());
  params.append("idPeriodoAcademico", idPeriodoAcademico.toString());
  params.append("page", (page ?? 1).toString());
  params.append("pageSize", (pageSize ?? 1000).toString());
  const { data } = await apiClient.get<StudentsResponse>(`/estudiantes/sin-grupo?${params.toString()}`);
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
  const estudiante = await getStudent(idEstudiante);

  const inscripciones = await getStudentInscripciones(idEstudiante);

  const materias: MateriaKardex[] = inscripciones.map((inscripcion) => ({
    idInscripcion: inscripcion.idInscripcion,
    nombreMateria: inscripcion.nombreMateria,
    claveMateria: inscripcion.nombreMateria.substring(0, 6).toUpperCase(),
    creditos: 6,
    grupo: inscripcion.grupo,
    periodoAcademico: "2024",
    calificacionFinal: null,
    estatus: inscripcion.estado === "Inscrito" ? "Cursando" : "Aprobada",
    parciales: {},
  }));

  const materiasAprobadas = materias.filter((m) => m.estatus === "Aprobada").length;
  const materiasReprobadas = materias.filter((m) => m.estatus === "Reprobada").length;
  const materiasCursando = materias.filter((m) => m.estatus === "Cursando").length;

  return {
    estudiante,
    materiasTotal: materias.length,
    materiasAprobadas,
    materiasReprobadas,
    materiasCursando,
    creditosAcumulados: materiasAprobadas * 6,
    creditosTotal: materias.length * 6,
    promedioGeneral: 0,
    materias,
    puedeReinscribirse: true,
    motivosBloqueo: [],
  };
}
