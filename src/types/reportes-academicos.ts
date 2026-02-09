export interface EstudianteGrupoItem {
  idEstudiante: number;
  matricula: string;
  nombreCompleto: string;
  email: string | null;
  telefono: string | null;
  estado: string;
}

export interface ReporteEstudiantesGrupo {
  nombreGrupo: string;
  planEstudios: string;
  periodoAcademico: string;
  turno: string;
  totalEstudiantes: number;
  estudiantes: EstudianteGrupoItem[];
}

export interface MateriaBoletaItem {
  claveMateria: string;
  nombreMateria: string;
  creditos: number;
  p1: number | null;
  p2: number | null;
  p3: number | null;
  calificacionFinal: number | null;
  estado: string | null;
}

export interface BoletaCalificaciones {
  matricula: string;
  nombreEstudiante: string;
  planEstudios: string;
  periodoAcademico: string;
  campus: string | null;
  materias: MateriaBoletaItem[];
  promedioGeneral: number;
}

export interface GrupoOption {
  idGrupo: number;
  nombreGrupo: string;
  planEstudios: string;
  periodoAcademico: string;
}

export interface GrupoMateriaOption {
  idGrupoMateria: number;
  nombre: string;
  materia: string;
  grupo: string;
}

export interface ProfesorOption {
  idProfesor: number;
  nombre: string;
  noEmpleado: string;
}

export interface ParcialOption {
  id: number;
  name: string;
  orden: number;
}
