import type {
  ResumenAsistencias,
  RegistrarAsistenciaRequest,
  ResumenGrupoMateriaAsistencias,
  AsistenciaEstudiante,
  ValidacionFechaClase,
  DiasClaseMateria,
} from "@/types/asistencia";
import type { DiaSemana } from "@/types/group";

export async function getDiasClaseMateria(idGrupoMateria: number): Promise<DiasClaseMateria> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    idGrupoMateria,
    nombreMateria: "Materia",
    diasSemana: ["Lunes", "Miércoles", "Viernes"],
    horarios: [
      { dia: "Lunes", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
      { dia: "Miércoles", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
      { dia: "Viernes", horaInicio: "08:00", horaFin: "10:00", aula: "A-101" },
    ],
  };
}

export function validarFechaClase(
  fecha: string,
  diasClase: string[]
): ValidacionFechaClase {
  const fechaObj = new Date(fecha + "T00:00:00");
  const diasSemana: DiaSemana[] = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaSemanaNombre = diasSemana[fechaObj.getDay()];

  const esDiaDeClase = diasClase.includes(diaSemanaNombre);

  return {
    esFechaValida: true,
    esDiaDeClase,
    diaSemanaNombre,
    mensaje: esDiaDeClase
      ? `${diaSemanaNombre} es un día de clase válido`
      : `${diaSemanaNombre} NO es un día de clase. Los días de clase son: ${diasClase.join(", ")}`,
  };
}

export async function registrarAsistencias(request: RegistrarAsistenciaRequest): Promise<void> {
  console.log("[Mock] Registrando asistencias:", request);
  await new Promise(resolve => setTimeout(resolve, 500));
}

export async function getAsistenciasPorFecha(
  idGrupoMateria: number,
  fecha: string
): Promise<AsistenciaEstudiante[]> {
  return getAsistenciasPorFechaMock(idGrupoMateria, fecha);
}

export async function getFechasConAsistencias(_idGrupoMateria: number): Promise<string[]> {
  return [
    "2025-11-18",
    "2025-11-20",
    "2025-11-22",
  ];
}

export async function getResumenAsistencias(idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  return getResumenAsistenciasMock(idGrupoMateria);
}

export async function getResumenAsistenciasEstudiante(
  idEstudiante: number,
  _idGrupoMateria?: number
): Promise<ResumenAsistencias[]> {
  return [
    {
      idEstudiante,
      matricula: `2024${String(idEstudiante).padStart(3, '0')}`,
      nombreCompleto: "Estudiante de Prueba",
      totalClases: 20,
      asistencias: 18,
      faltas: 2,
      faltasJustificadas: 1,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 90,
      alerta: false,
    },
  ];
}

export async function getResumenGrupoMateria(idGrupoMateria: number): Promise<ResumenGrupoMateriaAsistencias> {
  return {
    idGrupoMateria,
    nombreMateria: "Materia de ejemplo",
    grupo: "A",
    periodoAcademico: "2024-1",
    totalEstudiantes: 25,
    clasesRegistradas: 20,
    promedioAsistencia: 85,
    estudiantesConAlerta: 3,
  };
}

export async function justificarFalta(
  idAsistencia: number,
  motivo: string
): Promise<void> {
  console.log(`[Mock] Justificando falta ${idAsistencia}: ${motivo}`);
  await new Promise(resolve => setTimeout(resolve, 300));
}

export async function getEstudiantesConAlerta(idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  const resumen = await getResumenAsistenciasMock(idGrupoMateria);
  return resumen.filter(r => r.alerta);
}

export async function getAsistenciasPorFechaMock(
  _idGrupoMateria: number,
  _fecha: string
): Promise<AsistenciaEstudiante[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      idInscripcion: 1,
      idEstudiante: 1,
      matricula: "2024001",
      nombreCompleto: "Juan Pérez Gómez",
      presente: true,
      justificada: false,
      horaRegistro: "08:30:00",
    },
    {
      idInscripcion: 2,
      idEstudiante: 2,
      matricula: "2024002",
      nombreCompleto: "María López García",
      presente: false,
      justificada: true,
      motivoJustificacion: "Cita médica",
      horaRegistro: "08:30:00",
    },
    {
      idInscripcion: 3,
      idEstudiante: 3,
      matricula: "2024003",
      nombreCompleto: "Carlos Ruiz Hernández",
      presente: true,
      justificada: false,
      horaRegistro: "08:35:00",
    },
    {
      idInscripcion: 4,
      idEstudiante: 4,
      matricula: "2024004",
      nombreCompleto: "Ana Martínez Silva",
      presente: null,
      justificada: false,
    },
    {
      idInscripcion: 5,
      idEstudiante: 5,
      matricula: "2024005",
      nombreCompleto: "Luis García Torres",
      presente: false,
      justificada: false,
      horaRegistro: "08:30:00",
    },
  ];
}

export async function getResumenAsistenciasMock(_idGrupoMateria: number): Promise<ResumenAsistencias[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      idEstudiante: 1,
      matricula: "2024001",
      nombreCompleto: "Juan Pérez Gómez",
      totalClases: 20,
      asistencias: 18,
      faltas: 2,
      faltasJustificadas: 1,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 90,
      alerta: false,
    },
    {
      idEstudiante: 2,
      matricula: "2024002",
      nombreCompleto: "María López García",
      totalClases: 20,
      asistencias: 19,
      faltas: 1,
      faltasJustificadas: 1,
      faltasInjustificadas: 0,
      porcentajeAsistencia: 95,
      alerta: false,
    },
    {
      idEstudiante: 3,
      matricula: "2024003",
      nombreCompleto: "Carlos Ruiz Hernández",
      totalClases: 20,
      asistencias: 14,
      faltas: 6,
      faltasJustificadas: 2,
      faltasInjustificadas: 4,
      porcentajeAsistencia: 70,
      alerta: true,
    },
    {
      idEstudiante: 4,
      matricula: "2024004",
      nombreCompleto: "Ana Martínez Silva",
      totalClases: 20,
      asistencias: 17,
      faltas: 3,
      faltasJustificadas: 2,
      faltasInjustificadas: 1,
      porcentajeAsistencia: 85,
      alerta: false,
    },
    {
      idEstudiante: 5,
      matricula: "2024005",
      nombreCompleto: "Luis García Torres",
      totalClases: 20,
      asistencias: 12,
      faltas: 8,
      faltasJustificadas: 1,
      faltasInjustificadas: 7,
      porcentajeAsistencia: 60,
      alerta: true,
    },
  ];
}
