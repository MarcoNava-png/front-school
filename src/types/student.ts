import { PaginatedResponse } from "./paginated-response";

export interface Student {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  telefono: string | null;
  planEstudios: string;
  email?: string;
  fechaIngreso?: string;
  activo?: boolean;
  idPlanActual?: number;
}

export interface StudentDetails extends Student {
  materias: string[];
}

export interface PayloadCreateStudent {
  matricula: string;
  idPersona: number;
  fechaIngreso: string;
  idPlanActual: number;
  activo: boolean;
}

export interface GrupoMateria {
  idGrupoMateria: number;
  idGrupo: number;
  idMateriaPlan: number;
  nombreMateria: string;
  claveMateria: string;
  grupo: string;
  nombreProfesor?: string;
  cupoMaximo: number;
  inscritos: number;
  disponibles: number;
  periodoAcademico: string;
  horario?: string;
}

export interface InscripcionGrupoMateriaRequest {
  idEstudiante: number;
  idGrupoMateria: number;
  fechaInscripcion?: string;
}

export interface InscripcionGrupoMateriaResponse {
  idInscripcion: number;
  idEstudiante: number;
  idGrupoMateria: number;
  nombreMateria: string;
  grupo: string;
  fechaInscripcion: string;
  estado: string;
}

export type StudentsResponse = PaginatedResponse<Student>;

export interface MateriaKardex {
  idInscripcion: number;
  nombreMateria: string;
  claveMateria: string;
  creditos: number;
  grupo: string;
  periodoAcademico: string;
  calificacionFinal: number | null;
  estatus: "Aprobada" | "Reprobada" | "Cursando";
  parciales: {
    p1?: number;
    p2?: number;
    p3?: number;
  };
}

export interface KardexData {
  estudiante: Student;
  materiasTotal: number;
  materiasAprobadas: number;
  materiasReprobadas: number;
  materiasCursando: number;
  creditosAcumulados: number;
  creditosTotal: number;
  promedioGeneral: number;
  materias: MateriaKardex[];
  puedeReinscribirse: boolean;
  motivosBloqueo: string[];
}
